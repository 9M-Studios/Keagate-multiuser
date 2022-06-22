"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typebox_1 = require("@sinclair/typebox");
const auth_1 = __importDefault(require("../middlewares/auth"));
const Solana_1 = __importDefault(require("../transactionalWallets/Solana"));
const utils_1 = require("../utils");
const CreatePaymentBody = typebox_1.Type.Object({
    currency: typebox_1.Type.String(),
    amount: typebox_1.Type.Number({ minimum: 0 }),
    ipnCallbackUrl: typebox_1.Type.Optional(typebox_1.Type.String({ format: "uri" })),
    invoiceCallbackUrl: typebox_1.Type.Optional(typebox_1.Type.String({ format: "uri" }))
});
const CreatePaymentResponse = typebox_1.Type.Object({
    publicKey: typebox_1.Type.String(),
    amount: typebox_1.Type.Number(),
    expiresAt: typebox_1.Type.String(),
    createdAt: typebox_1.Type.String(),
    updatedAt: typebox_1.Type.String(),
    status: typebox_1.Type.String(),
    id: typebox_1.Type.String(),
    ipnCallbackUrl: typebox_1.Type.Optional(typebox_1.Type.String({ format: "uri" })),
    invoiceCallbackUrl: typebox_1.Type.Optional(typebox_1.Type.String({ format: "uri" })),
    invoiceUrl: typebox_1.Type.String({ format: "uri" }),
    currency: typebox_1.Type.String()
});
const opts = {
    schema: {
        body: CreatePaymentBody,
        response: {
            200: CreatePaymentResponse
        }
    },
    preHandler: auth_1.default
};
function createPaymentRoute(server, activePayments) {
    server.post('/createPayment', opts, async (request, reply) => {
        const { body } = request;
        // Create wallet
        const newWallet = await new Solana_1.default((id) => delete activePayments[id]).fromNew({
            amount: body.amount,
            invoiceCallbackUrl: body.invoiceCallbackUrl,
            ipnCallbackUrl: body.ipnCallbackUrl
        });
        const newWalletDetails = { ...newWallet.getDetails() };
        activePayments[newWalletDetails.id] = newWallet;
        delete newWalletDetails.privateKey;
        delete newWalletDetails.payoutTransactionHash;
        newWalletDetails.invoiceUrl = `/invoice/${newWalletDetails.currency}/${(0, utils_1.encrypt)(newWalletDetails.id)}`;
        reply.status(200).send(newWalletDetails);
    });
}
exports.default = createPaymentRoute;
//# sourceMappingURL=createPayment.js.map
import { FastifyInstance } from "fastify";
import { walletController } from "../controller/wallet.controller";
import { getWalletSchema, transferMoneySchema } from "../schema/wallet.schema";

export async function walletRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      ...getWalletSchema,
    },
    walletController.getUserWalletId
  );
  app.put(
    "/deposit",
    {
      preHandler: [app.authenticate],
      ...transferMoneySchema,
    },
    walletController.userDeposit
  );
  app.put(
    "/withdrawal",
    {
      preHandler: [app.authenticate],
      ...transferMoneySchema,
    },
    walletController.userWithdrawal
  );
}

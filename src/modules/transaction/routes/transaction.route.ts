import { FastifyInstance } from "fastify";
import {
  transactMoneySchema,
  updatePaymentStatusSchema,
} from "../schema/transaction.schema";

import { transactionController } from "../controller/transaction.controller";

export async function transactionRoutes(app: FastifyInstance) {
  app.put(
    "/transact",
    {
      preHandler: [app.authenticate],
      ...transactMoneySchema,
    },
    transactionController.transactUsersMoney
  );
  app.put(
    "/statusUpdate",
    {
      preHandler: [app.authenticate],
      ...updatePaymentStatusSchema,
    },
    transactionController.updatePaymentStatus
  );
}

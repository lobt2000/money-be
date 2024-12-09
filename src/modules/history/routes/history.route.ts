import { FastifyInstance } from "fastify";
import { historyController } from "../controller/history.controller";
import {
  SearchHistorySchema,
  UserHistorySchema,
} from "../schema/history.schema";

export async function historyRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [app.authenticate], ...SearchHistorySchema },
    historyController.getHistory
  );
  app.get(
    "/:id",
    { preHandler: [app.authenticate], ...UserHistorySchema },
    historyController.getUserHistory
  );
}

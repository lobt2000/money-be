import { FastifyReply, FastifyRequest } from "fastify";
import { historyService } from "../services/history.service";
import { ITransactHistory } from "../../../interfaces/history.interface";
import { ParamsType } from "../schema/history.schema";

class HistoryController {
  async getHistory(
    req: FastifyRequest<{ Querystring: ParamsType }>,
    reply: FastifyReply
  ) {
    try {
      const historyId = req.query.id;

      const history: ITransactHistory[] = await historyService.getAllHistory(
        req.db,
        historyId
      );

      return reply.code(200).send(history);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async getUserHistory(
    req: FastifyRequest<{ Params: ParamsType }>,
    reply: FastifyReply
  ) {
    try {
      const wallet_id = req.params.id;

      const history = await historyService.getUserHistory(req.db, wallet_id);

      return reply.code(200).send(history);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }
}

export const historyController = new HistoryController();

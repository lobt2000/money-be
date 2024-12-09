import { FastifyInstance } from "fastify";
import { chatController } from "../controller/chat.controller";
import {
  AddMessageSchema,
  ChatSchema,
  CreateChatSchema,
  DeleteChatSchema,
  MessageSchema,
} from "../schema/chat.schema";

export async function chatRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [app.authenticate], ...ChatSchema },
    chatController.getAllChats
  );
  app.get(
    "/message/:id",
    { preHandler: [app.authenticate], ...MessageSchema },
    chatController.getMessagesByChatId
  );

  app.post(
    "/create",
    { preHandler: [app.authenticate], ...CreateChatSchema },
    chatController.createChat
  );

  app.post(
    "/message/add",
    { preHandler: [app.authenticate], ...AddMessageSchema },
    chatController.addMessage
  );
  app.delete(
    "/:id",
    { preHandler: [app.authenticate], ...DeleteChatSchema },
    chatController.deleteChat
  );
}

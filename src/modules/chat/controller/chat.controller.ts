import { FastifyReply, FastifyRequest } from "fastify";
import { chatService } from "../services/chat.service";
import { IUser } from "../../../interfaces/user.interface";
import { ChatModel, MessageModel } from "../../../models/chat.model";
import { CreateChatType, MessageType, ParamsType } from "../schema/chat.schema";
import { userService } from "../../user/services/user.service";
import { emitter } from "../../../emitter/chat-emitter";
import { IChatMessages } from "../../../interfaces/chat.interface";

class ChatController {
  async getAllChats(req: FastifyRequest, reply: FastifyReply) {
    try {
      const chats = await chatService.getUserChats(
        req.db,
        (req.user as IUser).id
      );
      return reply.code(200).send(chats);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async getMessagesByChatId(
    req: FastifyRequest<{ Params: ParamsType; Querystring: { page: number } }>,
    reply: FastifyReply
  ) {
    try {
      const chat_id = req.params.id;
      const { page } = req.query;
      const messages: IChatMessages = await chatService.getUserChatMessage(
        req.db,
        chat_id,
        page
      );
      return reply.code(200).send(messages);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async createChat(
    req: FastifyRequest<{ Body: CreateChatType }>,
    reply: FastifyReply
  ) {
    try {
      const { user_reciever_id } = req.body as CreateChatType;

      const { id } = await userService.getUserById(
        req.db,
        (req.user as IUser).id
      );
      const newChat = new ChatModel(id, user_reciever_id);
      const chat = await chatService.createChat(req.db, newChat);

      return reply.code(201).send(chat);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async addMessage(
    req: FastifyRequest<{ Body: MessageType }>,
    reply: FastifyReply
  ) {
    try {
      const { chat_id, sender_id, text, reciever_id } = req.body as MessageType;
      const newMessage = new MessageModel(text, chat_id, sender_id);
      emitter.emit("room-event", {
        client: reciever_id,
        chat_id,
        message: newMessage,
      });
      await chatService.createMessage(req.db, newMessage);
      return reply.code(201).send(newMessage);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async deleteChat(
    req: FastifyRequest<{ Params: ParamsType }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      await chatService.deleteChat(req.db, id);
      return reply.code(204).send();
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }
}

export const chatController = new ChatController();

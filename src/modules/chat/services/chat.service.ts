import { PostgresDb } from "@fastify/postgres";
import {
  IChat,
  IChatMessages,
  IChatResponse,
  IMessages,
  IMessagesReply,
} from "../../../interfaces/chat.interface";

class ChatService {
  async getChats(
    db: PostgresDb,
    id: string,
    isChat: boolean = false
  ): Promise<IChat[]> {
    return (
      await db.query(
        `SELECT 
          chat.chat_id,
          chat.user1_id,
          chat.user2_id,
          w1.wallet AS wallet_1,
          w2.wallet AS wallet_2,
          chat.last_message_id
        FROM 
            chat
        JOIN 
            users u1 ON chat.user1_id = u1.id
        JOIN 
            wallets w1 ON u1.wallet_id = w1.id
        JOIN 
            users u2 ON chat.user2_id = u2.id
        JOIN 
            wallets w2 ON u2.wallet_id = w2.id
        WHERE 
            ${isChat ? "chat.chat_id = $1" : "u1.id = $1 or u2.id = $1"}`,
        [id]
      )
    ).rows;
  }

  async getUserChats(db: PostgresDb, userId: string): Promise<IChatResponse[]> {
    return await db.transact(async () => {
      const chats = await this.getChats(db, userId);

      const lastMessages: IChatResponse[] = [];
      for (let i = 0; i < chats.length; i++) {
        const currChat = chats[i];
        lastMessages.push({
          ...currChat,
          last_message: currChat.last_message_id
            ? (
                await db.query("Select * from messages where message_id=$1", [
                  currChat.last_message_id,
                ])
              ).rows[0]
            : null,
        } as IChatResponse);
      }

      return lastMessages.sort(
        (a, b) =>
          new Date(a.last_message?.send_date).getDate() -
          new Date(b.last_message?.send_date).getDate()
      );
    });
  }

  async getUserChatMessage(
    db: PostgresDb,
    chat_id: string,
    page: number = 0,
    limit: number = 10
  ): Promise<IChatMessages> {
    return db.transact(async () => {
      const chat_messages: IMessagesReply[] = (
        await db.query(
          `SELECT 
            CAST(DATE_TRUNC('day', send_date::TIMESTAMP) AS VARCHAR) AS date,
            ARRAY_AGG(jsonb_build_object(
                'message_id', message_id,
                'chat_id', chat_id,
                'sender_id', sender_id,
                'text', text,
                'send_date', send_date
            ) ORDER BY send_date) AS messages
        FROM (
            SELECT *
            FROM 
                messages
            WHERE 
                chat_id = $1
            ORDER BY DATE_TRUNC('month', send_date::TIMESTAMP) desc, send_date desc    
            LIMIT $2 OFFSET $3
        )
        GROUP BY 
            date
        ORDER BY 
            date;`,
          [chat_id, limit, page * limit]
        )
      ).rows;

      const { last_page } = (
        await db.query(
          `SELECT CEIL(COUNT(message_id)/10.0) as last_page FROM messages`
        )
      ).rows[0];

      return {
        last_page,
        chat_messages,
      };
    });
  }

  async createChat(db: PostgresDb, body: IChat): Promise<IChat> {
    return await db.transact(async () => {
      const createdChat: IChat = (
        await db.query(
          "INSERT INTO chat(chat_id, user1_id, user2_id, last_message_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [body.chat_id, body.user1_id, body.user2_id, body.last_message_id]
        )
      ).rows[0];

      return (await this.getChats(db, createdChat.chat_id, true))[0];
    });
  }

  async createMessage(db: PostgresDb, body: IMessages): Promise<unknown> {
    return await db.transact(async () => {
      await db.query(
        "INSERT INTO messages( message_id, text, send_date, chat_id, sender_id) VALUES ($1, $2, $3, $4, $5) RETURNING MESSAGE_ID",
        [
          body.message_id,
          body.text,
          body.send_date,
          body.chat_id,
          body.sender_id,
        ]
      );

      await chatService.updateChatLastMessage(
        db,
        body.message_id,
        body.chat_id
      );
    });
  }

  async updateChatLastMessage(
    db: PostgresDb,
    message_id: string,
    chat_id: string
  ): Promise<unknown> {
    return db.query(`Update chat set last_message_id = $1 where chat_id = $2`, [
      message_id,
      chat_id,
    ]);
  }

  async deleteChat(db: PostgresDb, chat_id: string): Promise<unknown> {
    return db.query(`Delete from chat where chat_id = $1`, [chat_id]);
  }
}

export const chatService = new ChatService();

import { IChat, IMessages } from "../interfaces/chat.interface";
import { v7 as uuidv7 } from "uuid";

export class ChatModel implements IChat {
  chat_id = uuidv7();
  user1_id: string;
  user2_id: string;
  last_message_id: string | null = null;

  constructor(user1_id: string, user2_id: string) {
    this.user1_id = user1_id;
    this.user2_id = user2_id;
  }
}

export class MessageModel implements IMessages {
  message_id = uuidv7();
  text: string;
  send_date: string = new Date().toLocaleString();
  chat_id: string;
  sender_id: string;

  constructor(text: string, chat_id: string, sender_id: string) {
    this.text = text;
    this.chat_id = chat_id;
    this.sender_id = sender_id;
  }
}

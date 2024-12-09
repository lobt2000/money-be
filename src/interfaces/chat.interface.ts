export interface IChatResponse {
  chat_id: string;
  user1_id: string;
  user2_id: string;
  wallet_1: string;
  wallet_2: string;
  last_message_id: string | null;
}

export interface IChat {
  chat_id: string;
  user1_id: string;
  user2_id: string;
  last_message_id: string | null;
}

export interface IChatResponse extends IChat {
  last_message: IMessages;
}

export interface IMessages {
  message_id: string;
  text: string;
  send_date: string;
  chat_id: string;
  sender_id: string;
}

export interface IMessagesReply {
  date: string;
  messages: IMessages[];
}

export interface IChatMessages {
  chat_messages: IMessagesReply[];
  last_page: number;
}

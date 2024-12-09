export interface ITransaction {
  id: string;
  reciever_id: string;
  sender_id: string;
  amount: number;
  status: string;
}

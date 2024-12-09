import { ITransaction } from "../interfaces/transact.interface";
import { v7 as uuidv7 } from "uuid";

export class Transactions implements ITransaction {
  id = uuidv7();
  amount: number;
  status: string;
  reciever_id: string;
  sender_id: string;

  constructor(
    amount: number,
    reciever_id: string,
    sender_id: string,
    status: string
  ) {
    this.amount = amount;
    this.reciever_id = reciever_id;
    this.sender_id = sender_id;
    this.status = status;
  }
}

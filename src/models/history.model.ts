import { ITransactHistory } from "../interfaces/history.interface";
import { v7 as uuidv7 } from "uuid";

export class History implements ITransactHistory {
  id = uuidv7();
  amount: number;
  action: string;
  wallet_id: string;
  status: string;
  date: string = new Date().toLocaleString();
  card: string | null;
  wallet: string | null;
  comment: string | null;
  transact_id: string | null;

  constructor(
    amount: number,
    action: string,
    wallet_id: string,
    status: string,
    comment: string | null = null,
    card: string | null = null,
    wallet: string | null = null,
    transact_id: string | null = null
  ) {
    this.amount = amount;
    this.action = action;
    this.wallet_id = wallet_id;
    this.status = status;
    this.card = card;
    this.wallet = wallet;
    this.comment = comment;
    this.transact_id = transact_id;
  }
}

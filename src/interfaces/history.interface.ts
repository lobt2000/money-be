export interface ITransactHistory {
  id: string;
  amount: number;
  action: string;
  wallet_id: string;
  status: string;
  date: string;
  comment?: string | null;
  card?: string | null;
  wallet?: string | null;
  transact_id?: string | null;
}

export interface ITransformHistory {
  date: string;
  amount: number;
  items: ITransactHistory[];
}

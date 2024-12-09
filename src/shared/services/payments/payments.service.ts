import { FastifyRequest } from "fastify";
import { IWallet } from "../../../interfaces/wallet.interface";
import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { IInfo } from "../../../interfaces/user.interface";
import { historyService } from "../../../modules/history/services/history.service";
interface IToken {
  id: string;
  email: string;
  wallet_id: string;
}

export class PaymentsService {
  async transferMoney(
    db: PostgresDb,
    amount: number,
    wallet_id: string
  ): Promise<QueryResult> {
    return await db.query(`Update wallets Set balance = $1 where id=$2`, [
      amount,
      wallet_id,
    ]);
  }

  async transactionTransfer(db: PostgresDb, userInfo: IInfo): Promise<unknown> {
    return db.transact(async () => {
      await this.transferMoney(db, userInfo.amount, userInfo.id);
      await historyService.setHistoryNote(db, userInfo.history);
    });
  }

  checkValidation(
    balance: number,
    amount: number,
    card: string,
    checkAmount: boolean = true
  ): string | void {
    if (checkAmount && amount > balance) return "Amount is bigger than balance";

    if (card.length !== 16) return "Card must be in 16 symbol length";
  }

  async getWalletById(db: PostgresDb, id: string): Promise<IWallet> {
    return (await db.query(`Select * from wallets where id = $1`, [id]))
      .rows[0];
  }

  async getWalletByWallet(db: PostgresDb, wallet: string): Promise<IWallet> {
    return (await db.query(`Select * from wallets where wallet = $1`, [wallet]))
      .rows[0];
  }

  async getAuthUserWalletId(req: FastifyRequest): Promise<IWallet> {
    const decodedId: string = await this.getUserId(req);
    return this.getWalletById(req.db, decodedId);
  }

  async getUserId(
    req: FastifyRequest,
    token: string = req.headers.authorization!
  ): Promise<string> {
    const splitToken = token.split(" ")[1] ?? token;
    const decodeToken: IToken | null = await req.jwt.decode(splitToken);
    return decodeToken?.wallet_id ?? "";
  }
}

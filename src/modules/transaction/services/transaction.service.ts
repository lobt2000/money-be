import { PostgresDb } from "@fastify/postgres";
import { IInfo } from "../../../interfaces/user.interface";
import { historyService } from "../../history/services/history.service";
import { MoneyStatus } from "../../../enums/money-status.enum";
import { Transactions } from "../../../models/transaction.model";
import { History } from "../../../models/history.model";
import { PaymentsService } from "../../../shared/services/payments/payments.service";

class TransactionService extends PaymentsService {
  constructor() {
    super();
  }

  async transactionPayment(
    db: PostgresDb,
    userInfo: Omit<IInfo, "amount">,
    recieverInfo: Omit<IInfo, "amount">
  ): Promise<unknown> {
    return db.transact(async () => {
      await historyService.setHistoryNote(db, userInfo.history);
      await historyService.setHistoryNote(db, recieverInfo.history);
      const transaction = new Transactions(
        recieverInfo.history.amount,
        recieverInfo.history.id,
        userInfo.history.id,
        "Pending"
      );
      const transact_id = (
        await historyService.createTransaction(db, transaction)
      ).id;
      await historyService.updateHistoryTransactionId(
        db,
        transact_id,
        transaction.sender_id,
        transaction.reciever_id
      );
    });
  }

  async transactionUpdatePayment(
    db: PostgresDb,
    userInfo: Omit<IInfo, "history">,
    recieverInfo: Omit<IInfo, "history">,
    transact_id: string,
    status: string
  ): Promise<unknown> {
    return db.transact(async () => {
      if (status === MoneyStatus.Success || status === MoneyStatus.Revert) {
        await transactionService.transferMoney(
          db,
          userInfo.amount,
          userInfo.id
        );
        await transactionService.transferMoney(
          db,
          recieverInfo.amount,
          recieverInfo.id
        );
      }
      await historyService.updateHistoryStatus(db, transact_id, status);
    });
  }

  generateTransactionInfo(
    id: string,
    type: string,
    amount: number,
    comment: string,
    wallet: string
  ): Omit<IInfo, "amount"> {
    return {
      id: id,
      history: new History(
        amount,
        type,
        id,
        MoneyStatus.Pending,
        comment,
        null,
        wallet
      ),
    };
  }
}

export const transactionService = new TransactionService();

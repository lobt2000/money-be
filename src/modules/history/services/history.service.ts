import { PostgresDb } from "@fastify/postgres";
import {
  ITransactHistory,
  ITransformHistory,
} from "../../../interfaces/history.interface";
import { ITransaction } from "../../../interfaces/transact.interface";

class HistoryService {
  async getAllHistory(
    db: PostgresDb,
    historyId: string
  ): Promise<ITransactHistory[]> {
    return (
      await db.query("Select * from history where id=$1 order by date desc", [
        historyId,
      ])
    ).rows;
  }

  async getUserHistory(
    db: PostgresDb,
    wallet_id: string
  ): Promise<ITransformHistory[]> {
    return await db.transact(async () => {
      const history = (
        await db.query(
          "Select * from history where wallet_id=$1 order by date desc",
          [wallet_id]
        )
      ).rows;

      const filterHistory = (
        await db.query(
          `SELECT DATE_TRUNC('day', h.date::TIMESTAMP) AS date,
                  COALESCE(SUM(CASE WHEN h.status = 'Success' THEN h.amount ELSE 0 END), 0) AS amount
           FROM (
                SELECT DISTINCT DATE_TRUNC('day', date::TIMESTAMP) AS truncated_date
                FROM history
           ) AS history_date
           LEFT JOIN history h ON DATE_TRUNC('day', h.date::TIMESTAMP) = history_date.truncated_date
                   AND h.wallet_id = $1
           WHERE h.date IS NOT NULL
           GROUP BY DATE_TRUNC('day', h.date::TIMESTAMP)
           ORDER BY DATE_TRUNC('day', h.date::TIMESTAMP) DESC;`,
          [wallet_id]
        )
      ).rows;

      return filterHistory.map((res) => ({
        ...res,
        items: history.filter(
          (item: ITransactHistory) =>
            new Date(item.date).setHours(0, 0, 0, 0) ===
            new Date(res.date).getTime()
        ),
      }));
    });
  }

  async setHistoryNote(
    db: PostgresDb,
    body: ITransactHistory
  ): Promise<{ id: string }> {
    return (
      await db.query(
        "INSERT INTO history(id, amount, action, wallet_id, status, date, card, wallet, transact_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ID",
        [
          body.id,
          body.amount,
          body.action,
          body.wallet_id,
          body.status,
          body.date,
          body.card,
          body.wallet,
          body.transact_id,
        ]
      )
    ).rows[0];
  }

  async updateHistoryStatus(
    db: PostgresDb,
    transact_id: string,
    status: string
  ): Promise<unknown> {
    return await db.transact(async () => {
      await db.query(`Update history set status = $1 where transact_id = $2`, [
        status,
        transact_id,
      ]);
      await db.query(`Update history set status = $1 where transact_id = $2`, [
        status,
        transact_id,
      ]);

      await db.query(`Update transactions set status = $1 where id = $2`, [
        status,
        transact_id,
      ]);
    });
  }

  async updateHistoryTransactionId(
    db: PostgresDb,
    transact_id: string,
    senderHistoryId: string,
    recieverHistoryId: string
  ): Promise<unknown> {
    return await db.transact(async () => {
      await db.query(`Update history set transact_id = $1 where id = $2`, [
        transact_id,
        senderHistoryId,
      ]);
      await db.query(`Update history set transact_id = $1 where id = $2`, [
        transact_id,
        recieverHistoryId,
      ]);
    });
  }

  async createTransaction(
    db: PostgresDb,
    body: ITransaction
  ): Promise<{ id: string }> {
    return (
      await db.query(
        "INSERT INTO transactions(id, reciever_id, sender_id, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING ID",
        [body.id, body.reciever_id, body.sender_id, body.amount, body.status]
      )
    ).rows[0];
  }
}

export const historyService = new HistoryService();

import { PostgresDb } from "@fastify/postgres";
import { IUser } from "../../../interfaces/user.interface";
import { FastifyRequest } from "fastify";
import { QueryResult } from "pg";

interface IToken {
  id: string;
}

class UserService {
  async getUserById(db: PostgresDb, id: string): Promise<IUser> {
    return (await db.query(`Select * from users where id = $1`, [id])).rows[0];
  }

  async getUsers(req: FastifyRequest): Promise<IUser[]> {
    return (
      await req.db.query(`Select * from users where id != $1`, [
        (await userService.getAuthUser(req)).id,
      ])
    ).rows;
  }

  async getUsersForChat(db: PostgresDb, user_id: string): Promise<IUser[]> {
    return (
      await db.query(
        `SELECT u.id, w.wallet AS wallet
          FROM 
            users u
          JOIN
            wallets w ON w.id = u.wallet_id
          WHERE 
            u.id != $1
            AND NOT EXISTS (
                SELECT 1 
                FROM chat c 
                WHERE c.user1_id = u.id OR c.user2_id = u.id
            )`,
        [user_id]
      )
    ).rows;
  }

  async transferMoney(
    db: PostgresDb,
    amount: number,
    userId: string
  ): Promise<QueryResult> {
    return await db.query(`Update users Set balance = $1 where id=$2`, [
      amount,
      userId,
    ]);
  }

  async getAuthUser(req: FastifyRequest): Promise<IUser> {
    const decodedId: string = await this.getUserId(req);
    return this.getUserById(req.db, decodedId);
  }

  async getUserId(
    req: FastifyRequest,
    token: string = req.headers.authorization!
  ): Promise<string> {
    const splitToken = token.split(" ")[1] ?? token;
    const decodeToken: IToken | null = await req.jwt.decode(splitToken);
    return decodeToken?.id ?? "";
  }
}

export const userService = new UserService();

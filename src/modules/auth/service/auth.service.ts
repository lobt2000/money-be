import { IEmailTemplate } from "../../../interfaces/email.interface";
import { EmailTemplate } from "../../../models/email.model";
import { Transporter } from "nodemailer";
import { IUser } from "../../../interfaces/user.interface";
import { MailText, MailTypes } from "../../../enums/mail.enum";
import { QueryResult } from "pg";
import { PostgresDb } from "@fastify/postgres";

class AuthService {
  async createUser(db: PostgresDb, data: IUser): Promise<{ id: string }> {
    return (
      await db.query(
        `INSERT INTO users(id, email, password, wallet_id, is_verify) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [data.id, data.email, data.password, data.wallet_id, data.is_verify]
      )
    ).rows[0];
  }

  async findOne(db: PostgresDb, email: string): Promise<IUser> {
    return (await db.query(`Select * from users where email=$1`, [email]))
      .rows[0];
  }

  async updatePassword(
    db: PostgresDb,
    userId: string,
    password: string
  ): Promise<QueryResult> {
    return await db.query(`Update users Set password = $1 where id=$2`, [
      password,
      userId,
    ]);
  }

  async verifyUser(db: PostgresDb, userId: string): Promise<QueryResult> {
    return db.query(`Update users Set is_verify = true where id=$1`, [userId]);
  }

  async deleteAccount(db: PostgresDb, userId: string): Promise<unknown> {
    return db.query("delete from users where id = $1", [userId]);
  }

  sendMail(
    mailer: Transporter,
    user: IUser,
    type: string,
    token?: string
  ): Promise<undefined> {
    let link = `http://localhost:4200/`;

    switch (type) {
      case MailTypes.resetPassword as string:
        if (!token) throw new Error("Smth go wrong");
        link += MailTypes.resetPassword + `?token=${token}`;
        break;

      default:
        link += MailTypes.verification + `?id=${user.id}`;
        break;
    }
    const html = `<b>Hi, from Money Inc</b> <br>
        <p>${MailText[type as keyof typeof MailText]}:</p> <br>
        <a href="${link}">${link}</a>`;
    const mail: IEmailTemplate = new EmailTemplate(
      user.email,
      `${type} Link`,
      link,
      html
    );

    return mailer.sendMail(mail);
  }
}

export const authService = new AuthService();

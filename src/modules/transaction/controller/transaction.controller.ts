import { FastifyReply, FastifyRequest } from "fastify";
import { IInfo, IUser } from "../../../interfaces/user.interface";
import { MoneyStatus } from "../../../enums/money-status.enum";
import { TransactType, UpdateStatusType } from "../schema/transaction.schema";
import { transactionService } from "../services/transaction.service";

class TransactionController {
  user: Omit<IUser, "password"> | null = null;

  async transactUsersMoney(
    req: FastifyRequest<{
      Body: TransactType;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { amount, wallet, comment } = req.body;

      const wallet_sender = await transactionService.getAuthUserWalletId(req);
      const wallet_reciever = await transactionService.getWalletByWallet(
        req.db,
        wallet
      );

      if (wallet_reciever.id === wallet_sender.id)
        return reply.code(400).send({
          statusCode: 400,
          error: "Wrong sender",
          message: "You cant send money to yourserlf",
        });

      const error = transactionService.checkValidation(
        wallet_sender.balance,
        amount,
        wallet
      );
      if (error)
        return reply.code(400).send({
          statusCode: 400,
          error: "Input error",
          message: error,
        });

      if (!wallet_reciever)
        return reply.code(404).send({
          statusCode: 404,
          error: "User not found",
          message: "No reciever with that wallet",
        });

      const userInfo: Omit<IInfo, "amount"> =
        transactionService.generateTransactionInfo(
          wallet_sender.id,
          "payment",
          -amount,
          comment,
          wallet_reciever.wallet
        );

      const recieverInfo: Omit<IInfo, "amount"> =
        transactionService.generateTransactionInfo(
          wallet_reciever.id,
          "income",
          amount,
          comment,
          wallet_sender.wallet
        );

      await transactionService.transactionPayment(
        req.db,
        userInfo,
        recieverInfo
      );

      return reply.code(201).send({
        balance: wallet_sender.balance,
      });
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async updatePaymentStatus(
    req: FastifyRequest<{ Body: UpdateStatusType }>,
    reply: FastifyReply
  ) {
    try {
      const { status, wallet, amount, transact_id } = req.body;
      const wallet_sender = await transactionService.getWalletByWallet(
        req.db,
        wallet
      );
      const wallet_reciever = await transactionService.getAuthUserWalletId(req);

      if (!wallet_sender)
        return reply.code(400).send({
          statusCode: 400,
          error: "User not found",
          message: "No reciever with that id",
        });

      let recieverNewBalance = wallet_reciever!.balance;

      let senderNewBalance = wallet_sender!.balance;

      const senderInfo: Omit<IInfo, "history"> = {
        id: wallet_sender.id,
        amount: senderNewBalance,
      };

      const recieverInfo: Omit<IInfo, "history"> = {
        id: wallet_reciever.id,
        amount: recieverNewBalance,
      };

      switch (status) {
        case MoneyStatus.Success:
          senderNewBalance = senderNewBalance - Math.abs(amount);
          recieverNewBalance = recieverNewBalance + Math.abs(amount);

          senderInfo.amount = senderNewBalance;
          recieverInfo.amount = recieverNewBalance;

          break;
        case MoneyStatus.Revert:
          senderNewBalance = senderNewBalance - Math.abs(amount);
          recieverNewBalance = recieverNewBalance + Math.abs(amount);

          senderInfo.amount = senderNewBalance;
          recieverInfo.amount = recieverNewBalance;
          break;
      }
      await transactionService.transactionUpdatePayment(
        req.db,
        senderInfo,
        recieverInfo,
        transact_id,
        status
      );

      return reply.code(200).send({
        balance: recieverInfo.amount,
      });
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }
}

export const transactionController = new TransactionController();

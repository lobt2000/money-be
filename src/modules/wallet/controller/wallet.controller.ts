import { FastifyReply, FastifyRequest } from "fastify";
import { IInfo } from "../../../interfaces/user.interface";
import { walletService } from "../services/wallet.service";
import { TransferType } from "../schema/wallet.schema";

class WalletController {
  async getUserWalletId(
    req: FastifyRequest<{ Body: TransferType }>,
    reply: FastifyReply
  ) {
    try {
      const wallet = await walletService.getAuthUserWalletId(req);
      return reply.code(200).send(wallet);
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async userDeposit(
    req: FastifyRequest<{ Body: TransferType }>,
    reply: FastifyReply
  ) {
    try {
      const { amount, card } = req.body;

      const wallet = await walletService.getAuthUserWalletId(req);

      const error = walletService.checkValidation(
        wallet.balance,
        amount,
        card,
        false
      );
      if (error)
        return reply.code(400).send({
          statusCode: 400,
          error: "Wrong Input",
          message: error,
        });

      const newUserAmount = wallet!.balance + amount;

      const userInfo: IInfo = walletService.generateTransferInfo(
        wallet.id,
        "deposit",
        amount,
        newUserAmount,
        card
      );

      await walletService.transactionTransfer(req.db, userInfo);

      return reply.code(200).send({
        balance: newUserAmount,
      });
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }

  async userWithdrawal(
    req: FastifyRequest<{ Body: TransferType }>,
    reply: FastifyReply
  ) {
    try {
      const { amount, card } = req.body;

      const wallet = await walletService.getAuthUserWalletId(req);

      const error = walletService.checkValidation(wallet.balance, amount, card);
      if (error)
        return reply.code(400).send({
          statusCode: 400,
          error: "Wrong Input",
          message: error,
        });

      const newUserAmount = wallet!.balance - amount;

      const userInfo: IInfo = walletService.generateTransferInfo(
        wallet.id,
        "withdrawal",
        -amount,
        newUserAmount,
        card
      );

      await walletService.transactionTransfer(req.db, userInfo);

      return reply.code(200).send({
        balance: newUserAmount,
      });
    } catch (e) {
      return reply
        .code(500)
        .send({ statusCode: 500, error: "Interval server error", message: e });
    }
  }
}

export const walletController = new WalletController();

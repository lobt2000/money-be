import { IInfo } from "../../../interfaces/user.interface";
import { MoneyStatus } from "../../../enums/money-status.enum";
import { History } from "../../../models/history.model";
import { PaymentsService } from "../../../shared/services/payments/payments.service";

class WalletService extends PaymentsService {
  constructor() {
    super();
  }

  generateTransferInfo(
    id: string,
    type: string,
    amount: number,
    newUserAmount: number,
    card: string
  ): IInfo {
    return {
      id: id,
      amount: newUserAmount,
      history: new History(amount, type, id, MoneyStatus.Success, "", card),
    };
  }
}

export const walletService = new WalletService();

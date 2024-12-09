import generateUniqueId from "generate-unique-id";
import { IWallet } from "../interfaces/wallet.interface";
import { v7 as uuidv7 } from "uuid";

export class Wallet implements IWallet {
  id = uuidv7();
  wallet = generateUniqueId({
    length: 16,
    useLetters: false,
  });
  balance = 0.0;
}

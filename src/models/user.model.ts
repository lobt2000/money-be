import { IUser } from "../interfaces/user.interface";
import { v7 as uuidv7 } from "uuid";

export class User implements IUser {
  id = uuidv7();
  password: string;
  email: string;
  wallet_id: string;
  is_verify: boolean = false;

  constructor(hash: string, email: string, wallet_id: string) {
    this.password = hash;
    this.email = email;
    this.wallet_id = wallet_id;
  }
}

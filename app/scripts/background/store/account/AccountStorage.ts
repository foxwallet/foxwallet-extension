import { AccountDatabase, accountDB } from "@/database/AccountDatabase";
import { OneMatchGroupAccount } from "../vault/types/keyring";

export class AccountSettingStorage {
  instance: AccountDatabase;

  constructor() {
    this.instance = accountDB;
  }

  setSelectedGroupAccount = async (account: OneMatchGroupAccount) => {
    return await this.instance.setSelectedGroupAccount(account);
  };

  removeSelectedAccount = async () => {
    return await this.instance.reset();
  };

  getSelectedGroupAccount = async (): Promise<OneMatchGroupAccount | null> => {
    const selectedGroupAccount: OneMatchGroupAccount | null = (
      await this.instance.selectedGroupAccount.limit(1).toArray()
    )[0];
    return selectedGroupAccount;
  };
}

export const accountSettingStorage = new AccountSettingStorage();

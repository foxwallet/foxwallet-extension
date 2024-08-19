import Dexie from "dexie";
import { OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";

export class AccountDatabase extends Dexie {
  selectedGroupAccount: Dexie.Table<OneMatchGroupAccount, string>;

  constructor() {
    super("account");

    this.version(1).stores({
      selectedGroupAccount: "wallet.walletId, group.groupId",
    });

    this.selectedGroupAccount = this.table("selectedGroupAccount");
  }

  async setSelectedGroupAccount(groupAccount: OneMatchGroupAccount) {
    await this.transaction("rw", this.selectedGroupAccount, async () => {
      await this.selectedGroupAccount.clear();
      await this.selectedGroupAccount.add(groupAccount);
    });
  }

  async reset() {
    await this.transaction("rw", this.selectedGroupAccount, async () => {
      await this.selectedGroupAccount.clear();
    });
  }
}

export const accountDB = new AccountDatabase();

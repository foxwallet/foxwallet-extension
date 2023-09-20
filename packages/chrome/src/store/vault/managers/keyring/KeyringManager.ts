import { HDKeyring } from "@foxwallet/core";
import { HDWallet } from "../../../account.d";
import { decryptStr } from "@foxwallet/core/utils/encrypt";
import { CoinType, EncryptedField } from "@foxwallet/core/types";
export class KeyringManager {
  #keyrings: { [walletId: string]: HDKeyring };

  constructor() {
  }

  async restoreWallet(hash: string, hdWallets: HDWallet[]) {
    this.#keyrings = {};
    for (const wallet of hdWallets) {
      this.#keyrings[wallet.walletId] = await HDKeyring.restore({
        hash,
        walletId: wallet.walletId,
        mnemonic: wallet.mnemonic,
      });
    }
  }

  async createNewWallet(hash: string, { walletId }: { walletId: string }) {
    const newKeyring = await HDKeyring.init({
      hash,
      walletId,
    });
    this.#keyrings[walletId] = newKeyring;
    const newMnemonic = newKeyring.getEncryptedMnemonic() as EncryptedField | undefined;
    if (!newMnemonic) {
      throw new Error("createNewWallet failed");
    }
    return {
      walletId,
      mnemonic: newMnemonic,
    }
  }

  async addNewAccount({ walletId, accountId, coin,index, hash } : { walletId: string, accountId: string, coin: CoinType, index: number, hash: string }) {
    const keyring = this.#keyrings[walletId];
    if (!keyring) {
      throw new Error("addNewAccount failed due to no keyring");
    }
    const newEncryptedKeyPair = await keyring.derive(accountId, index, coin, hash);
    return newEncryptedKeyPair;
  }
}

export const keyringManager = new KeyringManager();

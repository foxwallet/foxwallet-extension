import { type AuthManager, authManager } from "../managers/auth/AuthManager";
import {
  type KeyringManager,
  keyringManager,
} from "../managers/keyring/KeyringManager";
import {
  type WalletAssetsManager,
  walletAssetsManager,
} from "../managers/assets";
import { type IPopupServer } from "./IWalletServer";

export class PopupWalletServer implements IPopupServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;
  walletAssetsManager: WalletAssetsManager;

  constructor(
    authManager: AuthManager,
    keyringManager: KeyringManager,
    walletAssetsManager: WalletAssetsManager
  ) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
    this.walletAssetsManager = walletAssetsManager;
  }

  async initPassword(params: { password: string }): Promise<string> {
    // TODO: If any wallets exist, throw an error
    await this.authManager.initPassword(params.password);
    const token = this.authManager.getToken();
    if (!token) {
      throw new Error("initPassword error");
    }
    return token;
  }
}

export const popupWalletServer = new PopupWalletServer(
  authManager,
  keyringManager,
  walletAssetsManager
);

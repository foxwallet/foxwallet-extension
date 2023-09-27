import { CoinType } from "@foxwallet/core/types";
import { AuthManager } from "../store/vault/managers/auth/AuthManager";
import { KeyringManager } from "../store/vault/managers/keyring/KeyringManager";
import { DisplayKeyring, DisplayWallet } from "../store/vault/types/keyring";
import {
  CreateWalletProps,
  RegenerateWalletProps,
  type IPopupServer,
  ImportHDWalletProps,
  AddAccountProps,
} from "./IWalletServer";
export class PopupWalletServer implements IPopupServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;

  constructor(authManager: AuthManager, keyringManager: KeyringManager) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
  }

  async initPassword(params: { password: string }): Promise<boolean> {
    // if (this.authManager.getToken()) {
    //   throw new Error("Password already inited");
    // }
    await this.authManager.initPassword(params.password);
    return true;
  }

  async createWallet(params: CreateWalletProps): Promise<DisplayWallet> {
    return await this.keyringManager.createNewWallet(params);
  }

  async regenerateWallet(
    params: RegenerateWalletProps
  ): Promise<DisplayWallet> {
    return await this.keyringManager.regenerateWallet(params);
  }

  async importHDWallet(params: ImportHDWalletProps): Promise<DisplayWallet> {
    return await this.keyringManager.importHDWallet(params);
  }

  async addAccount(params: AddAccountProps): Promise<DisplayWallet> {
    return await this.keyringManager.addNewAccount(params);
  }

  async getAllWallet(): Promise<DisplayKeyring> {
    return await this.keyringManager.getAllWallet();
  }
}

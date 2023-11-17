import { AleoService } from "core/coins/ALEO/service/AleoService";
import { AuthManager } from "../store/vault/managers/auth/AuthManager";
import { KeyringManager } from "../store/vault/managers/keyring/KeyringManager";
import { DisplayKeyring, DisplayWallet } from "../store/vault/types/keyring";
import {
  CreateWalletProps,
  RegenerateWalletProps,
  type IPopupServer,
  ImportHDWalletProps,
  AddAccountProps,
  AleoBalanceProps,
} from "./IWalletServer";
import { ALEO_CHAIN_CONFIGS } from "core/coins/ALEO/config/chains";
import { AleoStorage } from "../store/aleo/AleoStorage";
export class PopupWalletServer implements IPopupServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;
  aleoService: AleoService;

  constructor(authManager: AuthManager, keyringManager: KeyringManager) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
    this.aleoService = new AleoService(
      ALEO_CHAIN_CONFIGS.TEST_NET_3,
      AleoStorage.getInstance(),
    );
  }

  async initPassword(params: { password: string }): Promise<boolean> {
    // if (this.authManager.getToken()) {
    //   throw new Error("Password already inited");
    // }
    await this.authManager.initPassword(params.password);
    await this.keyringManager.reset();
    return true;
  }

  async createWallet(params: CreateWalletProps): Promise<DisplayWallet> {
    return await this.keyringManager.createNewWallet(params);
  }

  async regenerateWallet(
    params: RegenerateWalletProps,
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

  async getAleoBalance({
    chainId,
    address,
  }: AleoBalanceProps): Promise<string> {
    return await this.aleoService.getPrivateBalance(address);
  }
}

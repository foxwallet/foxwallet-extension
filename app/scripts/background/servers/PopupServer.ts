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
    await this.keyringManager.reset();
    return true;
  }

  async hasAuth(): Promise<boolean> {
    return this.authManager.hasAuth();
  }

  async login(params: { password: string }): Promise<boolean> {
    return await this.authManager.login(params.password);
  }

  async lock(): Promise<void> {
    return this.authManager.lock();
  }

  async timeoutLock(): Promise<void> {
    return this.authManager.timeoutLock();
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

  // async getBalance({
  //   uniqueId,
  //   address,
  // }: GetBalanceProps): Promise<GetBalanceResp> {
  //   switch (uniqueId) {
  //     case InnerChainUniqueId.ALEO_TESTNET_3:
  //       const [privateBalance, publicBalance] = await Promise.all([
  //         this.aleoService.getPrivateBalance(address),
  //         this.aleoService.getPublicBalance(address),
  //       ]);
  //       return {
  //         privateBalance: {
  //           type: SerializeType.BIG_INT,
  //           value: privateBalance.toString(),
  //         },
  //         publicBalance: {
  //           type: SerializeType.BIG_INT,
  //           value: publicBalance.toString(),
  //         },
  //         total: {
  //           type: SerializeType.BIG_INT,
  //           value: (privateBalance + publicBalance).toString(),
  //         },
  //       };
  //     default:
  //       throw new Error("Unsupported chain");
  //   }
  // }

  // async getRecords({
  //   chainId,
  //   address,
  //   programId,
  //   recordFilter,
  // }: AleoRecordsProps) {
  //   return await this.aleoService.getRecords(address, programId, recordFilter);
  // }
}

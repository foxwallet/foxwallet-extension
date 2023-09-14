import { AuthManager, authManager } from "../managers/auth/AuthManager";
import {
  KeyringManager,
  keyringManager,
} from "../managers/keyring/KeyringManager";
import { WalletAssetsManager, walletAssetsManager } from "../managers/assets";
import { IContentServer } from "./IWalletServer";

export class ContentWalletServer implements IContentServer {
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

  connect: (params: any) => Promise<any>;
}

export const contentWalletServer = new ContentWalletServer(
  authManager,
  keyringManager,
  walletAssetsManager
);

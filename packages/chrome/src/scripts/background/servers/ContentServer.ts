import { type AuthManager, authManager } from "../managers/auth/AuthManager";
import {
  type KeyringManager,
  keyringManager,
} from "../managers/keyring/KeyringManager";
import {
  type WalletAssetsManager,
  walletAssetsManager,
} from "../managers/assets";
import { type IContentServer } from "./IWalletServer";

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

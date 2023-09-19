import {
  type AuthManager,
  authManager,
} from "../../../store/vault/managers/auth/AuthManager";
import {
  type KeyringManager,
  keyringManager,
} from "../../../store/vault/managers/keyring/KeyringManager";
import { type IContentServer } from "./IWalletServer";

export class ContentWalletServer implements IContentServer {
  authManager: AuthManager;
  keyringManager: KeyringManager;

  constructor(authManager: AuthManager, keyringManager: KeyringManager) {
    this.authManager = authManager;
    this.keyringManager = keyringManager;
  }

  connect: (params: any) => Promise<any>;
}

export const contentWalletServer = new ContentWalletServer(
  authManager,
  keyringManager
);

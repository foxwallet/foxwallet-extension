import { AuthManager } from "../store/vault/managers/auth/AuthManager";
import { KeyringManager } from "../store/vault/managers/keyring/KeyringManager";
import { DappStorage } from "../store/dapp/DappStorage";
import { AccountSettingStorage } from "../store/account/AccountStorage";
import { PopupWalletServer } from "./PopupServer";
import { CoinServiceEntry } from "core/coins/CoinServiceEntry";
import { CoinType } from "core/types";
import { ALEOContentWalletServer } from "@/scripts/background/servers/ALEOContentServer";
import { ETHContentWalletServer } from "@/scripts/background/servers/ETHContentSever";
import type {
  ContentServerMethod, IContentServer,
  SiteMetadata,
} from "@/scripts/background/servers/IWalletServer";

export class ContentWalletServer {
  aleoServer: ALEOContentWalletServer;
  ethServer: ETHContentWalletServer;

  constructor(
    authManager: AuthManager,
    keyringManager: KeyringManager,
    dappStorage: DappStorage,
    accountSettingStorage: AccountSettingStorage,
    popupServer: PopupWalletServer,
    coinService: CoinServiceEntry,
  ) {
    this.aleoServer = new ALEOContentWalletServer(
      authManager,
      keyringManager,
      dappStorage,
      accountSettingStorage,
      popupServer,
      coinService,
    )
    this.ethServer = new ETHContentWalletServer(
      authManager,
      keyringManager,
      dappStorage,
      accountSettingStorage,
      popupServer,
      coinService,
    )
  }

  getChainServer(coinType: CoinType): IContentServer<CoinType> {
    switch (coinType) {
      case CoinType.ALEO:
        return this.aleoServer
      case CoinType.ETH:
        return this.ethServer;
      case CoinType.QTUM:
        // QTUM DApp support not yet implemented
        throw new Error("QTUM DApp interaction is not supported yet");
      default:
        throw new Error(`Unsupported coin type: ${coinType}`);
    }
  }

  execute<C extends CoinType, T = any>({
    method,
    payload,
    siteMetadata,
    coinType,
  }: {
    method: ContentServerMethod<C>;
    payload: T;
    siteMetadata: SiteMetadata;
    coinType: C;
  }) {
    // @ts-ignore
    return this.getChainServer(coinType)[method](payload, {siteMetadata, coinType});
  }
}

import { type IPopupServer } from "./IWalletServer";

export class PopupWalletServer implements IPopupServer {
  constructor() {}

  async initPassword(params: { password: string }): Promise<string> {
    // TODO: If any wallets exist, throw an error
    throw new Error("Not implemented");
  }
}

export const popupWalletServer = new PopupWalletServer();

import { type IContentServer } from "./IWalletServer";

export class ContentWalletServer implements IContentServer {
  constructor() {}

  connect: (params: any) => Promise<any>;
}

export const contentWalletServer = new ContentWalletServer();

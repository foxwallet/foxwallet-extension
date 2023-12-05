import { DappStorage } from "@/scripts/background/store/dapp/DappStorage";

export class DappService {
  private dappStorage: DappStorage;

  constructor() {
    this.dappStorage = new DappStorage();
  }

  async getDappRequest(requestId: string) {
    return await this.dappStorage.getDappRequest(requestId);
  }
}

export const dappService = new DappService();

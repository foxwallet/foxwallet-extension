import Dexie from "dexie";
import { AleoConnectHistory, DappRequest } from "./types/dapp";

export class DappDatabase extends Dexie {
  aleo_history: Dexie.Table<AleoConnectHistory, string>;
  request: Dexie.Table<DappRequest, string>;

  constructor() {
    super("dapp");

    this.version(1).stores({
      aleo_connect_history: "[address+network], site.origin",
      request: "id, address",
    });

    this.version(2).stores({
      aleo_history: "++id, [address+network], site.origin",
    });

    this.aleo_history = this.table("aleo_history");
    this.request = this.table("request");
  }
}

export const dappDB = new DappDatabase();

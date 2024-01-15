import Dexie from "dexie";
import { AleoConnectHistory, DappRequest } from "./types/dapp";

export class DappDatabase extends Dexie {
  aleo_connect_history: Dexie.Table<AleoConnectHistory, string>;
  request: Dexie.Table<DappRequest, string>;

  constructor() {
    super("dapp");

    this.version(1).stores({
      aleo_connect_history: "[address+network], site.origin",
      request: "id, address",
    });

    this.aleo_connect_history = this.table("aleo_connect_history");
    this.request = this.table("request");
  }
}

export const dappDB = new DappDatabase();

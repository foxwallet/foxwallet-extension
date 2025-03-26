import Dexie from "dexie";
import {
  type AleoConnectHistory,
  type ConnectHistory,
  type DappRequest,
} from "./types/dapp";
import { CoinType } from "core/types";

export class DappDatabase extends Dexie {
  /**
   * @deprecated
   */
  aleo_history: Dexie.Table<AleoConnectHistory, string>;

  dapp_history: Dexie.Table<ConnectHistory, string>;
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

    this.version(3)
      .stores({
        dapp_history: "++id, [address+coinType+network], site.origin",
      })
      .upgrade(async (tx) =>
        // TODO check this
        this.aleo_history.each(
          async (aleoHistory) =>
            this.dapp_history?.add({
              ...aleoHistory,
              coinType: CoinType.ALEO,
            }),
        ),
      );

    this.version(4).stores({
      aleo_history: null,
      aleo_connect_history: null,
    });

    this.dapp_history = this.table("dapp_history");
    this.request = this.table("request");
  }
}

export const dappDB = new DappDatabase();

import Dexie from "dexie";
import {
  type AleoConnectHistory,
  type ConnectHistory,
  type DappRequest,
} from "./types/dapp";
import { CoinType } from "core/types";

export class DappDatabase extends Dexie {
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
      .upgrade(async (tx) => {
        const aleoHistories = (await tx
          .table("aleo_history")
          .toArray()) as AleoConnectHistory[];
        if (!aleoHistories.length) {
          return;
        }

        await tx.table("dapp_history").bulkAdd(
          aleoHistories.map((aleoHistory) => ({
            ...aleoHistory,
            coinType: CoinType.ALEO,
          })),
        );
      });

    this.version(4).stores({
      aleo_history: null,
      aleo_connect_history: null,
    });

    this.version(5).upgrade(async (tx) => {
      await tx
        .table("dapp_history")
        .filter((history: Partial<ConnectHistory>) => !history.coinType)
        .modify((history: Partial<ConnectHistory>) => {
          history.coinType = history.address?.startsWith("aleo1")
            ? CoinType.ALEO
            : CoinType.ETH;
          if (history.coinType === CoinType.ETH && !history.network) {
            history.network = "";
          }
        });
    });

    this.dapp_history = this.table("dapp_history");
    this.request = this.table("request");
  }
}

export const dappDB = new DappDatabase();

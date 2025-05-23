import Dexie from "dexie";
import { type AleoAddressInfo } from "./types/address";
import { type AddressRecords } from "./types/records";
import { type AleoLocalTx } from "./types/tx";
import { type AleoProgram } from "./types/program";
import {
  type AleoOnChainHistoryItem,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "../types";

export class AleoBlockDatabase extends Dexie {
  infos: Dexie.Table<AleoAddressInfo, string>;
  records: Dexie.Table<AddressRecords, string>;
  txs: Dexie.Table<AleoLocalTx, string>;
  programs: Dexie.Table<AleoProgram, string>;
  cacheTxs: Dexie.Table<AleoOnChainHistoryItem>;

  constructor(chainId: string) {
    super(chainId);

    this.version(1).stores({
      infos: "address",
      records: "[address+begin], end",
      txs: "localId, [address+programId]",
      programs: "programId",
    });

    this.version(2).stores({
      cacheTxs: "txId",
    });

    this.version(3)
      .stores({
        txs: "localId, [address+programId], notification",
      })
      .upgrade(async (transaction) => {
        return transaction
          .table("txs")
          .toCollection()
          .modify((tx) => {
            tx.notification = true;
          });
      });

    this.version(4)
      .stores({
        txs: "localId, [address+programId], notification, tokenId",
      })
      .upgrade(async (transaction) => {
        return transaction
          .table("txs")
          .toCollection()
          .modify((tx) => {
            tx.tokenId = NATIVE_TOKEN_TOKEN_ID;
          });
      });

    this.infos = this.table("infos");
    this.records = this.table("records");
    this.txs = this.table("txs");
    this.programs = this.table("programs");
    this.cacheTxs = this.table("cacheTxs");
  }

  async deleteAddressData(address: string): Promise<void> {
    await this.transaction(
      "rw",
      this.infos,
      this.records,
      this.txs,
      async () => {
        const infosToDelete = this.infos.where({ address });
        await infosToDelete.delete();
        const recordsToDelete = this.records.where({ address });
        await recordsToDelete.delete();
        const txsToDelete = this.txs.where({ address });
        await txsToDelete.delete();
      },
    );
  }

  async setRecords(address: string, recordsData: AddressRecords) {
    await this.transaction("rw", this.records, async () => {
      const { begin } = recordsData;
      // delete the item with same begin
      const count = await this.records
        .where({
          address,
          begin,
        })
        .count();
      if (count) {
        await this.records
          .where({
            address,
            begin,
          })
          .modify(recordsData);
      } else {
        await this.records.add(recordsData);
      }
    });
  }
}

const cacheMap: { [key in string]?: AleoBlockDatabase } = {};

export const getBlockDatabaseByChainId = (
  chainId: string,
): AleoBlockDatabase => {
  if (!cacheMap[chainId]) {
    cacheMap[chainId] = new AleoBlockDatabase(chainId);
  }
  return cacheMap[chainId]!;
};

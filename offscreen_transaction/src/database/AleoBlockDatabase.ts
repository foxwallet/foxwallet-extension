import Dexie from "dexie";
import { AleoAddressInfo } from "./types/address";
import { AddressRecords } from "./types/records";
import { AleoLocalTx } from "./types/tx";
import { AleoProgram } from "./types/program";
import { AleoOnChainHistoryItem } from "../types";

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
        const infosToDelete = this.infos.where({ address: address });
        await infosToDelete.delete();
        const recordsToDelete = this.records.where({ address: address });
        await recordsToDelete.delete();
        const txsToDelete = this.txs.where({ address: address });
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
          address: address,
          begin: begin,
        })
        .count();
      if (count) {
        await this.records
          .where({
            address: address,
            begin: begin,
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

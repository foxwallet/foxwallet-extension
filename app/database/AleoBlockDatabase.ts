import Dexie from "dexie";
import { type AleoLocalTx } from "./types/tx";
import { type AleoProgram } from "./types/program";
import { type AleoTxDetailCacheRow } from "./types/txDetailCache";
import { type AleoOnChainHistoryItem } from "core/coins/ALEO/types/History";
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";

export class AleoBlockDatabase extends Dexie {
  txs: Dexie.Table<AleoLocalTx, string>;
  programs: Dexie.Table<AleoProgram, string>;
  cacheTxs: Dexie.Table<AleoOnChainHistoryItem>;
  txDetailCache: Dexie.Table<AleoTxDetailCacheRow, string>;

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

    this.version(5).stores({
      infos: null,
      records: null,
    });

    // SDK 0.10.x changed credits.aleo verifying key indexes; any prover/
    // verifier blobs synthesized under the old SDK no longer match and
    // SnarkVM rejects them with "instance generated during proving does
    // not match that in the index". Drop the cached keypairs so the next
    // transaction re-synthesizes against the current SDK. Mirrors the
    // matching v6 bump in offscreen_service/src/database/AleoBlockDatabase.ts
    // so both Dexie definitions agree on the schema version.
    this.version(6)
      .stores({
        programs: "programId",
      })
      .upgrade(async (transaction) => {
        return transaction
          .table("programs")
          .toCollection()
          .modify((program) => {
            program.keypairs = {};
          });
      });

    this.version(7).stores({
      inclusionKeys: "id",
    });

    this.version(8).stores({
      txDetailCache: "txId",
    });

    this.txs = this.table("txs");
    this.programs = this.table("programs");
    this.cacheTxs = this.table("cacheTxs");
    this.txDetailCache = this.table("txDetailCache");
  }

  async deleteAddressData(address: string): Promise<void> {
    await this.transaction("rw", this.txs, this.cacheTxs, async () => {
      const txsToDelete = this.txs.where({ address });
      await txsToDelete.delete();
    });
  }

  async resetData(): Promise<void> {
    try {
      await this.transaction(
        "rw",
        this.txs,
        this.cacheTxs,
        this.programs,
        async () => {
          await this.txs.clear();
          await this.cacheTxs.clear();
          await this.programs.clear();
        },
      );
    } catch (e) {
      console.error("Failed to clear aleo tables:", e);
    }
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

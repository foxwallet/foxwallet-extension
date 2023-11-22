import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConfig } from "../types/AleoConfig";
import { IAleoStorage } from "../types/IAleoStorage";
import { AleoAddressInfo, RecordDetailWithSpent } from "../types/SyncTask";
import { parseU64 } from "../utils/num";
import { logger } from "@/common/utils/logger";
import { AleoRpcService } from "../../../../offscreen/aleo_service";
import { AutoSwitch } from "@/common/utils/retry";
import { AutoSwitchServiceType } from "@/common/types/retry";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";

const CREDITS_MAPPING_NAME = "account";

export class AleoService {
  config: AleoConfig;
  chainId: string;
  aleoStorage: IAleoStorage;
  rpcService: AleoRpcService;

  constructor(config: AleoConfig, storage: IAleoStorage) {
    this.config = config;
    this.chainId = config.chainId;
    this.aleoStorage = storage;
    this.rpcService = new AleoRpcService({ configs: config.rpcList });
  }

  private syncBlocks = async (
    address: string,
  ): Promise<AleoAddressInfo | null> => {
    const addressInfo = await this.aleoStorage.getAddressInfo(
      this.chainId,
      address,
    );

    const blockRanges = await this.aleoStorage.getAleoBlockRanges(
      this.chainId,
      address,
    );

    if (blockRanges.length === 0) {
      return null;
    }
    blockRanges.sort((range1, range2) => {
      const [start1] = range1.split("-");
      const [start2] = range2.split("-");
      return parseInt(start2) - parseInt(start1);
    });

    const allRecordsMap: {
      [program in string]?: { [commitment in string]?: RecordDetailWithSpent };
    } = addressInfo?.recordsMap ?? {};
    const allSpentRecordTagsSet = addressInfo?.spentRecordTags
      ? new Set(addressInfo.spentRecordTags)
      : new Set<string>();
    const allTxInfoList = addressInfo?.txInfoList ?? [];
    let [existBegin, existEnd] = addressInfo?.range ?? [];

    for (let i = 0; i < blockRanges.length; i += 1) {
      const blockRange = blockRanges[i];
      const blockInfo = await this.aleoStorage.getAleoBlockInfo(
        this.chainId,
        address,
        blockRange,
      );

      if (!blockInfo) {
        logger.error(
          "===> getBalance blockInfo is null",
          this.chainId,
          address,
          blockRange,
        );
        continue;
      }
      const { recordsMap, txInfoList, spentRecordTags, range } = blockInfo;
      const [blockBegin, blockEnd] = range;
      if (existBegin !== undefined && existEnd !== undefined) {
        if (existBegin <= blockBegin && existEnd >= blockEnd) {
          logger.log(
            "===> skip block",
            blockBegin,
            blockEnd,
            existBegin,
            existEnd,
          );
          continue;
        }
        existBegin = Math.min(existBegin, blockBegin);
        existEnd = Math.max(existEnd, blockEnd);
      } else {
        existBegin = blockBegin;
        existEnd = blockEnd;
      }
      logger.log("===> sync", blockBegin, blockEnd, existBegin, existEnd);
      if (spentRecordTags) {
        for (const spentRecordTag of spentRecordTags) {
          for (const tag of spentRecordTag.tags) {
            allSpentRecordTagsSet.add(tag);
          }
        }
      }
      for (const [programId, records] of Object.entries(recordsMap)) {
        if (!records || records.length === 0) {
          continue;
        }
        const newRecords = allRecordsMap[programId] ?? {};
        for (const record of records) {
          if (!record.tag) {
            logger.error("===> getBalance record.tag is null", record);
          }
          const { commitment } = record;
          if (!newRecords[commitment]) {
            newRecords[commitment] = {
              ...record,
              spent: false,
            };
          } else {
            logger.log(
              "===> record with same commitment",
              record,
              newRecords[commitment],
              commitment,
            );
          }
        }
        allRecordsMap[programId] = newRecords;
      }
      allTxInfoList.push(...txInfoList);
    }
    for (const [programId, recordsMap] of Object.entries(allRecordsMap)) {
      if (!recordsMap) {
        continue;
      }
      const records = Object.values(recordsMap);
      if (!records || records.length === 0) {
        continue;
      }
      for (const [commitment, record] of Object.entries(recordsMap)) {
        if (!record) {
          continue;
        }
        if (record.spent) {
          allSpentRecordTagsSet.delete(record.tag);
          continue;
        }
        const spent = allSpentRecordTagsSet.has(record.tag);
        if (spent) {
          allSpentRecordTagsSet.delete(record.tag);
        }
        recordsMap[commitment] = {
          ...record,
          spent,
        };
      }

      allRecordsMap[programId] = recordsMap;
    }

    const result = {
      recordsMap: allRecordsMap,
      txInfoList: allTxInfoList.sort((tx1, tx2) => tx2.height - tx1.height),
      spentRecordTags: Array.from(allSpentRecordTagsSet),
      range: [existBegin, existEnd],
    };

    await this.aleoStorage.setAddressInfo(this.chainId, address, result);

    return result;
  };

  async getPrivateBalance(address: string): Promise<bigint> {
    const result = await this.syncBlocks(address);

    if (!result) {
      return 0n;
    }

    const { recordsMap } = result;

    const privateBalance =
      Object.values(
        recordsMap[this.config.nativeCurrency.address] ?? {},
      )?.reduce((sum, record) => {
        if (!record) {
          return sum;
        }
        if (record.spent) {
          return sum;
        }
        return sum + parseU64(record.content.microcredits);
      }, 0n) ?? 0n;

    return privateBalance;
  }

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getPublicBalance(address: string): Promise<bigint> {
    const balance = await this.rpcService
      .currInstance()
      .getProgramMappingValue(
        this.config.nativeCurrency.address,
        CREDITS_MAPPING_NAME,
        address,
      );
    console.log("===> public balance: ", balance);
    if (!balance) {
      return 0n;
    }
    return parseU64(balance);
  }

  async getRecords(
    address: string,
    programId: string,
    recordFilter: RecordFilter,
  ) {
    const result = await this.syncBlocks(address);

    if (!result) {
      return [];
    }

    return Object.values(result.recordsMap[programId] ?? {}).filter((item) => {
      if (!item) {
        return false;
      }
      switch (recordFilter) {
        case RecordFilter.SPENT: {
          return item.spent;
        }
        case RecordFilter.UNSPENT: {
          return !item.spent;
        }
        case RecordFilter.ALL: {
          return true;
        }
      }
    });
  }

  async getTxHistory(address: string) {
    const result = await this.syncBlocks(address);

    if (!result) {
      return [];
    }

    return result.txInfoList;
  }
}

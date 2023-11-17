import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoConfig } from "../types/AleoConfig";
import { IAleoStorage } from "../types/IAleoStorage";
import { RecordDetailWithSpent } from "../types/SyncTask";
import { parseU64 } from "../utils/num";
import { logger } from "@/common/utils/logger";

export class AleoService {
  config: AleoConfig;
  chainId: string;
  aleoStorage: IAleoStorage;

  constructor(config: AleoConfig, storage: IAleoStorage) {
    this.config = config;
    this.chainId = config.chainId;
    this.aleoStorage = storage;
  }

  async getPrivateBalance(address: string): Promise<string> {
    const addressInfo = await this.aleoStorage.getAddressInfo(
      this.chainId,
      address,
    );

    const blockRanges = await this.aleoStorage.getAleoBlockRanges(
      this.chainId,
      address,
    );

    if (blockRanges.length === 0) {
      return "0";
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

    const privateBalance =
      Object.values(allRecordsMap[this.config.nativeCurrency.address] ?? {})
        ?.reduce((sum, record) => {
          if (!record) {
            return sum;
          }
          if (record.spent) {
            return sum;
          }
          return sum + parseU64(record.content.microcredits);
        }, 0n)
        .toString() ?? "0";

    await this.aleoStorage.setAddressInfo(this.chainId, address, {
      recordsMap: allRecordsMap,
      txInfoList: allTxInfoList,
      spentRecordTags: Array.from(allSpentRecordTagsSet),
      range: [existBegin, existEnd],
    });

    return privateBalance;
  }
}

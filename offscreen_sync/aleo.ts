import { type LogFunc } from "./aleo.di";
import {
  Field,
  ViewKey,
  RecordPlaintext,
  PrivateKey,
  RecordCiphertext,
  Future,
} from "@provablehq/aleo_wasm_mainnet";
import { AutoSwitch, AutoSwitchServiceType } from "core/utils/retry";
import { Measure, MeasureAsync } from "@/common/utils/measure";
import { ALEO_SYNC_HEIGHT_SIZE } from "@/common/constants";
import { shuffle } from "@/common/utils/array";
import {
  type RecordDetail,
  type FutureJSON,
  type SyncRecordResp,
  type AddressSyncRecordResp,
  type WorkerSyncTask,
} from "core/coins/ALEO/types/SyncTask";
import {
  type AleoApiService,
  createAleoApiService,
} from "core/coins/ALEO/service/instances/sync";
import { type RecordRawInfo } from "core/coins/ALEO/service/api/sync.di";

export class AleoWorker {
  static logger: LogFunc | undefined;
  private isProcessing: boolean = false;
  private taskInfo: WorkerSyncTask | undefined;
  private measureMap: {
    [process in string]?: { time: number; count: number; max: number };
  } = {};

  apiService: AleoApiService;
  // private currIndex: number | undefined;

  static setLogger(logger: LogFunc) {
    AleoWorker.logger = logger;
  }

  constructor(
    private workerId: number,
    apiList: string[],
    public enableMeasure: boolean,
  ) {
    apiList = shuffle(apiList);
    this.apiService = createAleoApiService(
      apiList.map((item) => ({
        url: item,
        chainId: "mainnet",
      })),
    );
  }

  get getWorkerId() {
    return this.workerId;
  }

  log(...args: any[]) {
    if (AleoWorker.logger) {
      AleoWorker.logger("log", ` workerId ${this.workerId} `, ...args);
    } else {
      console.log("===> worker's logger is not set");
    }
  }

  error(...args: any[]) {
    if (AleoWorker.logger) {
      AleoWorker.logger("error", ` workerId ${this.workerId} `, ...args);
    } else {
      console.log("===> worker's logger is not set");
    }
  }

  parsePrivateKey = (privateKeyStr: string): PrivateKey => {
    try {
      const privateKey = PrivateKey.from_string(privateKeyStr);
      return privateKey;
    } catch (err) {
      throw new Error("Invalid private key");
    }
  };

  parseViewKey = (viewKeyStr: string): ViewKey => {
    try {
      const viewKey = ViewKey.from_string(viewKeyStr);
      return viewKey;
    } catch (err) {
      throw new Error("Invalid view key");
    }
  };

  parseU64 = (u64?: string): bigint => {
    if (!u64) {
      return 0n;
    }
    try {
      return BigInt(u64.slice(0, -3));
    } catch (err) {
      this.error("===> parseU64 error: ", err);
      return 0n;
    }
  };

  parseFuture = (futureStr?: string): FutureJSON | undefined => {
    if (!futureStr) {
      return undefined;
    }
    try {
      const future = Future.fromString(futureStr);
      const futureObj = JSON.parse(future.toJSON());
      return futureObj;
    } catch (err) {
      this.error("===> parseFuture error: ", err);
      return undefined;
    }
  };

  parseRecordCiphertext = (recordCiphertextStr: string) => {
    try {
      return RecordCiphertext.fromString(recordCiphertextStr);
    } catch (err) {
      this.error("===> parseRecordCiphertext error: ", err);
      return undefined;
    }
  };

  @MeasureAsync()
  async getRecordsInRange(chainId: string, start: number, end: number) {
    this.apiService.setChainId(chainId);
    const index =
      Math.floor(start / ALEO_SYNC_HEIGHT_SIZE) * ALEO_SYNC_HEIGHT_SIZE;
    const recordsInRange = await this.apiService.getRecords(index);
    return recordsInRange;
  }

  @Measure()
  private computeTag(skTag: Field, commitment: string): string | undefined {
    try {
      const commitmentField = Field.fromString(commitment);
      const tag = RecordPlaintext.tag(skTag, commitmentField);
      return tag;
    } catch (err) {
      this.error("===> computeTag error: ", err);
      return undefined;
    }
  }

  @Measure()
  private decryptRecord(
    viewKey: ViewKey,
    skTag: Field,
    recordRawInfo: RecordRawInfo,
  ): RecordDetail | undefined {
    try {
      const {
        ciphertext,
        commitment,
        transition_program: programId,
        transition_function: functionName,
        transaction_id: transactionId,
        transition_id: transitionId,
        block_height: height,
        block_time: timestamp,
      } = recordRawInfo;
      const record = this.parseRecordCiphertext(ciphertext);
      if (!record) {
        return undefined;
      }
      const newViewKey = viewKey.clone();
      const newSkTag = skTag.clone();
      const isOwner = record.isOwner(newViewKey);
      if (isOwner) {
        const plaintext = record.decrypt(newViewKey);
        const nonce = plaintext.nonce();
        const tag = this.computeTag(newSkTag, commitment);
        return {
          commitment,
          ciphertext,
          programId,
          functionName,
          transactionId,
          transitionId,
          height,
          timestamp,
          plaintext: plaintext.toString(),
          content: JSON.parse(plaintext.toJSON()),
          nonce,
          tag: tag ?? "",
        };
      }
    } catch (err) {
      this.error("==> record decrypt error: ", err);
    }
    return undefined;
  }

  setEnableMeasure = (enable: boolean) => {
    this.enableMeasure = enable;
  };

  syncRecords = async (params: WorkerSyncTask) => {
    const { begin, end, chainId, syncParams } = params;
    if (begin > end) {
      throw new Error("start must be less than end");
    }
    if (begin < 0) {
      throw new Error("start must be greater than 0");
    }
    if (end - begin >= ALEO_SYNC_HEIGHT_SIZE) {
      throw new Error(
        `range must be less than ${ALEO_SYNC_HEIGHT_SIZE} begin: ${begin} end: ${end}`,
      );
    }
    if (
      Math.floor(begin / ALEO_SYNC_HEIGHT_SIZE) !==
      Math.floor(end / ALEO_SYNC_HEIGHT_SIZE)
    ) {
      throw new Error(
        `range must be in the same group begin: ${begin} end: ${end}`,
      );
    }
    const startTime = performance.now();
    const addressResultMap: { [key in string]: SyncRecordResp } = {};
    const addressCache: {
      [key in string]?: { viewKey: ViewKey; skTag: Field };
    } = {};

    try {
      const recordsInRange = await this.getRecordsInRange(chainId, begin, end);
      if (recordsInRange.length === 0) {
        syncParams.forEach((syncParam) => {
          const { address } = syncParam;
          const resultMap = {
            recordsMap: {},
            ...syncParam,
            range: [begin, end],
          };
          addressResultMap[address] = resultMap;
        });
      } else {
        for (let i = recordsInRange.length - 1; i >= 0; i--) {
          const recordRawInfo = recordsInRange[i];
          syncParams.forEach((syncParam) => {
            const { address, viewKey } = syncParam;
            const cache = addressCache[address];
            let viewKeyObj: ViewKey;
            let skTag: Field;
            if (!cache) {
              viewKeyObj = this.parseViewKey(viewKey);
              skTag = viewKeyObj.skTag();
              addressCache[address] = {
                viewKey: viewKeyObj,
                skTag,
              };
            } else {
              viewKeyObj = cache.viewKey;
              skTag = cache.skTag;
            }

            const decryptedRecord = this.decryptRecord(
              viewKeyObj,
              skTag,
              recordRawInfo,
            );
            const resultMap = addressResultMap[address] ?? {
              recordsMap: {},
              ...syncParam,
              range: [begin, end],
            };

            if (decryptedRecord) {
              const { programId } = decryptedRecord;
              resultMap.recordsMap[programId] = {
                ...(resultMap.recordsMap[programId] ?? {}),
                [decryptedRecord.commitment]: decryptedRecord,
              };
            }

            // resultMap.range[0] = i === 0 ? begin : recordRawInfo.id;
            addressResultMap[address] = resultMap;

            // this.currIndex = recordRawInfo.id;
          });
        }
      }
    } catch (err) {
      this.error("===> syncRecords error: ", err);
      const totalTime = performance.now() - startTime;
      return {
        chainId,
        // 现在 record 不好保证顺序，不搞断点继续 sync 了，出错就返回空
        addressResultMap: {},
        measureMap: {
          ...this.measureMap,
          totalTime: {
            time: totalTime,
            max: totalTime,
            count: 1,
          },
        },
      };
    }
    const totalTime = performance.now() - startTime;
    return {
      chainId,
      addressResultMap,
      measureMap: {
        ...this.measureMap,
        totalTime: {
          time: totalTime,
          max: totalTime,
          count: 1,
        },
      },
    };
  };

  beginSyncRecordTask = async (
    params: WorkerSyncTask,
  ): Promise<AddressSyncRecordResp | undefined> => {
    this.taskInfo = { ...params };
    this.isProcessing = true;
    // this.currIndex = undefined;
    this.measureMap = {};
    let resp;
    try {
      resp = await this.syncRecords(params);
    } catch (err) {
      this.error("===> syncRecords error: ", err);
    }
    // this.currIndex = undefined;
    this.isProcessing = false;
    this.taskInfo = undefined;
    this.measureMap = {};
    return resp;
  };
}

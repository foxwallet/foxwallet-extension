import {
  type FeeInfo,
  type RecordDetail,
  type TxHistoryItem,
  type TxInfo,
  type SyncBlockParams,
  type TxMetadata,
  type LogFunc,
  type FutureJSON,
  type SyncBlockResp,
  type RecordDetailWithBlockInfo,
  type BlockSpentTags,
} from "./aleo.di";
import {
  Field,
  ViewKey,
  RecordPlaintext,
  PrivateKey,
  RecordCiphertext,
  Future,
} from "aleo_wasm";
import * as aleo from "aleo/index";
import { AleoRpcService } from "./aleo_service";
import { AutoSwitch } from "@/common/utils/retry";
import { AutoSwitchServiceType } from "@/common/types/retry";
import { Measure, MeasureAsync } from "@/common/utils/measure";
import { ALEO_BLOCK_RANGE } from "@/common/constants";

export class AleoWorker {
  rpcService: AleoRpcService;
  static logger: LogFunc | undefined;
  private taskInfo: SyncBlockParams | undefined;
  private isProcessing = false;
  // finished blocks in current scope
  private currHeight: number | undefined;
  private measureMap: {
    [process in string]?: { time: number; count: number; max: number };
  } = {};

  static setLogger(logger: LogFunc) {
    AleoWorker.logger = logger;
  }

  constructor(
    private workerId: number,
    rpcList: string[],
    public enableMeasure: boolean,
  ) {
    this.rpcService = new AleoRpcService({ configs: rpcList });
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

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC, waitTime: 2000 })
  @MeasureAsync()
  async getBlocksInRange(chainId: string, start: number, end: number) {
    this.rpcService.currInstance().setChainId(chainId);
    const blocksInRange = await this.rpcService.currInstance().getBlockRange(
      start,
      // By default, this rpc will return [scopeBegin, scopeEnd), so we need to add 1 to scopeEnd
      end + 1,
    );
    return blocksInRange;
  }

  private getTransitionIdBySerialNumber = async (serialNumber: string) => {
    try {
      const txId = await this.rpcService
        .currInstance()
        .getTransitionId(serialNumber);
      return txId;
    } catch (err) {
      return undefined;
    }
  };

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
    ciphertext: string,
    commitment: string,
    programId: string,
  ): RecordDetail | undefined {
    try {
      const record = this.parseRecordCiphertext(ciphertext);
      if (!record) {
        return undefined;
      }
      const newViewKey = viewKey.clone();
      const newSkTag = skTag.clone();
      const isOwner = record.isOwner(newViewKey);
      this.log("===> record: ", isOwner);
      if (isOwner) {
        const plaintext = record.decrypt(newViewKey);
        const nonce = plaintext.nonce();
        const tag = this.computeTag(newSkTag, commitment);
        this.log("===> tag: ", tag);
        return {
          programId,
          plaintext: plaintext.toString(),
          content: JSON.parse(plaintext.toJSON()),
          nonce,
          commitment,
          tag,
        };
      }
    } catch (err) {
      this.error("==> record decrypt error: ", err);
    }
    return undefined;
  }

  @Measure()
  parseSenderCreditTransition(
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
  ): TxInfo & {
    receivedRecords?: RecordDetail[];
    spentRecordTags: string[];
  } {
    let receivedRecords: RecordDetail[] | undefined;
    let spentRecordTags: string[] = [];
    // let inputRecordsSerialNumber: string[] = [];
    let receiverAddress: string | undefined;
    let amount: bigint | undefined;
    switch (transition.function) {
      case "transfer_private": {
        // if sender send private tx
        // output[1] is the sender's received record
        // in case of sender send aleo to himself, we need to check output[0] as well
        const records =
          transition.outputs?.map((output) => {
            if (output.type === "record") {
              const record = this.decryptRecord(
                viewKey,
                skTag,
                output.value,
                output.id,
                transition.program,
              );
              return record;
            }
            return undefined;
          }) ?? [];
        receivedRecords = records.filter(
          (record) => !!record,
        ) as RecordDetail[];
        this.log("===> receivedRecords: ", receivedRecords);
        spentRecordTags =
          transition.inputs
            ?.filter((input) => input.type === "record")
            .map((input) => input.tag as string)
            .filter((tag) => !!tag) ?? [];
        break;
      }
      case "transfer_private_to_public": {
        // const serialNumber = transition.inputs?.[0].id;
        // if (serialNumber) {
        //   inputRecordsSerialNumber.push(serialNumber);
        // }
        receiverAddress = transition.inputs?.[1].value ?? "";
        amount = this.parseU64(transition.inputs?.[2].value);
        spentRecordTags = [transition.inputs?.[0].tag as string];
        break;
      }
      case "transfer_public": {
        receiverAddress = transition.inputs?.[0].value ?? "";
        amount = this.parseU64(transition.inputs?.[1].value);
        break;
      }
      case "transfer_public_to_private": {
        amount = this.parseU64(transition.inputs?.[1].value);
        const records =
          transition.outputs?.map((output) => {
            if (output.type === "record") {
              const record = this.decryptRecord(
                viewKey,
                skTag,
                output.value,
                output.id,
                transition.program,
              );
              return record;
            }
            return undefined;
          }) ?? [];
        receivedRecords = records.filter(
          (record) => !!record,
        ) as RecordDetail[];
        break;
      }
      case "join": {
        const output = transition.outputs?.[0];
        this.log("===> join transition: ", output);
        if (output?.type === "record") {
          const record = this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
            transition.program,
          );
          this.log("===> join parsed transition: ", record);
          if (record) {
            receivedRecords = [record];
          }
        }
        spentRecordTags =
          transition.inputs
            ?.filter((input) => input.type === "record")
            .map((input) => input.tag as string)
            .filter((tag) => !!tag) ?? [];
        break;
      }
    }
    return {
      program: "credits.aleo",
      function: transition.function,
      txType: "send",
      address: receiverAddress,
      amount: amount?.toString(),
      receivedRecords,
      spentRecordTags,
      // inputCreditRecordSerialNumber: inputRecordsSerialNumber,
    };
  }

  @Measure()
  parseReceiverCreditTransition(
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ): (TxInfo & { receivedRecords?: RecordDetail[] }) | undefined {
    switch (transition.function) {
      case "transfer_private": {
        // if sender send private tx
        // output[1] is the sender's received record
        // in case of sender send aleo to himself, we need to check output[0] as well
        const output = transition.outputs?.[0];
        if (output && output.type === "record") {
          const record = this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
            transition.program,
          );
          if (record) {
            return {
              program: "credits.aleo",
              function: transition.function,
              txType: "receive",
              receivedRecords: [record],
            };
          }
        }
        return undefined;
      }
      case "transfer_private_to_public": {
        const receiverAddress = transition.inputs?.[1].value ?? "";
        if (receiverAddress === address) {
          const amount = this.parseU64(transition.inputs?.[2].value);
          return {
            program: "credits.aleo",
            function: transition.function,
            txType: "receive",
            amount: amount.toString(),
          };
        }
        return undefined;
      }
      case "transfer_public": {
        const receiverAddress = transition.inputs?.[0].value ?? "";
        if (receiverAddress === address) {
          const futureObj = this.parseFuture(transition.outputs?.[0].value);
          if (futureObj) {
            const senderAddress = futureObj.arguments?.[0];
            const amount = this.parseU64(futureObj.arguments?.[2]);
            return {
              program: "credits.aleo",
              function: transition.function,
              txType: "receive",
              address: senderAddress,
              amount: amount.toString(),
            };
          }
        }
        return undefined;
      }
      case "transfer_public_to_private": {
        const output = transition.outputs?.[0];
        if (output) {
          const record = this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
            transition.program,
          );
          if (record) {
            const amount = this.parseU64(transition.inputs?.[1].value);
            const futureObj = this.parseFuture(transition.outputs?.[0].value);
            const senderAddress = futureObj?.arguments?.[0];
            return {
              program: "credits.aleo",
              function: transition.function,
              txType: "receive",
              address: senderAddress,
              amount: amount.toString(),
              receivedRecords: [record],
            };
          }
        }
        return undefined;
      }
    }
  }

  @Measure()
  parseSplitTransition(
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
  ):
    | (TxInfo & { receivedRecords: RecordDetail[]; spentRecordTags: string[] })
    | undefined {
    const outputs = transition.outputs;
    let spentRecordTags: string[] = [];
    if (outputs) {
      const records: RecordDetail[] = [];
      for (const output of outputs) {
        const record = this.decryptRecord(
          viewKey,
          skTag,
          output.value,
          output.id,
          transition.program,
        );
        if (record) {
          records.push(record);
        } else {
          return undefined;
        }
      }
      if (records.length > 0) {
        spentRecordTags =
          transition.inputs
            ?.filter((intput) => intput.type === "record")
            .map((input) => input.tag as string) ?? [];
        return {
          program: transition.program,
          function: transition.function,
          txType: "send",
          // snarkvm/ledger/src/helpers, split transaction will subtract 10000 from total supply
          amount: "10000",
          receivedRecords: records,
          spentRecordTags,
        };
      }
    }
    return undefined;
  }

  @Measure()
  parseCustomTransition(
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
    type: TxInfo["txType"],
  ): TxInfo & { receivedRecords: RecordDetail[]; spentRecordTags: string[] } {
    const records =
      transition.outputs?.map((output) => {
        if (output.type === "record") {
          const record = this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
            transition.program,
          );
          return record;
        }
        return undefined;
      }) ?? [];
    const customRecords = records.filter(
      (record) => !!record,
    ) as RecordDetail[];
    let spentRecordTags: string[] = [];
    if (type === "send") {
      spentRecordTags =
        transition.inputs
          ?.filter((input) => input.type === "record")
          .map((input) => input.tag as string) ?? [];
    }
    return {
      program: transition.program,
      function: transition.function,
      txType: type,
      receivedRecords: customRecords,
      spentRecordTags,
    };
  }

  private parseSenderExecuteTransition = (
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
  ) => {
    if (transition.program === "credits.aleo") {
      return this.parseSenderCreditTransition(transition, viewKey, skTag);
    } else {
      return this.parseCustomTransition(transition, viewKey, skTag, "send");
    }
  };

  private parseSenderExecuteTransitions = (
    transitions: aleo.Transition[],
    viewKey: ViewKey,
    skTag: Field,
  ) => {
    return transitions.map((transition) => {
      return this.parseSenderExecuteTransition(transition, viewKey, skTag);
    });
  };

  private parseReceiverExecuteTransition = (
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ) => {
    if (transition.program === "credits.aleo") {
      return this.parseReceiverCreditTransition(
        transition,
        viewKey,
        skTag,
        address,
      );
    } else {
      return this.parseCustomTransition(transition, viewKey, skTag, "receive");
    }
  };

  private parseReceiverExecuteTransitions = (
    transitions: aleo.Transition[],
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ) => {
    const parsedTransitions = transitions.map((transition) => {
      return this.parseReceiverExecuteTransition(
        transition,
        viewKey,
        skTag,
        address,
      );
    });
    const nonEmptyTransitions = parsedTransitions.filter(
      (parsedTransition) => !!parsedTransition?.receivedRecords?.length,
    ) as Array<TxInfo & { receivedRecords?: RecordDetail[] }>;
    return nonEmptyTransitions;
  };

  @Measure()
  parseFeeTransition(
    transition: aleo.Transition,
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ):
    | (FeeInfo & {
        receivedRecords?: RecordDetail[];
        spentRecordTags?: string[];
      })
    | undefined {
    switch (transition.function) {
      case "fee_public": {
        const output = transition.outputs?.[0];
        if (!output || output.type !== "future") {
          return undefined;
        }
        const futureObj = this.parseFuture(output.value);
        if (!futureObj) {
          return undefined;
        }
        // 当前地址付 fee
        if (futureObj.arguments && futureObj.arguments[0] === address) {
          const baseFee = this.parseU64(transition.inputs?.[0].value);
          const priorityFee = this.parseU64(transition.inputs?.[1].value);
          const fee = baseFee + priorityFee;

          return {
            feeType: "fee_public",
            baseFee: baseFee.toString(),
            priorityFee: priorityFee.toString(),
            fee: fee.toString(),
          };
        }
        return undefined;
      }
      case "fee_private": {
        const outputs = transition.outputs;
        if (!outputs?.[0]) {
          return undefined;
        }
        const output = outputs[0];
        const receivedRecords: RecordDetail[] = [];
        if (output.type === "record") {
          const record = this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
            transition.program,
          );
          if (record) {
            receivedRecords.push(record);
          }
        }
        if (receivedRecords.length > 0) {
          const baseFee = this.parseU64(transition.inputs?.[1].value);
          const priorityFee = this.parseU64(transition.inputs?.[2].value);
          const fee = baseFee + priorityFee;
          const spentRecordTags = [transition.inputs?.[0].tag as string];
          return {
            feeType: "fee_private",
            baseFee: baseFee.toString(),
            priorityFee: priorityFee.toString(),
            fee: fee.toString(),
            receivedRecords,
            spentRecordTags,
          };
        }
        return undefined;
      }
    }
  }

  private insertRecords = (
    map: { [program in string]?: RecordDetailWithBlockInfo[] },
    program: string,
    txId: string,
    height: number,
    timestamp: number,
    records?: RecordDetail[],
  ) => {
    if (records && records.length > 0) {
      if (!map[program]) {
        map[program] = [];
      }
      map[program]!.push(
        ...records.map((item) => ({
          ...item,
          txId,
          height,
          timestamp,
        })),
      );
    }
  };

  getSyncProcess = () => {
    const taskInfo = this.taskInfo;
    if (!taskInfo) {
      return undefined;
    }
    if (!this.isProcessing) {
      return undefined;
    }
    return {
      ...taskInfo,
      currHeight: this.currHeight,
    };
  };

  setEnableMeasure = (enable: boolean) => {
    this.enableMeasure = enable;
  };

  syncBlocks = async ({ viewKey, chainId, begin, end }: SyncBlockParams) => {
    if (begin > end) {
      throw new Error("start must be less than end");
    }
    if (begin < 0) {
      throw new Error("start must be greater than 0");
    }
    const startTime = performance.now();
    const recordsMap: { [program in string]?: RecordDetailWithBlockInfo[] } =
      {};
    const allSpentRecordTags: BlockSpentTags[] = [];
    const txInfoList: TxHistoryItem[] = [];

    const viewKeyObj = this.parseViewKey(viewKey);
    const skTag = viewKeyObj.skTag();
    const address = viewKeyObj.to_address().to_string();

    const groupNumber = ALEO_BLOCK_RANGE;
    let scopeEnd = end;
    let scopeBegin = Math.max(begin, end - groupNumber + 1);
    try {
      while (scopeBegin <= scopeEnd) {
        // const recordsMapInScope: { [program in string]?: RecordDetail[] } = {};
        // const spentRecordTagsInScope: string[] = [];
        // const txInfoListInScope: TxHistoryItem[] = [];
        const blocksInRange = await this.getBlocksInRange(
          chainId,
          scopeBegin,
          scopeEnd,
        );
        this.log("===> getBlocksInRange: ", scopeBegin, scopeEnd, address);
        blocksInRange.forEach((block) => {
          const transactions = block.transactions;
          const height = block.header.metadata.height;
          const timestamp = block.header.metadata.timestamp;

          const blockRecordsMap: {
            [program in string]?: RecordDetailWithBlockInfo[];
          } = {};
          const blockSpentRecordTags: string[] = [];
          const blockTxInfoList: TxHistoryItem[] = [];

          if (transactions) {
            transactions.forEach((confirmedTransaction) => {
              if (
                confirmedTransaction.status === "accepted" &&
                confirmedTransaction.type === "execute"
              ) {
                const transaction = confirmedTransaction.transaction;
                // 先解析 fee 交易，这样能不同交易进行分类讨论
                // 如果没有 fee 可能是 split 交易
                const feeTransition = transaction.fee?.transition;
                if (feeTransition) {
                  const feeInfo = this.parseFeeTransition(
                    feeTransition,
                    viewKeyObj,
                    skTag,
                    address,
                  );
                  this.log("===> feeInfo: ", feeInfo);
                  // current user is sender
                  if (feeInfo) {
                    const {
                      receivedRecords,
                      spentRecordTags,
                      ...feeInfoWithoutRecords
                    } = feeInfo;
                    if (spentRecordTags) {
                      blockSpentRecordTags.push(...spentRecordTags);
                    }
                    this.insertRecords(
                      blockRecordsMap,
                      feeTransition.program,
                      transaction.id,
                      height,
                      timestamp,
                      receivedRecords,
                    );
                    const txMetadata: TxMetadata = {
                      txId: transaction.id,
                      height,
                      timestamp,
                    };
                    const executeTransitons =
                      transaction.execution?.transitions;
                    if (executeTransitons && executeTransitons.length > 0) {
                      const parsedTransitions =
                        this.parseSenderExecuteTransitions(
                          executeTransitons,
                          viewKeyObj,
                          skTag,
                        );
                      this.log(
                        "===> parsedTransitions: ",
                        executeTransitons,
                        parsedTransitions,
                      );
                      const transitions = parsedTransitions.map(
                        (parsedTransition) => {
                          const {
                            receivedRecords,
                            spentRecordTags,
                            ...txInfo
                          } = parsedTransition;
                          blockSpentRecordTags.push(...spentRecordTags);
                          this.insertRecords(
                            blockRecordsMap,
                            txInfo.program,
                            transaction.id,
                            height,
                            timestamp,
                            receivedRecords,
                          );
                          return txInfo;
                        },
                      );
                      blockTxInfoList.push({
                        transitions,
                        ...txMetadata,
                        feeInfo: {
                          ...feeInfoWithoutRecords,
                        },
                      });
                    }
                  } else {
                    // maybe current user is receiver
                    const executeTransitons =
                      transaction.execution?.transitions;
                    if (executeTransitons && executeTransitons.length > 0) {
                      const parsedTransitions =
                        this.parseReceiverExecuteTransitions(
                          executeTransitons,
                          viewKeyObj,
                          skTag,
                          address,
                        );
                      if (parsedTransitions.length > 0) {
                        const txMetadata: TxMetadata = {
                          txId: transaction.id,
                          height,
                          timestamp,
                        };
                        const transitions = parsedTransitions.map(
                          (parsedTransition) => {
                            const { receivedRecords, ...txInfo } =
                              parsedTransition;
                            this.insertRecords(
                              blockRecordsMap,
                              txInfo.program,
                              transaction.id,
                              height,
                              timestamp,
                              receivedRecords,
                            );
                            return txInfo;
                          },
                        );
                        blockTxInfoList.push({
                          transitions,
                          ...txMetadata,
                        });
                      }
                    }
                  }
                } else if (
                  transaction.execution.transitions?.[0].program ===
                    "credits.aleo" &&
                  transaction.execution.transitions?.[0].function === "split"
                ) {
                  const executeTransiton =
                    transaction.execution?.transitions[0];
                  if (executeTransiton) {
                    const parsedTransition = this.parseSplitTransition(
                      executeTransiton,
                      viewKeyObj,
                      skTag,
                    );
                    if (parsedTransition) {
                      const txMetadata: TxMetadata = {
                        txId: transaction.id,
                        height,
                        timestamp,
                      };
                      const {
                        receivedRecords,
                        spentRecordTags,
                        ...transition
                      } = parsedTransition;
                      blockSpentRecordTags.push(...spentRecordTags);
                      this.insertRecords(
                        blockRecordsMap,
                        transition.program,
                        transaction.id,
                        height,
                        timestamp,
                        receivedRecords,
                      );
                      blockTxInfoList.push({
                        transitions: [transition],
                        ...txMetadata,
                      });
                    }
                  }
                }
              }
            });
          }

          // update scope state
          for (const [key, value] of Object.entries(blockRecordsMap)) {
            if (!value) {
              continue;
            }
            const currArr = recordsMap[key];
            if (!currArr) {
              recordsMap[key] = [...value];
            } else {
              recordsMap[key] = [...currArr, ...value];
            }
          }
          if (blockSpentRecordTags.length > 0) {
            allSpentRecordTags.push({
              height,
              timestamp,
              tags: [...blockSpentRecordTags],
            });
          }
          txInfoList.push(...blockTxInfoList);
          this.currHeight = height;
        });

        scopeEnd = scopeBegin - 1;
        scopeBegin = Math.max(begin, scopeEnd - groupNumber + 1);
      }
    } catch (err) {
      this.error("===> syncBlocks error: ", err);
      const totalTime = performance.now() - startTime;
      return {
        recordsMap,
        txInfoList,
        range: [this.currHeight ?? end + 1, end],
        spentRecordTags: allSpentRecordTags,
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
      recordsMap,
      txInfoList,
      range: [begin, end],
      spentRecordTags: allSpentRecordTags,
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

  beginSyncBlockTask = async ({
    viewKey,
    address,
    chainId,
    begin,
    end,
  }: SyncBlockParams): Promise<SyncBlockResp | undefined> => {
    this.taskInfo = { begin, end, viewKey, address, chainId };
    this.isProcessing = true;
    this.measureMap = {};
    this.currHeight = undefined;
    let resp;
    try {
      resp = await this.syncBlocks({ viewKey, address, chainId, begin, end });
    } catch (err) {
      this.error("===> syncBlocks error: ", err);
    }
    this.isProcessing = false;
    this.taskInfo = undefined;
    this.currHeight = undefined;
    this.measureMap = {};
    return resp;
  };
}

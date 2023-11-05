import type {
  FeeInfo,
  RecordDetail,
  TxHistoryItem,
  TxInfo,
  SyncBlockParams,
  TxMetadata,
} from "./aleo.di";
import type { ViewKey } from "aleo_wasm";
import { Field, RecordPlaintext } from "aleo_wasm";
import { AleoNetworkClient } from "aleo/network-client";
import type { Transition } from "aleo/index";
import {
  parseFuture,
  parseRecordCiphertext,
  parseU64,
  parseViewKey,
} from "./helper";

// TODO: 添加重试逻辑
// TODO: 错误信息发送到主线程
export class AleoWorker {
  networkClients: AleoNetworkClient[];

  constructor(private rpcList: string[]) {
    this.networkClients = rpcList.map((rpc) => {
      return new AleoNetworkClient(rpc);
    });
  }

  // TODO: 添加重试逻辑
  private getBlocksInRange = async (start: number, end: number) => {
    const blocksInRange = await this.networkClients[0].getBlockRange(
      start,
      // By default, this rpc will return [scopeBegin, scopeEnd), so we need to add 1 to scopeEnd
      end + 1,
    );
    return blocksInRange;
  };

  private getTransitionIdBySerialNumber = async (serialNumber: string) => {
    try {
      const txId = await this.networkClients[0].getTransitionId(serialNumber);
      return txId;
    } catch (err) {
      return undefined;
    }
  };

  private computeTag = (
    skTag: Field,
    commitment: string,
  ): string | undefined => {
    try {
      const commitmentField = Field.fromString(commitment);
      const tag = RecordPlaintext.tag(skTag, commitmentField);
      return tag;
    } catch (err) {
      console.log("===> computeTag error: ", err);
      return undefined;
    }
  };

  private decryptRecord = async (
    viewKey: ViewKey,
    skTag: Field,
    ciphertext: string,
    commitment: string,
  ): Promise<RecordDetail | undefined> => {
    try {
      const record = parseRecordCiphertext(ciphertext);
      if (!record) {
        return undefined;
      }
      const newViewKey = viewKey.clone();
      const newSkTag = skTag.clone();
      const isOwner = record.isOwner(newViewKey);
      console.log("===> record: ", isOwner);
      if (isOwner) {
        const plaintext = record.decrypt(newViewKey);
        const nonce = plaintext.nonce();
        const tag = this.computeTag(newSkTag, commitment);
        console.log("===> tag: ", tag);
        return {
          plaintext: plaintext.toString(),
          content: JSON.parse(plaintext.toJSON()),
          nonce,
          commitment,
          tag,
        };
      }
    } catch (err) {
      console.log("==> record decrypt error: ", err);
    }
    return undefined;
  };

  private parseSenderCreditTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
  ): Promise<
    TxInfo & {
      receivedRecords?: RecordDetail[];
      spentRecordTags: string[];
    }
  > => {
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
        const records = await Promise.all(
          transition.outputs?.map(async (output) => {
            if (output.type === "record") {
              const record = await this.decryptRecord(
                viewKey,
                skTag,
                output.value,
                output.id,
              );
              return record;
            }
            return undefined;
          }) ?? [],
        );
        receivedRecords = records.filter(
          (record) => !!record,
        ) as RecordDetail[];
        console.log("===> receivedRecords: ", receivedRecords);
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
        amount = parseU64(transition.inputs?.[2].value);
        spentRecordTags = [transition.inputs?.[0].tag as string];
        break;
      }
      case "transfer_public": {
        receiverAddress = transition.inputs?.[0].value ?? "";
        amount = parseU64(transition.inputs?.[1].value);
        break;
      }
      case "transfer_public_to_private": {
        amount = parseU64(transition.inputs?.[1].value);
        const records = await Promise.all(
          transition.outputs?.map(async (output) => {
            if (output.type === "record") {
              const record = await this.decryptRecord(
                viewKey,
                skTag,
                output.value,
                output.id,
              );
              return record;
            }
            return undefined;
          }) ?? [],
        );
        receivedRecords = records.filter(
          (record) => !!record,
        ) as RecordDetail[];
        break;
      }
      case "join": {
        const output = transition.outputs?.[0];
        console.log("===> join transition: ", output);
        if (output?.type === "record") {
          const record = await this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
          );
          console.log("===> join parsed transition: ", record);
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
  };

  private parseReceiverCreditTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ): Promise<(TxInfo & { receivedRecords?: RecordDetail[] }) | undefined> => {
    switch (transition.function) {
      case "transfer_private": {
        // if sender send private tx
        // output[1] is the sender's received record
        // in case of sender send aleo to himself, we need to check output[0] as well
        const output = transition.outputs?.[0];
        if (output && output.type === "record") {
          const record = await this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
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
        const receiverAddress = transition.inputs?.[1].value || "";
        if (receiverAddress === address) {
          const amount = parseU64(transition.inputs?.[2].value);
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
        const receiverAddress = transition.inputs?.[0].value || "";
        if (receiverAddress === address) {
          const futureObj = parseFuture(transition.outputs?.[0].value);
          if (futureObj) {
            const senderAddress = futureObj.arguments?.[0];
            const amount = parseU64(futureObj.arguments?.[2]);
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
          const record = await this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
          );
          if (record) {
            const amount = parseU64(transition.inputs?.[1].value);
            const futureObj = parseFuture(transition.outputs?.[0].value);
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
  };

  private parseSplitTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
  ): Promise<
    | (TxInfo & { receivedRecords: RecordDetail[]; spentRecordTags: string[] })
    | undefined
  > => {
    const outputs = transition.outputs;
    let spentRecordTags: string[] = [];
    if (outputs) {
      const records: RecordDetail[] = [];
      for (const output of outputs) {
        const record = await this.decryptRecord(
          viewKey,
          skTag,
          output.value,
          output.id,
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
            .map((input) => input.tag as string) || [];
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
  };

  private parseCustomTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
    type: TxInfo["txType"],
  ): Promise<
    TxInfo & { receivedRecords: RecordDetail[]; spentRecordTags: string[] }
  > => {
    const records = await Promise.all(
      transition.outputs?.map(async (output) => {
        if (output.type === "record") {
          const record = await this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
          );
          return record;
        }
        return undefined;
      }) || [],
    );
    const customRecords = records.filter(
      (record) => !!record,
    ) as RecordDetail[];
    let spentRecordTags: string[] = [];
    if (type === "send") {
      spentRecordTags =
        transition.inputs
          ?.filter((input) => input.type === "record")
          .map((input) => input.tag as string) || [];
    }
    return {
      program: transition.program,
      function: transition.function,
      txType: type,
      receivedRecords: customRecords,
      spentRecordTags,
    };
  };

  private parseSenderExecuteTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
  ) => {
    if (transition.program === "credits.aleo") {
      return await this.parseSenderCreditTransition(transition, viewKey, skTag);
    } else {
      return await this.parseCustomTransition(
        transition,
        viewKey,
        skTag,
        "send",
      );
    }
  };

  private parseSenderExecuteTransitions = async (
    transitions: Transition[],
    viewKey: ViewKey,
    skTag: Field,
  ) => {
    return await Promise.all(
      transitions.map((transition) => {
        return this.parseSenderExecuteTransition(transition, viewKey, skTag);
      }),
    );
  };

  private parseReceiverExecuteTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ) => {
    if (transition.program === "credits.aleo") {
      return await this.parseReceiverCreditTransition(
        transition,
        viewKey,
        skTag,
        address,
      );
    } else {
      return await this.parseCustomTransition(
        transition,
        viewKey,
        skTag,
        "receive",
      );
    }
  };

  private parseReceiverExecuteTransitions = async (
    transitions: Transition[],
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ) => {
    const parsedTransitions = await Promise.all(
      transitions.map((transition) => {
        return this.parseReceiverExecuteTransition(
          transition,
          viewKey,
          skTag,
          address,
        );
      }),
    );
    let nonEmptyTransitions = parsedTransitions.filter(
      (parsedTransition) => !!parsedTransition,
    ) as (TxInfo & { receivedRecords?: RecordDetail[] })[];
    return nonEmptyTransitions;
  };

  private parseFeeTransition = async (
    transition: Transition,
    viewKey: ViewKey,
    skTag: Field,
    address: string,
  ): Promise<
    | (FeeInfo & {
        receivedRecords?: RecordDetail[];
        spentRecordTags?: string[];
      })
    | undefined
  > => {
    switch (transition.function) {
      case "fee_public": {
        const output = transition.outputs?.[0];
        if (!output || output.type !== "future") {
          return undefined;
        }
        const futureObj = parseFuture(output.value);
        if (!futureObj) {
          return undefined;
        }
        // 当前地址付 fee
        if (futureObj.arguments && futureObj.arguments[0] === address) {
          const baseFee = parseU64(transition.inputs?.[0].value);
          const priorityFee = parseU64(transition.inputs?.[1].value);
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
        if (!outputs || !outputs[0]) {
          return undefined;
        }
        const output = outputs[0];
        const receivedRecords: RecordDetail[] = [];
        if (output.type === "record") {
          const record = await this.decryptRecord(
            viewKey,
            skTag,
            output.value,
            output.id,
          );
          if (record) {
            receivedRecords.push(record);
          }
        }
        if (receivedRecords.length > 0) {
          const baseFee = parseU64(transition.inputs?.[1].value);
          const priorityFee = parseU64(transition.inputs?.[2].value);
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
  };

  private insertRecords = (
    map: { [program in string]?: RecordDetail[] },
    program: string,
    records?: RecordDetail[],
  ) => {
    if (records && records.length > 0) {
      if (!map[program]) {
        map[program] = [];
      }
      map[program]!.push(...records);
    }
  };

  syncBlocks = async ({ viewKey, begin, end }: SyncBlockParams) => {
    if (begin > end) {
      throw new Error("start must be less than end");
    }
    if (begin < 0) {
      throw new Error("start must be greater than 0");
    }
    const recordsMap: { [program in string]?: RecordDetail[] } = {};
    const allSpentRecordTags: string[] = [];
    const txInfoList: TxHistoryItem[] = [];
    const viewKeyObj = parseViewKey(viewKey);
    const skTag = viewKeyObj.skTag();
    const address = viewKeyObj.to_address().to_string();

    let scopeEnd = end;
    let scopeBegin = Math.max(begin, end - 50);
    while (scopeBegin <= scopeEnd) {
      const blocksInRange = await this.getBlocksInRange(scopeBegin, scopeEnd);
      console.log(
        "===> get blocks in range: ",
        scopeBegin,
        scopeEnd,
        blocksInRange,
        address,
      );
      await Promise.all(
        blocksInRange.map(async (block) => {
          const transactions = block.transactions;
          const height = block.header.metadata.height;
          const timestamp = block.header.metadata.timestamp;
          if (transactions) {
            await Promise.all(
              transactions.map(async (confirmedTransaction) => {
                if (
                  confirmedTransaction.status === "accepted" &&
                  confirmedTransaction.type === "execute"
                ) {
                  const transaction = confirmedTransaction.transaction;
                  // 先解析 fee 交易，这样能不同交易进行分类讨论
                  // 如果没有 fee 可能是 split 交易
                  const feeTransition = transaction.fee?.transition;
                  if (feeTransition) {
                    const feeInfo = await this.parseFeeTransition(
                      feeTransition,
                      viewKeyObj,
                      skTag,
                      address,
                    );
                    console.log("===> feeInfo: ", feeInfo);
                    // current user is sender
                    if (feeInfo) {
                      const {
                        receivedRecords,
                        spentRecordTags,
                        ...feeInfoWithoutRecords
                      } = feeInfo;
                      if (spentRecordTags) {
                        allSpentRecordTags.push(...spentRecordTags);
                      }
                      this.insertRecords(
                        recordsMap,
                        feeTransition.program,
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
                          await this.parseSenderExecuteTransitions(
                            executeTransitons,
                            viewKeyObj,
                            skTag,
                          );
                        console.log(
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
                            allSpentRecordTags.push(...spentRecordTags);
                            this.insertRecords(
                              recordsMap,
                              txInfo.program,
                              receivedRecords,
                            );
                            return txInfo;
                          },
                        );
                        txInfoList.push({
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
                          await this.parseReceiverExecuteTransitions(
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
                                recordsMap,
                                txInfo.program,
                                receivedRecords,
                              );
                              return txInfo;
                            },
                          );
                          txInfoList.push({
                            transitions: transitions,
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
                      const parsedTransition = await this.parseSplitTransition(
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
                        allSpentRecordTags.push(...spentRecordTags);
                        this.insertRecords(
                          recordsMap,
                          transition.program,
                          receivedRecords,
                        );
                        txInfoList.push({
                          transitions: [transition],
                          ...txMetadata,
                        });
                      }
                    }
                  }
                }
              }),
            );
          }
        }),
      );

      scopeEnd = scopeBegin - 1;
      scopeBegin = Math.max(begin, scopeEnd - 50);
    }
    return {
      recordsMap,
      txInfoList,
      range: [begin, end],
      spentRecordTags: allSpentRecordTags,
    };
  };
}

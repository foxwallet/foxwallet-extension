import {
  FeeInfo,
  RecordDetail,
  TxHistoryItem,
  TxInfo,
  SyncBlockParams,
  TxMetadata,
} from "./aleo.di";
import { PrivateKey, RecordCiphertext, Future, ViewKey } from "aleo_wasm";
import { AleoNetworkClient } from "aleo/network-client";
import { Transition } from "aleo/index";
import { transition } from "@chakra-ui/react";

// TODO: 添加重试逻辑
// TODO: 错误信息发送到主线程
class AleoWorker {
  networkClient: AleoNetworkClient;

  constructor(rpcUrl: string) {
    this.networkClient = new AleoNetworkClient(rpcUrl);
  }

  resolvePrivateKey = (privateKeyStr: string): PrivateKey => {
    try {
      const privateKey = PrivateKey.from_string(privateKeyStr);
      return privateKey;
    } catch (err) {
      throw new Error("Invalid private key");
    }
  };

  // TODO: 添加重试逻辑
  getBlocksInRange = async (start: number, end: number) => {
    const blocksInRange = await this.networkClient.getBlockRange(
      start,
      // By default, this rpc will return [scopeBegin, scopeEnd), so we need to add 1 to scopeEnd
      end + 1,
    );
    return blocksInRange;
  };

  getTransitionIdBySerialNumber = async (serialNumber: string) => {
    try {
      const txId = await this.networkClient.getTransitionId(serialNumber);
      return txId;
    } catch (err) {
      return undefined;
    }
  };

  parseU64 = (u64?: string): bigint => {
    if (!u64) {
      return 0n;
    }
    try {
      return BigInt(u64.slice(0, -3));
    } catch (err) {
      console.log("===> parseU64 error: ", err);
      return 0n;
    }
  };

  parseFuture = (futureStr?: string) => {
    if (!futureStr) {
      return undefined;
    }
    try {
      const future = Future.fromString(futureStr);
      const futureObj = JSON.parse(future.toJSON());
      return futureObj;
    } catch (err) {
      console.log("===> parseFuture error: ", err);
      return undefined;
    }
  };

  decryptRecord = async (
    privateKey: PrivateKey,
    viewKey: ViewKey,
    program: string,
    recordName: string,
    ciphertext: string,
  ): Promise<RecordDetail | undefined> => {
    try {
      const record = RecordCiphertext.fromString(ciphertext);
      const isOwner = record.isOwner(viewKey);
      if (isOwner) {
        const plaintext = record.decrypt(viewKey);
        const nonce = plaintext.nonce();
        const serialNumber = plaintext.serialNumberString(
          privateKey,
          program,
          recordName,
        );
        const transitionId =
          await this.getTransitionIdBySerialNumber(serialNumber);
        return {
          plaintext: plaintext.toString(),
          content: JSON.parse(plaintext.toJSON()),
          nonce,
          serialNumber,
          spentTransitionId: transitionId,
        };
      }
    } catch (err) {
      console.log("==> record decrypt error: ", err);
    }
    return undefined;
  };

  parseSenderCreditTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
  ): Promise<TxInfo & { receivedRecords?: RecordDetail[] }> => {
    let receivedRecords: RecordDetail[] | undefined;
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
                privateKey,
                viewKey,
                transition.program,
                transition.function,
                output.value,
              );
              return record;
            }
            return undefined;
          }) || [],
        );
        receivedRecords = records.filter(
          (record) => !!record,
        ) as RecordDetail[];
        break;
      }
      case "transfer_private_to_public": {
        // const serialNumber = transition.inputs?.[0].id;
        // if (serialNumber) {
        //   inputRecordsSerialNumber.push(serialNumber);
        // }
        receiverAddress = transition.inputs?.[1].value || "";
        amount = this.parseU64(transition.inputs?.[2].value);
        break;
      }
      case "transfer_public": {
        receiverAddress = transition.inputs?.[0].value || "";
        amount = this.parseU64(transition.inputs?.[1].value);
        break;
      }
      case "transfer_public_to_private": {
        amount = this.parseU64(transition.inputs?.[1].value);
        const records = await Promise.all(
          transition.outputs?.map(async (output) => {
            if (output.type === "record") {
              const record = await this.decryptRecord(
                privateKey,
                viewKey,
                transition.program,
                transition.function,
                output.value,
              );
              return record;
            }
            return undefined;
          }) || [],
        );
        receivedRecords = records.filter(
          (record) => !!record,
        ) as RecordDetail[];
        break;
      }
      case "join": {
        const output = transition.outputs?.[0];
        if (output?.type === "record") {
          const record = await this.decryptRecord(
            privateKey,
            viewKey,
            transition.program,
            transition.function,
            output.value,
          );
          if (record) {
            receivedRecords = [record];
          }
        }
        break;
      }
    }
    return {
      program: "credits.aleo",
      function: transition.function,
      txType: "send",
      address: receiverAddress,
      amount,
      receivedRecords,
      // inputCreditRecordSerialNumber: inputRecordsSerialNumber,
    };
  };

  parseReceiverCreditTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
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
            privateKey,
            viewKey,
            transition.program,
            transition.function,
            output.value,
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
          const amount = this.parseU64(transition.inputs?.[2].value);
          return {
            program: "credits.aleo",
            function: transition.function,
            txType: "receive",
            amount,
          };
        }
        return undefined;
      }
      case "transfer_public": {
        const receiverAddress = transition.inputs?.[0].value || "";
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
              amount,
            };
          }
        }
        return undefined;
      }
      case "transfer_public_to_private": {
        const output = transition.outputs?.[0];
        if (output) {
          const record = await this.decryptRecord(
            privateKey,
            viewKey,
            transition.program,
            transition.function,
            output.value,
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
              amount,
              receivedRecords: [record],
            };
          }
        }
        return undefined;
      }
    }
  };

  parseSplitTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
  ): Promise<(TxInfo & { receivedRecords: RecordDetail[] }) | undefined> => {
    const outputs = transition.outputs;
    if (outputs) {
      const records: RecordDetail[] = [];
      for (let output of outputs) {
        const record = await this.decryptRecord(
          privateKey,
          viewKey,
          transition.program,
          transition.function,
          output.value,
        );
        if (record) {
          records.push(record);
        } else {
          return undefined;
        }
      }
      if (records.length > 0) {
        return {
          program: transition.program,
          function: transition.function,
          txType: "send",
          // snarkvm/ledger/src/helpers, split transaction will subtract 10000 from total supply
          amount: 10000n,
          receivedRecords: records,
        };
      }
    }
    return undefined;
  };

  parseCustomTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
    type: TxInfo["txType"],
  ): Promise<TxInfo & { receivedRecords: RecordDetail[] }> => {
    const records = await Promise.all(
      transition.outputs?.map(async (output) => {
        if (output.type === "record") {
          const record = await this.decryptRecord(
            privateKey,
            viewKey,
            transition.program,
            transition.function,
            output.value,
          );
          return record;
        }
        return undefined;
      }) || [],
    );
    const customRecords = records.filter(
      (record) => !!record,
    ) as RecordDetail[];
    return {
      program: transition.program,
      function: transition.function,
      txType: type,
      receivedRecords: customRecords,
    };
  };

  parseSenderExecuteTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
  ) => {
    if (transition.program === "credits.aleo") {
      return await this.parseSenderCreditTransition(
        transition,
        privateKey,
        viewKey,
      );
    } else {
      return await this.parseCustomTransition(
        transition,
        privateKey,
        viewKey,
        "send",
      );
    }
  };

  parseSenderExecuteTransitions = async (
    transitions: Transition[],
    privateKey: PrivateKey,
    viewKey: ViewKey,
  ) => {
    return await Promise.all(
      transitions.map((transition) => {
        return this.parseSenderExecuteTransition(
          transition,
          privateKey,
          viewKey,
        );
      }),
    );
  };

  parseReceiverExecuteTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
    address: string,
  ) => {
    if (transition.program === "credits.aleo") {
      return await this.parseReceiverCreditTransition(
        transition,
        privateKey,
        viewKey,
        address,
      );
    } else {
      return await this.parseCustomTransition(
        transition,
        privateKey,
        viewKey,
        "receive",
      );
    }
  };

  parseReceiverExecuteTransitions = async (
    transitions: Transition[],
    privateKey: PrivateKey,
    viewKey: ViewKey,
    address: string,
  ) => {
    const parsedTransitions = await Promise.all(
      transitions.map((transition) => {
        return this.parseReceiverExecuteTransition(
          transition,
          privateKey,
          viewKey,
          address,
        );
      }),
    );
    let nonEmptyTransitions = parsedTransitions.filter(
      (parsedTransition) => !!parsedTransition,
    ) as (TxInfo & { receivedRecords?: RecordDetail[] })[];
    return nonEmptyTransitions;
  };

  parseFeeTransition = async (
    transition: Transition,
    privateKey: PrivateKey,
    viewKey: ViewKey,
    address: string,
  ): Promise<(FeeInfo & { receivedRecords?: RecordDetail[] }) | undefined> => {
    switch (transition.function) {
      case "fee_public": {
        const output = transition.outputs?.[0];
        if (!output || output.type !== "future") {
          return undefined;
        }
        const future = Future.fromString(output.value);
        const futureObj = JSON.parse(future.toJSON());
        // 当前地址付 fee
        if (futureObj.arguments && futureObj.arguments[0] === address) {
          const baseFee = this.parseU64(transition.inputs?.[0].value);
          const priorityFee = this.parseU64(transition.inputs?.[1].value);
          const fee = baseFee + priorityFee;

          return {
            feeType: "fee_public",
            baseFee,
            priorityFee,
            fee,
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
            privateKey,
            viewKey,
            transition.program,
            transition.function,
            output.value,
          );
          if (record) {
            receivedRecords.push(record);
          }
        }
        if (receivedRecords.length > 0) {
          const baseFee = this.parseU64(transition.inputs?.[1].value);
          const priorityFee = this.parseU64(transition.inputs?.[2].value);
          const fee = baseFee + priorityFee;
          return {
            feeType: "fee_private",
            baseFee,
            priorityFee,
            fee,
            receivedRecords,
          };
        }
        return undefined;
      }
    }
  };

  insertRecords = async (
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

  getRecordsDetail = async ({ privateKey, begin, end }: SyncBlockParams) => {
    if (begin > end) {
      throw new Error("start must be less than end");
    }
    if (begin < 0) {
      throw new Error("start must be greater than 0");
    }
    const recordsMap: { [program in string]?: RecordDetail[] } = {};
    const txInfoList: TxHistoryItem[] = [];
    const privateKeyObj = this.resolvePrivateKey(privateKey);
    const viewKey = privateKeyObj.to_view_key();
    const address = privateKeyObj.to_address().to_string();

    let scopeEnd = end;
    let scopeBegin = Math.max(begin, end - 50);
    while (scopeBegin <= scopeEnd) {
      const blocksInRange = await this.getBlocksInRange(scopeBegin, scopeEnd);
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
                      privateKeyObj,
                      viewKey,
                      address,
                    );
                    // current user is sender
                    if (feeInfo) {
                      const { receivedRecords, ...feeInfoWithoutRecords } =
                        feeInfo;
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
                            privateKeyObj,
                            viewKey,
                          );
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
                            privateKeyObj,
                            viewKey,
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
                        privateKeyObj,
                        viewKey,
                      );
                      if (parsedTransition) {
                        const txMetadata: TxMetadata = {
                          txId: transaction.id,
                          height,
                          timestamp,
                        };
                        const { receivedRecords, ...transition } =
                          parsedTransition;
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
  };
}

import EthConstants, { FUNC_SIG } from "../constants";
import { BigNumber, utils as ethUtils } from "ethers";
import { TxLabel } from "core/types/TransactionHistory";
import { type ParamType } from "@ethersproject/abi";
import commonABI from "core/assets/abi/commonABI.json";
import { type Log } from "@ethersproject/abstract-provider";
import { type TokenTransferLogInfo } from "core/types/NativeCoinTransaction";

// @ts-expect-error json?
const commonABIInterface = new ethUtils.Interface(commonABI);

export const stripHexPrefix = (address: string) => {
  if (address.startsWith("0x")) {
    address = address.replace("0x", "");
  }
  return address;
};

export const isSafeChainId = (chainId: number) => {
  return (
    Number.isSafeInteger(chainId) &&
    chainId > 0 &&
    chainId <= EthConstants.MAX_SAFE_CHAIN_ID
  );
};

export const parseEthChainId = (
  chainId: string | number,
): { valid: boolean; chainId: number } => {
  if (typeof chainId === "number") {
    return { valid: isSafeChainId(chainId), chainId };
  }
  if (typeof chainId === "string") {
    try {
      let newId: number;
      if (chainId.toLowerCase().startsWith("0x")) {
        newId = parseInt(chainId, 16);
      } else {
        newId = parseInt(chainId, 10);
      }
      return {
        valid: isSafeChainId(newId),
        chainId: newId,
      };
    } catch (errr) {
      return { valid: false, chainId: 0 };
    }
  }
  return { valid: false, chainId };
};

export const toChecksumAddress = (address: string | undefined): string => {
  try {
    if (!address) return "";
    return ethUtils.getAddress(address ?? "");
  } catch (error) {
    console.log("toChecksumAddress", error);
    return address ?? "";
  }
};

export type TxDataInfo = {
  funcName: string;
  paramNames?: ParamType[];
  paramValues?: ethUtils.Result;
};

export const decodeTxData = (txData: string): TxDataInfo | undefined => {
  if (!txData || txData.length < 10 || !txData.startsWith("0x")) {
    return undefined;
  }
  const funcSig = txData.slice(0, 10);
  try {
    const funcFrag = commonABIInterface.getFunction(funcSig);
    const paramValues = commonABIInterface.decodeFunctionData(funcFrag, txData);
    return {
      funcName: funcFrag.name,
      paramNames: funcFrag.inputs,
      paramValues,
    };
  } catch (e) {
    return undefined;
  }
};

export function getTxLabelEVM(data: string, to: string): TxLabel | undefined {
  if (data && data.length >= 10) {
    if (to === "0x") {
      return TxLabel.CONTRACT_CREATE;
    }

    const funcSig = data.slice(0, 10);
    switch (funcSig) {
      case FUNC_SIG.INSCRIBE:
        return TxLabel.INSCRIBE;
      case FUNC_SIG.TOKEN_APPROVE:
      case FUNC_SIG.TOKEN_APPROVE_FOR_ALL:
      case FUNC_SIG.TOKEN_INCREASE_ALLOWANCE:
        return TxLabel.TOKEN_APPROVE;
      case FUNC_SIG.TOKEN_TRANSFER:
        return TxLabel.TOKEN_TRANSFER;
      case FUNC_SIG.STAKE:
        return TxLabel.STAKE;
      case FUNC_SIG.UNSTAKE:
        return TxLabel.UNSTAKE;
      default: {
        const decoded = decodeTxData(data);
        const funcName = decoded?.funcName ?? "";
        if (funcName.toLowerCase().startsWith("swap")) {
          return TxLabel.SWAP;
        }
        if (funcName.toLowerCase().startsWith("bridge")) {
          return TxLabel.BRDIGE;
        }
        return TxLabel.CONTRACT_CALL;
      }
    }
  }
  return undefined;
}

export const parseTokenTransferLogInfo = (
  log: Log,
): TokenTransferLogInfo | undefined => {
  if (
    log.topics.length < 3 ||
    log.topics[0] !== EthConstants.TOKEN_TRANSFER_TOPIC
  ) {
    return undefined;
  }
  const value = log.data === "0x" ? 0n : BigNumber.from(log.data).toBigInt();
  let tokenId;
  if (log.topics.length >= 4) {
    // ERC721 or ERC1155
    tokenId = BigNumber.from(log.topics[3]).toBigInt();
  }
  return {
    token: log.address,
    from: "0x" + log.topics[1].substring(26),
    to: "0x" + log.topics[2].substring(26),
    value,
    tokenId,
  };
};

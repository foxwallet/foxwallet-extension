import {
  ContractStandard,
  type ETHConfig,
} from "core/coins/ETH/types/ETHConfig";
import { CoinServiceBasic } from "core/coins/CoinServiceBasic";
import { parseEthChainId } from "core/coins/ETH/utils";
import { type NativeBalanceRes } from "core/types/Balance";
import {
  createEthRpcService,
  type EthRpcService,
} from "core/coins/ETH/service/instances/rpc";
import {
  type NativeCoinSendTxRes,
  type NativeCoinSendTxParams,
  type EstimateGasParam,
} from "core/types/NativeCoinTransaction";
import { type CoinType } from "core/types";
import {
  Log,
  type TransactionRequest,
  type TransactionResponse,
} from "@ethersproject/abstract-provider";
import { ETH_CHAIN_CONFIGS } from "core/coins/ETH/config/chains";
import constants, {
  FIL_FORWARDER_ADDRESS,
  FILECOIN_ADDRESS_PREFIX,
} from "../constants";
import {
  ethAddressFromDelegated,
  validateAddressString,
} from "@glif/filecoin-address";
import { Address } from "@zondax/izari-tools";
import { type FilForwarderTxParams } from "core/types/TokenTransaction";
import {
  type ContractInterface,
  type PopulatedTransaction,
} from "@ethersproject/contracts";
import {
  Contract,
  VoidSigner,
  Wallet,
  type ethers,
  type Signer,
  FixedNumber,
  utils as ethUtils,
  BigNumber,
} from "ethers";
import erc20abi from "core/assets/abi/erc20abi.json";
import erc721abi from "core/assets/abi/erc721abi.json";
import erc1155abi from "core/assets/abi/erc1155abi.json";
import filForwarderAbi from "core/assets/abi/FilForwarderABI.json";
import hashkeyAbi from "core/assets/abi/HashKeyABI.json";
import {
  type FeeData,
  type GasFee,
  type GasFeeEIP1559,
  type GasFeeLegacy,
  GasFeeType,
  type SerializeGasFee,
  GasGrade,
} from "core/types/GasFee";
import { addHexPrefix, stripHexPrefix } from "ethereumjs-util";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { isSameAddress } from "core/utils/address";
import { hexValue } from "ethers/lib/utils";

export class EthService extends CoinServiceBasic {
  config: ETHConfig;
  chainId: number;
  rpcService: EthRpcService;

  signWalletMap: { [address: string]: Wallet };
  voidSignerMap: { [address: string]: VoidSigner };
  contractMap: { [standard: string]: { [address: string]: Contract } };
  constructor(config: ETHConfig) {
    super(config);
    this.config = config;
    const { valid, chainId } = parseEthChainId(config.chainId);
    if (!valid) {
      throw new Error(
        `Invalid chainId ${config.chainId} for ${config.chainName}}`,
      );
    }
    this.rpcService = createEthRpcService(config);

    this.chainId = chainId;
    this.signWalletMap = {};
    this.voidSignerMap = {};
    this.contractMap = {};
  }

  async getBalance(address: string): Promise<NativeBalanceRes> {
    const balance = await this.rpcService.getBalance(address);
    return {
      // ...this.config.nativeCurrency,
      total: balance.toBigInt(),
    };
  }

  private getContract(
    standard: ContractStandard,
    contractAddress: string,
    signer: Signer | ethers.providers.Provider,
  ) {
    if (!this.contractMap[standard]) {
      this.contractMap[standard] = {};
    }
    if (!this.contractMap[standard][contractAddress]) {
      let abi: ContractInterface;
      switch (standard) {
        case ContractStandard.ERC20:
          abi = erc20abi;
          break;
        case ContractStandard.ERC721:
          abi = erc721abi;
          break;
        case ContractStandard.ERC1155:
          abi = erc1155abi;
          break;
        case ContractStandard.FIL_FORWARDER:
          abi = filForwarderAbi;
          break;
        case ContractStandard.HASHKEY:
          abi = hashkeyAbi;
          break;
        default:
          throw new Error("unknown ContractStandard " + standard);
      }
      this.contractMap[standard][contractAddress] = new Contract(
        contractAddress,
        abi,
        signer,
      );
    } else {
      this.contractMap[standard][contractAddress] =
        this.contractMap[standard][contractAddress].connect(signer);
    }
    return this.contractMap[standard][contractAddress];
  }

  async sendNativeCoin(
    params: NativeCoinSendTxParams<CoinType.ETH>,
  ): Promise<NativeCoinSendTxRes<CoinType.ETH>> {
    const {
      tx: { from, to, value, gasFee, data, nonce },
      signer: { privateKey },
    } = params;

    const txReq: TransactionRequest = {
      from,
      to,
      value,
      data,
      nonce,
    };

    if (this.isFilecoinAddress(to)) {
      const destination = Address.fromString(to).toBytes();
      const txn = await this.populateFilForwarderTx({
        from,
        to: destination,
        value,
      });
      txReq.to = txn.to;
      txReq.value = txn.value ?? 0n;
      txReq.data = txn.data;
    }

    return await this.sendTransactionRequest(txReq, privateKey, from, gasFee);
  }

  // 在 validateAddress 操作后使用，用于区分 eth 地址和 fil 地址
  private isFilecoinAddress(to: string) {
    if (
      this.config.uniqueId === ETH_CHAIN_CONFIGS.FILECOIN_EVM.uniqueId &&
      to.startsWith(FILECOIN_ADDRESS_PREFIX)
    ) {
      return validateAddressString(to);
    }
    return false;
  }

  async populateFilForwarderTx(
    params: FilForwarderTxParams,
  ): Promise<PopulatedTransaction> {
    const { from, to, value } = params;
    const voidSigner = this.getVoidSigner(from);
    const filForwarderContract = this.getContract(
      ContractStandard.FIL_FORWARDER,
      FIL_FORWARDER_ADDRESS,
      voidSigner,
    );
    return await filForwarderContract.populateTransaction.forward(to, {
      value,
    });
  }

  private getVoidSigner(address: string): VoidSigner {
    if (!this.voidSignerMap[address]) {
      this.voidSignerMap[address] = new VoidSigner(address, this.rpcService);
    } else {
      this.voidSignerMap[address] = this.voidSignerMap[address].connect(
        this.rpcService,
      );
    }
    return this.voidSignerMap[address];
  }

  supportGasGrade(): boolean {
    return this.config.uniqueId === InnerChainUniqueId.ETHEREUM;
  }

  // @MemoizeExpiring(60 * 1000)
  private async getEthGradeData() {
    const request = await fetch(
      "https://gas-api.metaswap.codefi.network/networks/1/suggestedGasFees",
    );
    const response = await request.json();
    const { low, medium, high } = response.data;
    const toSafeGwei = (str: string) => Number(Number(str).toFixed(9));
    return {
      [GasGrade.Fast]: {
        label: "<15s",
        maxFeePerGas: toSafeGwei(high.suggestedMaxFeePerGas),
        maxPriorityFeePerGas: toSafeGwei(high.suggestedMaxPriorityFeePerGas),
      },
      [GasGrade.Middle]: {
        label: "<30s",
        maxFeePerGas: toSafeGwei(medium.suggestedMaxFeePerGas),
        maxPriorityFeePerGas: toSafeGwei(medium.suggestedMaxPriorityFeePerGas),
      },
      [GasGrade.Slow]: {
        label: "≈30s",
        maxFeePerGas: toSafeGwei(low.suggestedMaxFeePerGas),
        maxPriorityFeePerGas: toSafeGwei(low.suggestedMaxPriorityFeePerGas),
      },
    };
  }

  async getFeeData(): Promise<FeeData<GasFeeType> | undefined> {
    if (this.config.uniqueId === InnerChainUniqueId.ETHEREUM) {
      const gradeData = await this.getEthGradeData();
      return {
        maxFeePerGas: ethUtils
          .parseUnits(`${gradeData[GasGrade.Middle].maxFeePerGas}`, "gwei")
          .toBigInt(),
        maxPriorityFeePerGas: ethUtils
          .parseUnits(
            `${gradeData[GasGrade.Middle].maxPriorityFeePerGas}`,
            "gwei",
          )
          .toBigInt(),
        eip1559: true,
      };
    }
    const block = await this.rpcService.getBlock("latest");
    let maxFeePerGas = null;
    if (block?.baseFeePerGas) {
      // We may want to compute this more accurately in the future,
      // using the formula "check if the base fee is correct".
      // See: https://eips.ethereum.org/EIPS/eip-1559
      const baseFeePerGas = FixedNumber.from(block.baseFeePerGas);
      const maxPriorityFeePerGas = await this.getMaxPriorityFeePerGas();
      if (!maxPriorityFeePerGas) {
        return undefined;
      }
      let multiplier = FixedNumber.from("1.27");
      if (this.config.uniqueId === InnerChainUniqueId.FILECOIN_EVM) {
        multiplier = FixedNumber.from("1.55");
      }
      maxFeePerGas = ethUtils
        .parseUnits(
          baseFeePerGas.mulUnsafe(multiplier).round().toString(),
          "wei",
        )
        .add(maxPriorityFeePerGas ?? 0)
        .toBigInt();
      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
        eip1559: true,
      };
    } else {
      const gasPrice = await this.rpcService.getGasPrice();
      return {
        gasPrice: gasPrice.toBigInt(),
        eip1559: false,
      };
    }
  }

  private getMinGasLimit(functionHash: string, to: string | undefined): number {
    if (!this.config.minGasLimits) {
      return constants.DEFAULT_GAS_LIMIT;
    }
    // 先匹配 contract 和 functionHash 都对的上的
    let minLimit = this.config.minGasLimits?.find(
      (item) =>
        to &&
        functionHash &&
        isSameAddress(item.contract, to) &&
        item.functionHash === functionHash,
    )?.gasLimit;

    // 如何没匹配上，则取 contract 为空的
    if (!minLimit) {
      minLimit = this.config.minGasLimits?.find(
        (item) =>
          !item.contract && functionHash && item.functionHash === functionHash,
      )?.gasLimit;
    }

    // 还没匹配上，取 contract 和 functionHash 都为空的
    if (!minLimit) {
      minLimit = this.config.minGasLimits?.find(
        (item) => !item.contract && !item.functionHash,
      )?.gasLimit;
    }

    return minLimit ?? constants.DEFAULT_GAS_LIMIT;
  }

  supportCustomGasFee(): boolean {
    return true;
  }

  async estimateGas(txReq: TransactionRequest): Promise<bigint> {
    const gasLimit = await this.rpcService.estimateGas(txReq);
    if (txReq.data === "0x") {
      return gasLimit.toBigInt();
    }
    // 合约的 GasLimit 增加 5% 以保证交易成功
    return gasLimit.mul(105).div(100).toBigInt();
  }

  async estimateGasFee(
    params: EstimateGasParam<CoinType.ETH>,
  ): Promise<GasFee<CoinType.ETH> | undefined> {
    const {
      tx: { from, to, value, data },
      option,
    } = params;
    if (option) {
      if (option.type === GasFeeType.EIP1559) {
        const { gasLimit, maxPriorityFeePerGas, maxFeePerGas } =
          option as GasFeeEIP1559;
        if (gasLimit && maxPriorityFeePerGas && maxFeePerGas) {
          return {
            gasLimit,
            maxPriorityFeePerGas,
            maxFeePerGas,
            estimateGas: maxFeePerGas * BigInt(gasLimit),
            type: GasFeeType.EIP1559,
          };
        }
      } else if (option.type === GasFeeType.LEGACY) {
        const { gasLimit, gasPrice } = option as GasFeeLegacy;
        if (gasLimit && gasPrice) {
          return {
            gasLimit,
            gasPrice,
            estimateGas: gasPrice * BigInt(gasLimit),
            type: GasFeeType.LEGACY,
          };
        }
      }
    }

    if (to && this.isFilecoinAddress(to)) {
      const destination = Address.fromString(to).toBytes();
      const txn = await this.populateFilForwarderTx({
        from,
        to: destination,
        value,
      });
      if (!txn?.from || !txn.to || !txn.data) {
        throw new Error("populateFilForwarderTx failed");
      }
      return this.estimateGasFee({
        tx: {
          from: txn.from,
          to: txn.to,
          value,
          data: txn.data,
        },
        option,
      });
    }

    const txReq = {
      to,
      from,
      value,
      data: data || "0x",
      chainId: this.chainId,
    };
    const [estimateGas, feeData] = await Promise.all([
      this.estimateGas(txReq),
      this.getFeeData(),
    ]);
    if (!feeData) {
      throw new Error("failed loading network fee data");
    }
    const minGasLimit = this.getMinGasLimit(
      hexValue(txReq.data).slice(0, 10),
      to,
    );
    const gasLimit = Math.max(
      Number(estimateGas),
      minGasLimit,
      option?.gasLimit ?? 0,
    );

    if (
      feeData.eip1559 &&
      feeData.maxFeePerGas &&
      feeData.maxPriorityFeePerGas
    ) {
      const maxPriorityFeePerGas = BigNumber.from(feeData.maxPriorityFeePerGas);
      const maxFeePerGas = BigNumber.from(feeData.maxFeePerGas);
      return {
        gasLimit,
        maxPriorityFeePerGas: maxPriorityFeePerGas.toBigInt(),
        maxFeePerGas: feeData.maxFeePerGas,
        estimateGas: maxFeePerGas.mul(gasLimit).toBigInt(),
        type: GasFeeType.EIP1559,
      };
    } else if (!feeData.eip1559 && feeData.gasPrice) {
      const gasPrice = feeData.gasPrice;
      return {
        gasLimit,
        gasPrice,
        estimateGas: gasPrice * BigInt(gasLimit),
        type: GasFeeType.LEGACY,
      };
    }
    return undefined;
  }

  async sendTransactionRequest(
    txReq: TransactionRequest,
    privateKey: string,
    address: string,
    gasFee?: GasFee<CoinType.ETH>,
  ): Promise<NativeCoinSendTxRes<CoinType.ETH>> {
    if (gasFee?.type === GasFeeType.LEGACY) {
      if (gasFee.gasLimit) {
        txReq.gasLimit = gasFee.gasLimit;
      }
      txReq.gasPrice = gasFee.gasPrice;
    } else if (gasFee?.type === GasFeeType.EIP1559) {
      if (gasFee.gasLimit) {
        txReq.gasLimit = gasFee.gasLimit;
      }
      txReq.maxFeePerGas = gasFee.maxFeePerGas;
      txReq.maxPriorityFeePerGas = gasFee.maxPriorityFeePerGas;
    }
    const signedTx = await this.signTransactionRequest(
      txReq,
      privateKey,
      address,
    );
    console.log("signedTx: ", signedTx);
    const txResp: TransactionResponse =
      await this.rpcService.sendTransaction(signedTx);
    console.log("txResp: ", txResp);

    await Promise.allSettled(
      this.rpcService.proxyAllInstances().map(async (rpc) => {
        if (rpc !== this.rpcService.proxyCurrInstance()) {
          await rpc.sendTransaction(signedTx);
        }
      }),
    );

    let gasFeeResp: SerializeGasFee<CoinType.ETH>;
    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit, gasPrice } = txResp;
    if (maxFeePerGas) {
      gasFeeResp = {
        gasLimit: gasLimit.toNumber(),
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas?.toString() ?? "0",
        estimateGas: gasLimit.mul(maxPriorityFeePerGas ?? 0).toString(),
        type: GasFeeType.EIP1559,
      };
    } else {
      gasFeeResp = {
        gasLimit: gasLimit.toNumber(),
        gasPrice: gasPrice?.toString() ?? "0",
        estimateGas: gasLimit.mul(gasPrice ?? 0).toString(),
        type: GasFeeType.LEGACY,
      };
    }
    return {
      id: txResp.hash,
      from: txResp.from,
      to: txResp.to ?? "0x",
      value: txResp.value.toBigInt(),
      nonce: txResp.nonce,
      data: txResp.data,
      gasFee: gasFeeResp,
      timestamp: +Date.now(),
      // chainSpecificReturn: {
      //   wait: txResp.wait,
      // },
    };
  }

  getSignWallet(privateKey: string, address: string): Wallet {
    if (!this.signWalletMap[address]) {
      privateKey = addHexPrefix(privateKey);
      this.signWalletMap[address] = new Wallet(
        { privateKey, address },
        this.rpcService,
      );
    } else {
      this.signWalletMap[address] = this.signWalletMap[address].connect(
        this.rpcService,
      );
    }
    return this.signWalletMap[address];
  }

  supportNonce(): boolean {
    return true;
  }

  async getNonce({
    address,
    nonceTag,
  }: {
    address: string;
    nonceTag?: string | undefined;
  }): Promise<number> {
    return await this.rpcService.getTransactionCount(address, nonceTag);
  }

  async signTransactionRequest(
    txReq: TransactionRequest,
    privateKey: string,
    address: string,
  ): Promise<string> {
    const wallet = this.getSignWallet(privateKey, address);
    const nonce =
      txReq.nonce ?? (await this.getNonce({ address, nonceTag: "pending" }));
    let type = txReq.type;
    if (type === undefined) {
      type = txReq.maxFeePerGas ? 2 : 0;
    }
    const txRequest = {
      ...txReq,
      nonce,
      type,
      from: stripHexPrefix(address),
      chainId: this.chainId,
    };
    return await wallet.signTransaction(txRequest);
  }

  private async getMaxPriorityFeePerGas(): Promise<bigint | undefined> {
    try {
      const result = await this.rpcService.send("eth_maxPriorityFeePerGas", []);
      if (!result) {
        return undefined;
      }
      let resultNum = BigNumber.from(result);
      if (
        this.config.minMaxPriorityFeePerGas &&
        resultNum.lt(this.config.minMaxPriorityFeePerGas)
      ) {
        resultNum = BigNumber.from(this.config.minMaxPriorityFeePerGas);
      }
      return resultNum.toBigInt();
    } catch (err: any) {
      switch (this.config.chainId) {
        // case ETH_CHAIN_CONFIGS.ZKSYNC_ERA.chainId:
        //   return 0n;
        default: {
          // https://github.com/PureStake/moonbeam/issues/1338
          // 除非节点实现有 bug，绝大部分情况不会出现 baseFeePerGas 有值，而 eth_maxPriorityFeePerGas 不存在，如果有就做个兜底
          // {"reason":"processing response error","code":"SERVER_ERROR","body":"{\"jsonrpc\":\"2.0\",\"error\":{\"code\":-32601,\"message\":\"Method not found\"},\"id\":59}\n","error":{"code":-32601},"requestBody":"{\"method\":\"eth_maxPriorityFeePerGas\",\"params\":[],\"id\":59,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","url":"https://rpc.api.moonriver.moonbeam.network"}
          if (
            err?.code === "SERVER_ERROR" &&
            err?.error?.code === -32601 &&
            err?.requestBody?.includes("eth_maxPriorityFeePerGas")
          ) {
            if (this.config.minMaxPriorityFeePerGas) {
              return BigNumber.from(
                this.config.minMaxPriorityFeePerGas,
              ).toBigInt();
            }
            return 2500000000n;
          }
          throw err;
        }
      }
    }
  }
}
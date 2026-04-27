import { CoinServiceBasic } from "core/coins/CoinServiceBasic";
import type { QtumConfig } from "../types/QtumConfig";
import type { UTXO } from "../types";
import type { QtumInfoApi, QtumInfoTxResponse } from "./api/qtuminfoapi";
import { type BlockbookApi } from "./api/blockbook";
import {
  createQtumInfoService,
  type QtumInfoService,
} from "./instances/qtuminfo";
import {
  createBlockbookService,
  type BlockbookService,
} from "./instances/blockbook";
import {
  createEthRpcService,
  type EthRpcService,
} from "core/coins/ETH/service/instances/rpc";
import {
  InputSizeMap,
  OutputSizeMap,
  txBaseVBytes,
  DUST_LIMIT,
  DEFAULT_FEE_RATE,
} from "../constants";
import {
  decodeEvmAddress,
  getAddressType,
  getEvmAddress,
  isAddress,
} from "../utils/address";
import type {
  NativeBalanceRes,
  TokenBalanceParams,
  BalanceResp,
} from "core/types/Balance";
import type {
  EstimateGasParam,
  NativeCoinSendTxParams,
  NativeCoinSendTxRes,
  NativeCoinTxHistoryParams,
  NativeCoinTxDetailParams,
  NativeCoinTxDetailRes,
} from "core/types/NativeCoinTransaction";
import type { CoinType } from "core/types";
import type {
  GasFee,
  GasFeeQtumDapp,
  SerializeGasFee,
} from "core/types/GasFee";
import { GasFeeType } from "core/types/GasFee";
import {
  TxLabel,
  type TransactionHistoryItem,
  type TransactionHistoryResp,
} from "core/types/TransactionHistory";
import type {
  TokenMetaParams,
  TokenTxHistoryParams,
  TokenEstimateGasParams,
  TokenSendTxParams,
  TokenSendTxRes,
  InteractiveTokenParams,
  TokenTxDetailReq,
  TokenTxDetailRes,
} from "core/types/TokenTransaction";
import { AssetType, type TokenMetaV2, type TokenV2 } from "core/types/Token";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import { ecc } from "../utils/nobleSecp256k1Adapter";
import type { Network } from "bitcoinjs-lib";
import { BigNumber, Contract, utils as ethUtils } from "ethers";
import { TransactionStatus } from "core/types/TransactionStatus";
import erc20abi from "core/assets/abi/erc20abi.json";
import { QtumProvider, QtumWallet } from "qtum-ethers-wrapper";
import { isNotEmpty } from "core/utils/is";
import { type RawTxWrap } from "core/coins/ETH/service/EthService";
import { wrapLoggerArgs } from "@/common/utils/wrapConsole";

const ECPair = ECPairFactory(ecc);

export class QtumService extends CoinServiceBasic {
  qtumInfoService: QtumInfoService;
  blockbookService?: BlockbookService;
  rpcService: EthRpcService;
  network: Network;
  config: QtumConfig;
  chainId: number;
  txDetailCache = new Map<string, QtumInfoTxResponse>();

  // Fee rate cache
  private feeRateCache: { rate: number; timestamp: number } | null = null;
  private gasPriceCache: { price: number; timestamp: number } | null = null;
  private static FEE_RATE_CACHE_TTL = 15_000; // 15 seconds
  private static GAS_PRICE_CACHE_TTL = 60_000; // 60 seconds

  constructor(config: QtumConfig) {
    super(config);
    this.config = config;
    const chainId = Number(config.chainId);
    if (!Number.isFinite(chainId)) {
      throw new Error(`Invalid QTUM chainId ${config.chainId}`);
    }
    this.chainId = chainId;
    this.network = config.network;
    this.qtumInfoService = createQtumInfoService(config);
    this.blockbookService = createBlockbookService(config);
    this.rpcService = createEthRpcService(config);
  }

  // ===== Helper: API with failover =====

  private async withQtumInfo<T>(
    fn: (api: QtumInfoApi) => Promise<T>,
  ): Promise<T> {
    return await fn(this.qtumInfoService);
  }

  private async withBlockbook<T>(
    fn: (api: BlockbookApi) => Promise<T>,
  ): Promise<T> {
    if (!this.blockbookService) {
      throw new Error("No Blockbook API available");
    }
    return await fn(this.blockbookService);
  }

  private async withRpc<T>(
    fn: (provider: EthRpcService) => Promise<T>,
  ): Promise<T> {
    return await fn(this.rpcService);
  }

  private serializeGasFee(
    gasFee: GasFee<CoinType.QTUM>,
  ): SerializeGasFee<CoinType.QTUM> {
    if (gasFee.type === GasFeeType.QTUM_DAPP) {
      return {
        estimateGas: gasFee.estimateGas.toString(),
        fee: gasFee.fee?.toString(),
        feeRate: gasFee.feeRate,
        priorityFee: gasFee.priorityFee?.toString(),
        utxosHash: gasFee.utxosHash,
        gasLimit: gasFee.gasLimit,
        gasPrice: gasFee.gasPrice,
        type: GasFeeType.QTUM_DAPP,
      };
    }
    return {
      ...gasFee,
      estimateGas: gasFee.estimateGas.toString(),
      fee: gasFee.fee?.toString(),
      priorityFee: gasFee.priorityFee?.toString(),
    };
  }

  // ===== Balance =====

  async getBalance(address: string): Promise<NativeBalanceRes> {
    const [balance, utxos] = await Promise.all([
      this.blockbookService
        ? this.withBlockbook(async (api) => api.getBalance(address))
        : this.withQtumInfo(async (api) => api.getBalance(address)),
      this.getUTXOs(address),
    ]);
    const totalBigInt = BigInt(balance.balance);
    const availableBigInt = utxos.reduce(
      (sum, utxo) => sum + BigInt(utxo.value),
      0n,
    );

    return {
      total: totalBigInt,
      publicBalance: totalBigInt,
      privateBalance: 0n,
      availableBalance: availableBigInt,
    };
  }

  // ===== UTXO Management =====

  async getUTXOs(
    address: string,
    _isOrd: boolean = false,
    _confirmed?: boolean,
  ): Promise<UTXO[]> {
    console.log(...wrapLoggerArgs("getUTXOs"));
    try {
      const utxos = await this.withQtumInfo(async (api) =>
        api.getUTXOs(address),
      );
      return utxos;
    } catch (e) {
      if (this.blockbookService) {
        const utxos1 = await this.withBlockbook(async (api) =>
          api.getUTXOs(address),
        );
        return utxos1;
      }
      throw e;
    }
  }

  private getInputSize(address: string): number {
    const addrType = getAddressType(address);
    switch (addrType) {
      case "p2pkh":
        return InputSizeMap.p2pkh;
      case "p2sh":
        return InputSizeMap.p2sh_p2wpkh;
      case "p2wpkh":
        return InputSizeMap.p2wpkh;
      case "p2tr":
        return InputSizeMap.p2tr;
      default:
        return InputSizeMap.p2pkh;
    }
  }

  private getOutputSize(address: string): number {
    const addrType = getAddressType(address);
    switch (addrType) {
      case "p2pkh":
        return OutputSizeMap.p2pkh;
      case "p2sh":
        return OutputSizeMap.p2sh;
      case "p2wpkh":
        return OutputSizeMap.p2wpkh;
      case "p2tr":
        return OutputSizeMap.p2tr;
      default:
        return OutputSizeMap.p2pkh;
    }
  }

  getEstimateVBytes(
    fromAddress: string,
    inputCount: number,
    outputAddresses: string[],
  ): number {
    const inputSize = this.getInputSize(fromAddress);
    const outputSize = outputAddresses.reduce(
      (sum, addr) => sum + this.getOutputSize(addr),
      0,
    );
    return Math.ceil(inputCount * inputSize + outputSize + txBaseVBytes + 1);
  }

  // ===== Fee Estimation =====

  async getFeeRate(): Promise<number> {
    const now = Date.now();
    if (
      this.feeRateCache &&
      now - this.feeRateCache.timestamp < QtumService.FEE_RATE_CACHE_TTL
    ) {
      return this.feeRateCache.rate;
    }

    try {
      const rate = await this.withQtumInfo(async (api) => api.getFeeRate());
      // Add 25% safety buffer
      const adjustedRate = Math.ceil(rate * 1.25);
      this.feeRateCache = { rate: adjustedRate, timestamp: now };
      return adjustedRate;
    } catch (e) {
      try {
        if (this.blockbookService) {
          const rate = await this.withBlockbook(async (api) =>
            api.getFeeRate(),
          );
          const adjustedRate = Math.ceil(rate * 1.25);
          this.feeRateCache = { rate: adjustedRate, timestamp: now };
          return adjustedRate;
        }
      } catch (e2) {
        // ignore
      }
      return DEFAULT_FEE_RATE;
    }
  }

  getSignWallet(privateKey: string, address: string): QtumWallet {
    const keyPair = this.getKeyPair(privateKey, this.network);
    if (!keyPair.privateKey) {
      throw new Error("no valid key");
    }
    const rpcUrl = this.rpcService.proxyCurrConfig().rpcUrl;
    return new QtumWallet(keyPair.privateKey, new QtumProvider(rpcUrl));
  }

  async estimateGasFee(
    params: EstimateGasParam<CoinType.QTUM>,
  ): Promise<GasFee<CoinType.QTUM> | undefined> {
    const {
      tx: { from, to, value: sendValue, data },
      option,
    } = params;
    if (!from) return undefined;

    const preFixedFeeRate = option?.feeRate;
    let evmGas = 0n;
    let isEvm = false;
    let gasPrice = 0;
    let gasLimit = 0;

    if (data) {
      const gasOption = option as GasFeeQtumDapp | undefined;
      gasPrice =
        gasOption?.gasPrice ??
        (await this.getDefaultGasPrice().catch(() => 40));

      const dataHex =
        typeof data === "string"
          ? this.addHexPrefix(data)
          : ethUtils.hexlify(data);
      const estimateGasLimit =
        gasOption?.gasLimit ??
        (await this.getGasLimit(
          from,
          to ? getEvmAddress(to) : "0x0",
          dataHex,
          sendValue,
          gasPrice,
        ));
      const minGasLimit = this.getMinGasLimit(dataHex.slice(0, 10), to);
      gasLimit = Math.max(estimateGasLimit, minGasLimit);
      evmGas = BigInt(gasPrice) * BigInt(gasLimit);
      isEvm = true;
    }

    const rbf = option?.RBF ?? false;
    const inputs = await this.getUTXOs(
      decodeEvmAddress(from, `${this.chainId}`),
      false,
      rbf,
    );
    if (params.option?.sendMax) {
      const vBytes = this.getEstimateVBytes(from, inputs.length, [from]);
      const { fee, feeRate } = await this.estimateFee(vBytes, preFixedFeeRate);

      return {
        estimateGas: fee,
        feeRate,
        type: GasFeeType.UTXO,
      };
    }

    const validRes: Array<{ inscriptionId: string; inputId: string }> = [];
    const ordinalLength = validRes.length;

    const selectedUTXOs = await this.getSelectedUtxos(
      inputs,
      sendValue,
      from,
      to ?? from,
      {
        feeRate: preFixedFeeRate,
        ordinalLength,
        RBFTxids: validRes.map((item) => item.inputId),
      },
    );
    const inputLength = selectedUTXOs.length + ordinalLength;
    const vBytes = this.getEstimateVBytes(
      from,
      inputLength,
      Array(ordinalLength + (ordinalLength ? 0 : 1))
        .fill(to || from)
        .concat(from),
    );
    let { fee, feeRate } = await this.estimateFee(vBytes, preFixedFeeRate);
    const totalValue = selectedUTXOs.reduce(
      (sum, utxo) => sum + BigInt(utxo.value),
      0n,
    );
    const change = totalValue - sendValue - fee - evmGas;
    if (change <= BigInt(DUST_LIMIT) && change > 0n) {
      fee += change;
    }

    if (isEvm) {
      return {
        estimateGas: evmGas + fee,
        feeRate,
        fee,
        type: GasFeeType.QTUM_DAPP,
        gasLimit,
        gasPrice,
      };
    }

    return {
      estimateGas: fee,
      feeRate,
      type: GasFeeType.UTXO,
    };
  }

  supportEstimateGasFee(): boolean {
    return true;
  }

  supportCustomGasFee(): boolean {
    return false;
  }

  zeroGasFee(): GasFee<CoinType.QTUM> {
    return {
      estimateGas: 0n,
      feeRate: 0,
      type: GasFeeType.UTXO,
    };
  }

  private async estimateFee(
    txSize: number,
    preFixedFeeRate?: number,
  ): Promise<{ fee: bigint; feeRate: number }> {
    const feeRate = preFixedFeeRate ?? (await this.getFeeRate());
    return {
      fee: BigInt(Math.ceil(feeRate * txSize)),
      feeRate,
    };
  }

  private async getSelectedUtxos(
    allUTXOs: UTXO[],
    sendValue: bigint,
    from: string,
    to: string,
    options?: {
      fee?: bigint;
      feeRate?: number;
      ordinalLength?: number;
      RBFTxids?: string[];
    },
  ): Promise<UTXO[]> {
    let feeEstimated = options?.fee;
    const rbfTxIds = options?.RBFTxids ?? [];
    allUTXOs.sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)));

    const rbfUtxos: UTXO[] = [];
    const nonRbfUtxos: UTXO[] = [];
    allUTXOs.forEach((utxo) => {
      if (rbfTxIds.some((id) => id === utxo.txid)) {
        rbfUtxos.push(utxo);
      } else {
        nonRbfUtxos.push(utxo);
      }
    });

    const selectedUtxos: UTXO[] = [];
    let selectedTotalValue = 0n;
    rbfUtxos.forEach((utxo) => {
      selectedUtxos.push(utxo);
      selectedTotalValue += BigInt(utxo.value);
    });

    if (!options?.fee) {
      const inputLength = rbfUtxos.length + (options?.ordinalLength ?? 0);
      const vBytes = this.getEstimateVBytes(
        from,
        inputLength,
        Array((options?.ordinalLength ?? 0) + (options?.ordinalLength ? 0 : 1))
          .fill(to)
          .concat(from),
      );
      const { fee: estimatedFee } = await this.estimateFee(
        vBytes,
        options?.feeRate,
      );
      feeEstimated = estimatedFee;
    }

    if (feeEstimated && selectedTotalValue >= sendValue + feeEstimated) {
      return selectedUtxos;
    }

    for (let i = 0; i < nonRbfUtxos.length; i++) {
      const utxo = nonRbfUtxos[i];
      selectedUtxos.push(utxo);
      selectedTotalValue += BigInt(utxo.value);

      if (!options?.fee) {
        const inputLength =
          i + 1 + rbfUtxos.length + (options?.ordinalLength ?? 0);
        const vBytes = this.getEstimateVBytes(
          from,
          inputLength,
          Array(
            (options?.ordinalLength ?? 0) + (options?.ordinalLength ? 0 : 1),
          )
            .fill(to)
            .concat(from),
        );
        const { fee: estimatedFee } = await this.estimateFee(
          vBytes,
          options?.feeRate,
        );
        feeEstimated = estimatedFee;
      }

      if (feeEstimated && selectedTotalValue >= sendValue + feeEstimated) {
        break;
      }
    }

    return selectedUtxos;
  }

  gasUnit(): string {
    return "sat/byte";
  }

  // ===== UTXO Selection =====

  async selectUTXOs(
    address: string,
    sendValue: bigint,
    toAddress: string,
    options?: {
      fee?: bigint;
      feeRate?: number;
      sendMax?: boolean;
    },
  ): Promise<{
    utxos: UTXO[];
    fee: bigint;
    changeValue: bigint;
    actualSendValue: bigint;
  }> {
    const allUTXOs = await this.getUTXOs(address);
    if (allUTXOs.length === 0) {
      throw new Error("No available UTXOs");
    }

    const rate = Math.max(
      Math.ceil(options?.feeRate ?? (await this.getFeeRate())),
      DEFAULT_FEE_RATE,
    );
    const fixedFee = options?.fee;
    const sendMax = options?.sendMax ?? false;

    // Sort UTXOs descending by value
    allUTXOs.sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)));

    // SendMax: use all UTXOs, no change output
    if (sendMax) {
      const totalValue = allUTXOs.reduce(
        (sum, utxo) => sum + BigInt(utxo.value),
        0n,
      );

      // Calculate fee with all inputs and only one output (to recipient)
      const vBytes = this.getEstimateVBytes(address, allUTXOs.length, [
        toAddress,
      ]);
      const fee = fixedFee
        ? BigInt(Math.max(Number(fixedFee), Math.ceil(vBytes * rate)))
        : BigInt(Math.ceil(vBytes * rate));

      if (totalValue <= fee) {
        throw new Error("Insufficient balance to cover transaction fee");
      }

      const actualSendValue = totalValue - fee;

      return {
        utxos: allUTXOs,
        fee,
        changeValue: 0n,
        actualSendValue,
      };
    }

    // Normal transaction: select minimal UTXOs
    const selectedUtxos: UTXO[] = [];
    let selectedTotal = 0n;

    for (const utxo of allUTXOs) {
      selectedUtxos.push(utxo);
      selectedTotal += BigInt(utxo.value);

      // Calculate fee with current input count
      const vBytes = this.getEstimateVBytes(
        address,
        selectedUtxos.length,
        [toAddress, address], // to + change
      );
      const fee = fixedFee
        ? BigInt(Math.max(Number(fixedFee), Math.ceil(vBytes * rate)))
        : BigInt(Math.ceil(vBytes * rate));

      if (selectedTotal >= sendValue + fee) {
        const changeValue = selectedTotal - sendValue - fee;

        // If change is below dust limit, add it to fee
        if (changeValue > 0n && changeValue < BigInt(DUST_LIMIT)) {
          return {
            utxos: selectedUtxos,
            fee: fee + changeValue,
            changeValue: 0n,
            actualSendValue: sendValue,
          };
        }

        return {
          utxos: selectedUtxos,
          fee,
          changeValue,
          actualSendValue: sendValue,
        };
      }
    }

    throw new Error("Insufficient balance for transaction and fees");
  }

  // ===== Transaction Building =====

  private getKeyPair(privateKey: string, network: Network) {
    try {
      return ECPair.fromWIF(privateKey, network);
    } catch {
      // HD accounts in this extension store raw secp256k1 private keys as hex.
    }

    const rawPrivateKey = privateKey.startsWith("0x")
      ? privateKey.slice(2)
      : privateKey;
    if (!/^[0-9a-fA-F]{64}$/.test(rawPrivateKey)) {
      throw new Error("Invalid QTUM private key format");
    }

    return ECPair.fromPrivateKey(Buffer.from(rawPrivateKey, "hex"), {
      network,
    });
  }

  private isWitnessAddress(address: string): boolean {
    const addrType = getAddressType(address);
    return addrType === "p2wpkh" || addrType === "p2tr";
  }

  private async addPsbtInput(
    psbt: bitcoin.Psbt,
    utxo: UTXO,
    fromAddress: string,
    keyPair: ReturnType<typeof ECPair.fromPrivateKey>,
    sequence?: number,
  ): Promise<void> {
    const addrType = getAddressType(fromAddress);

    if (addrType === "p2wpkh") {
      // Native SegWit: use witnessUtxo
      const scriptPubKey = bitcoin.address.toOutputScript(
        fromAddress,
        this.network,
      );
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        sequence,
        witnessUtxo: {
          script: scriptPubKey,
          value: BigInt(utxo.value),
        },
      });
    } else if (addrType === "p2sh") {
      // P2SH-P2WPKH: needs both redeemScript and witnessUtxo
      const pubkey = keyPair.publicKey;
      const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey,
        network: this.network,
      });
      const p2sh = bitcoin.payments.p2sh({
        redeem: p2wpkh,
        network: this.network,
      });
      if (!p2sh.output || !p2wpkh.output) {
        throw new Error("Failed to build QTUM p2sh-p2wpkh input");
      }
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        sequence,
        witnessUtxo: {
          script: p2sh.output,
          value: BigInt(utxo.value),
        },
        redeemScript: p2wpkh.output,
      });
    } else if (addrType === "p2tr") {
      // Taproot: use witnessUtxo with tapInternalKey
      const scriptPubKey = bitcoin.address.toOutputScript(
        fromAddress,
        this.network,
      );
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        sequence,
        witnessUtxo: {
          script: scriptPubKey,
          value: BigInt(utxo.value),
        },
        tapInternalKey: keyPair.publicKey.subarray(1, 33),
      });
    } else {
      // P2PKH: use nonWitnessUtxo (raw transaction)
      const rawTx = await this.fetchRawTransaction(utxo.txid);
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        sequence,
        nonWitnessUtxo: Buffer.from(rawTx, "hex"),
      });
    }
  }

  async sendNativeCoin(
    params: NativeCoinSendTxParams<CoinType.QTUM>,
  ): Promise<NativeCoinSendTxRes<CoinType.QTUM> | undefined> {
    const {
      tx: { from, to, value, gasFee, data },
      signer: { privateKey },
      option,
    } = params;
    const sequence = option?.sendNoRBF ? 0xffffffff : 0xfffffffd;
    const isEvm = !!data;

    const sendValue = BigInt(value);

    if (
      !this.config.testnet &&
      sendValue < BigInt(DUST_LIMIT) &&
      sendValue !== 0n
    ) {
      throw new Error(`Amount below dust limit (${DUST_LIMIT} satoshi)`);
    }

    if (isEvm && gasFee.type !== GasFeeType.QTUM_DAPP) {
      throw new Error("QTUM contract call requires QTUM_DAPP gas fee");
    }

    let feeRate: number | undefined;
    if (gasFee && "feeRate" in gasFee) {
      feeRate = gasFee.feeRate;
    }
    const fee = gasFee.estimateGas;

    const inputs = await this.getUTXOs(from);
    inputs.sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)));
    const utxos: UTXO[] = [];
    let selectedTotal = 0n;
    for (const input of inputs) {
      utxos.push(input);
      selectedTotal += BigInt(input.value);
      if (selectedTotal >= sendValue + fee) {
        break;
      }
    }
    if (selectedTotal < sendValue + fee) {
      throw new Error("not enough value");
    }

    const psbt = new bitcoin.Psbt({ network: this.network });
    const keyPair = this.getKeyPair(privateKey, this.network);

    for (const input of utxos) {
      const rawTx = await this.withQtumInfo(async (api) =>
        api.getRawTransaction(input.txid),
      );
      psbt.addInput({
        hash: input.txid,
        index: input.vout,
        sequence,
        nonWitnessUtxo: Buffer.from(rawTx, "hex"),
      });
    }

    if (isEvm && gasFee.type === GasFeeType.QTUM_DAPP) {
      const contractAddress = to ? getEvmAddress(to).slice(2) : undefined;
      const contractScript = this.buildQtumDappScript(
        gasFee.gasLimit,
        gasFee.gasPrice,
        data,
        contractAddress,
      );
      psbt.addOutput({
        script: contractScript,
        value: sendValue,
      });
    } else if (sendValue > 0n) {
      psbt.addOutput({
        address: to,
        value: sendValue,
      });
    }

    let changeValue = selectedTotal - sendValue - fee;
    if (changeValue <= BigInt(DUST_LIMIT)) {
      changeValue = 0n;
    }
    if (changeValue !== 0n) {
      psbt.addOutput({
        address: from,
        value: changeValue,
      });
    }

    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const rawTx = psbt.extractTransaction(isEvm).toHex();
    const txid = await this.pushTx(rawTx);

    return {
      id: txid,
      from,
      to,
      value: sendValue,
      gasFee: {
        estimateGas: fee.toString(),
        type: GasFeeType.UTXO,
        feeRate,
      },
      data,
      timestamp: Date.now(),
    };
  }

  // runs in work no net call?
  async getNativeCoinRawTx(
    params: NativeCoinSendTxParams<CoinType.QTUM>,
  ): Promise<{
    rawTx: string;
    id: string;
    txInfo: {
      from: string;
      to: string;
      sendValue: bigint;
      fee: bigint;
      feeRate: number | undefined;
      data: string | undefined;
    };
  }> {
    const {
      tx: { from, to, value, gasFee, data },
      signer: { privateKey },
      option,
    } = params;
    const sequence = option?.sendNoRBF ? 0xffffffff : 0xfffffffd;
    const isEvm = !!data;

    const sendValue = BigInt(value);

    if (
      !this.config.testnet &&
      sendValue < BigInt(DUST_LIMIT) &&
      sendValue !== 0n
    ) {
      throw new Error(`Amount below dust limit (${DUST_LIMIT} satoshi)`);
    }

    if (isEvm && gasFee.type !== GasFeeType.QTUM_DAPP) {
      throw new Error("QTUM contract call requires QTUM_DAPP gas fee");
    }

    let feeRate: number | undefined;
    if (gasFee && "feeRate" in gasFee) {
      feeRate = gasFee.feeRate;
    }
    const fee = gasFee.estimateGas;

    const inputs = await this.getUTXOs(from);
    inputs.sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)));
    const utxos: UTXO[] = [];
    let selectedTotal = 0n;
    for (const input of inputs) {
      utxos.push(input);
      selectedTotal += BigInt(input.value);
      if (selectedTotal >= sendValue + fee) {
        break;
      }
    }
    if (selectedTotal < sendValue + fee) {
      throw new Error("not enough value");
    }

    const psbt = new bitcoin.Psbt({ network: this.network });
    const keyPair = this.getKeyPair(privateKey, this.network);

    for (const input of utxos) {
      const rawTx = await this.withQtumInfo(async (api) =>
        api.getRawTransaction(input.txid),
      );
      psbt.addInput({
        hash: input.txid,
        index: input.vout,
        sequence,
        nonWitnessUtxo: Buffer.from(rawTx, "hex"),
      });
    }

    if (isEvm && gasFee.type === GasFeeType.QTUM_DAPP) {
      const contractAddress = to ? getEvmAddress(to).slice(2) : undefined;
      const contractScript = this.buildQtumDappScript(
        gasFee.gasLimit,
        gasFee.gasPrice,
        data,
        contractAddress,
      );
      psbt.addOutput({
        script: contractScript,
        value: sendValue,
      });
    } else if (sendValue > 0n) {
      psbt.addOutput({
        address: to,
        value: sendValue,
      });
    }

    let changeValue = selectedTotal - sendValue - fee;
    if (changeValue <= BigInt(DUST_LIMIT)) {
      changeValue = 0n;
    }
    if (changeValue !== 0n) {
      psbt.addOutput({
        address: from,
        value: changeValue,
      });
    }

    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const transaction = psbt.extractTransaction(isEvm);
    const rawTx = transaction.toHex();
    const id = transaction.getId();
    return {
      rawTx,
      id,
      txInfo: {
        from,
        to,
        sendValue,
        fee,
        feeRate,
        data,
      },
    };
  }

  async sendSignedTxRaw(
    tx: RawTxWrap,
  ): Promise<NativeCoinSendTxRes<CoinType.QTUM>> {
    const txid = await this.pushTx(tx.rawTx);
    if (!tx.txInfo) {
      throw new Error("qtum rawtx should contain TX info");
    }
    const { feeRate, fee, to, sendValue, from, data } = tx.txInfo;
    return {
      id: txid,
      from,
      to,
      value: sendValue,
      gasFee: {
        estimateGas: fee.toString(),
        type: GasFeeType.UTXO,
        feeRate,
      },
      data,
      timestamp: Date.now(),
    };
  }

  private async fetchRawTransaction(txid: string): Promise<string> {
    try {
      return await this.withBlockbook(async (api) =>
        api.getRawTransaction(txid),
      );
    } catch (blockbookError) {
      return this.withQtumInfo(async (api) => api.getRawTransaction(txid));
    }
  }

  private async pushTx(signedTx: string): Promise<string> {
    try {
      const result = await this.withQtumInfo(async (api) =>
        api.sendRawTransaction(signedTx),
      );
      if (!result.id) {
        throw new Error("sendRawTransaction returned empty txid");
      }
      return result.id;
    } catch (qtumInfoError) {
      if (!this.blockbookService) {
        throw qtumInfoError;
      }

      const result = await this.withBlockbook(async (api) =>
        api.sendRawTransaction(signedTx),
      );
      if (!result.result) {
        throw new Error("Blockbook sendtx returned empty txid");
      }
      return result.result;
    }
  }

  private async getQtumTransaction(txid: string): Promise<QtumInfoTxResponse> {
    const cachedTx = this.txDetailCache.get(txid);
    if (cachedTx) {
      return cachedTx;
    }

    const tx = await this.withQtumInfo(async (api) => api.getTransaction(txid));
    this.txDetailCache.set(txid, tx);
    return tx;
  }

  private sumValues<T>(items: T[], getValue: (item: T) => string): bigint {
    return items.reduce((sum, item) => sum + BigInt(getValue(item) || "0"), 0n);
  }

  private normalizeContractAddress(contractAddress: string): string {
    return contractAddress.replace(/^0x/i, "").toLowerCase();
  }

  private addHexPrefix(value: string): string {
    return value.startsWith("0x") ? value : `0x${value}`;
  }

  private getChainId(): number {
    return this.chainId;
  }

  private async getDefaultGasPrice(): Promise<number> {
    const now = Date.now();
    if (
      this.gasPriceCache &&
      now - this.gasPriceCache.timestamp < QtumService.GAS_PRICE_CACHE_TTL
    ) {
      return this.gasPriceCache.price;
    }

    const netGasPrice = await this.withRpc(async (provider) =>
      provider.getGasPrice(),
    );
    const price = BigNumber.from(netGasPrice).div(10_000_000_000).toNumber();
    this.gasPriceCache = { price, timestamp: now };
    return price;
  }

  private async getGasLimit(
    from: string,
    toEvm: string,
    data: string | undefined,
    amount: bigint,
    gasPrice: number,
  ): Promise<number> {
    try {
      const estimateGas = await this.withRpc(async (provider) =>
        provider.estimateGas({
          from: getEvmAddress(from),
          to: toEvm,
          value: BigNumber.from(amount.toString()),
          data,
          gasPrice: BigNumber.from(gasPrice).mul(10_000_000_000),
          chainId: this.getChainId(),
        }),
      );
      return estimateGas.mul(110).div(100).toNumber();
    } catch (e) {
      return 250000;
    }
  }

  private getMinGasLimit(functionHash: string, to: string | undefined): number {
    if (!this.config.minGasLimits) {
      return 0;
    }

    const normalizedTo =
      to && ethUtils.isAddress(to) ? this.normalizeContractAddress(to) : "";

    let minLimit = this.config.minGasLimits.find((item) => {
      return (
        normalizedTo &&
        functionHash &&
        this.normalizeContractAddress(item.contract) === normalizedTo &&
        item.functionHash === functionHash
      );
    })?.gasLimit;

    if (!minLimit) {
      minLimit = this.config.minGasLimits.find((item) => {
        return (
          !item.contract && functionHash && item.functionHash === functionHash
        );
      })?.gasLimit;
    }

    return minLimit ?? 0;
  }

  private encodeSendData(address: string, amount: bigint): string {
    const evmAddress = getEvmAddress(address);
    return (
      "a9059cbb" +
      ethUtils.defaultAbiCoder
        .encode(["address", "uint256"], [evmAddress, amount.toString()])
        .substring(2)
    );
  }

  private async getTokenGasLimit(
    from: string,
    contractAddress: string,
    to: string,
    amount: bigint,
    gasPrice: number,
  ): Promise<number> {
    const estimateGas = await this.withRpc(async (provider) =>
      provider.estimateGas({
        from: getEvmAddress(from),
        to: this.addHexPrefix(contractAddress),
        value: BigNumber.from(0),
        data: this.addHexPrefix(this.encodeSendData(to, amount)),
        gasPrice: BigNumber.from(gasPrice).mul(10_000_000_000),
        chainId: this.getChainId(),
      }),
    );
    return estimateGas.mul(110).div(100).toNumber();
  }

  private matchQrc20Transfer(
    tx: QtumInfoTxResponse,
    contractAddress: string,
    ownerAddress?: string,
  ) {
    const normalizedContract = this.normalizeContractAddress(contractAddress);
    const normalizedOwner = ownerAddress?.toLowerCase();

    return (tx.qrc20TokenTransfers ?? []).find((transfer) => {
      const transferContract = this.normalizeContractAddress(
        transfer.addressHex ??
          transfer.address ??
          transfer.contractAddress ??
          "",
      );
      if (transferContract !== normalizedContract) {
        return false;
      }
      if (!normalizedOwner) {
        return true;
      }
      return (
        transfer.from?.toLowerCase() === normalizedOwner ||
        transfer.to?.toLowerCase() === normalizedOwner
      );
    });
  }

  private parseNativeTransaction(
    tx: QtumInfoTxResponse,
    ownerAddress?: string,
  ): { addressIn: string; addressOut: string; txValue: bigint } {
    const { inputs, outputs } = tx;
    const ownInInputs = ownerAddress
      ? inputs.some((input) => input.address === ownerAddress)
      : false;
    const ownInOutputs = ownerAddress
      ? outputs.some((output) => output.address === ownerAddress)
      : false;

    let addressIn = "";
    if (!ownInOutputs && ownInInputs && ownerAddress) {
      addressIn = ownerAddress;
    } else {
      const maxInput = inputs.reduce<
        { address: string; value: bigint } | undefined
      >((max, input) => {
        const currentValue = BigInt(input.value || "0");
        if (!max || currentValue > max.value) {
          return { address: input.address, value: currentValue };
        }
        return max;
      }, undefined);
      addressIn = maxInput?.address ?? "";
    }

    const pureOutputs = outputs.filter(
      (output) => output.address !== addressIn,
    );
    if (pureOutputs.length === 0) {
      if (ownInInputs && ownInOutputs && outputs.length > 1) {
        const firstOutput = outputs[0];
        return {
          addressIn,
          addressOut: firstOutput.address,
          txValue: BigInt(firstOutput.value || "0"),
        };
      }

      return {
        addressIn,
        addressOut: addressIn,
        txValue: this.sumValues(outputs, (output) => output.value),
      };
    }

    const ownOutputs = ownerAddress
      ? pureOutputs.filter((output) => output.address === ownerAddress)
      : [];
    if (ownOutputs.length > 0 && ownerAddress) {
      return {
        addressIn,
        addressOut: ownerAddress,
        txValue: this.sumValues(ownOutputs, (output) => output.value),
      };
    }

    const maxOutput = pureOutputs.reduce<
      { address: string; value: bigint } | undefined
    >((max, output) => {
      const currentValue = BigInt(output.value || "0");
      if (!max || currentValue > max.value) {
        return { address: output.address, value: currentValue };
      }
      return max;
    }, undefined);

    return {
      addressIn,
      addressOut: maxOutput?.address ?? "",
      txValue: maxOutput?.value ?? 0n,
    };
  }

  private getNativeTxLabel(tx: QtumInfoTxResponse): TxLabel | undefined {
    const isRefund = tx.outputs.some((output) => output.isRefund);
    const isContractCall = tx.outputs.some(
      (output) => !!output.receipt?.contractAddress,
    );
    if (isRefund) {
      return TxLabel.GAS_REFUND;
    }
    if (isContractCall) {
      return TxLabel.CONTRACT_CALL;
    }
    return undefined;
  }

  private buildNativeHistoryItem(
    tx: QtumInfoTxResponse,
    ownerAddress?: string,
  ): TransactionHistoryItem {
    const { addressIn, addressOut, txValue } = this.parseNativeTransaction(
      tx,
      ownerAddress,
    );
    return {
      id: tx.id || tx.hash,
      from: addressIn,
      to: addressOut,
      value: txValue,
      fees: BigInt(tx.fees || "0"),
      timestamp: tx.timestamp * 1000,
      status:
        tx.confirmations > 0
          ? TransactionStatus.SUCCESS
          : TransactionStatus.PENDING,
      height: tx.blockHeight,
      confirmations: tx.confirmations,
      label: this.getNativeTxLabel(tx),
      chainSpecificReturn: {
        qrc20TokenTransfers: tx.qrc20TokenTransfers,
      },
    };
  }

  // ===== Address Validation =====

  validateAddress(address: string): boolean {
    return isAddress(address);
  }

  validateContractAddress(address: string): boolean {
    // QRC20 contract addresses are 40-char hex (EVM format)
    return ethUtils.isAddress(address);
  }

  // ===== Transaction History =====

  supportNativeCoinTxHistory(): boolean {
    return true;
  }

  async getNativeCoinTxHistory(
    params: NativeCoinTxHistoryParams,
  ): Promise<TransactionHistoryResp> {
    const { address, pagination } = params;
    const page = pagination?.pageNum ?? 0;
    const pageSize = pagination?.pageSize ?? 20;

    const result = await this.withQtumInfo(async (api) =>
      api.getTransactionIds(address, page, pageSize),
    );
    const txs =
      result.transactions.length === 0
        ? []
        : await this.withQtumInfo(async (api) => {
            const fullTxs = await api.getTransactions(result.transactions);
            return fullTxs.map((tx) => {
              this.txDetailCache.set(tx.id || tx.hash, tx);
              return this.buildNativeHistoryItem(tx, address);
            });
          });

    return {
      txs,
      pagination: {
        pageSize,
        pageNum: page,
        totalCount: result.totalCount,
        endReach: (page + 1) * pageSize >= result.totalCount,
      },
    };
  }

  supportNativeCoinTxDetail(): boolean {
    return true;
  }

  async getNativeCoinTxDetail(
    params: NativeCoinTxDetailParams,
  ): Promise<NativeCoinTxDetailRes<CoinType.QTUM> | undefined> {
    const { txId, filter } = params;
    const [tx, rawTx] = await Promise.all([
      this.getQtumTransaction(txId),
      this.withQtumInfo(async (api) => api.getRawTransaction(txId)),
    ]);
    const historyItem = this.buildNativeHistoryItem(tx, filter.address);
    const fees = historyItem.fees ?? 0n;

    return {
      id: historyItem.id,
      from: historyItem.from,
      to: historyItem.to,
      value: historyItem.value,
      fees,
      timestamp: historyItem.timestamp,
      status: historyItem.status,
      height: historyItem.height,
      label: historyItem.label,
      confirmations: tx.confirmations,
      gasFee: {
        estimateGas: fees,
        fee: fees,
        feeRate:
          tx.weight && tx.weight > 0
            ? Math.ceil(Number(fees) / tx.weight)
            : await this.getFeeRate(),
        type: GasFeeType.QTUM_DAPP,
        gasLimit: 0,
        gasPrice: 0,
      },
      data: rawTx,
      rawTx,
      qrc20TokenTransfers: tx.qrc20TokenTransfers,
    };
  }

  // ===== QRC20 Token Support =====

  supportToken(): boolean {
    return true;
  }

  async getTokenBalance(
    params: TokenBalanceParams,
  ): Promise<BalanceResp | undefined> {
    const { address, token } = params;

    if (!token?.contractAddress) return undefined;

    try {
      const erc20 = new Contract(
        this.addHexPrefix(token.contractAddress),
        erc20abi,
        this.rpcService,
      );
      const balance = (await erc20.balanceOf(
        getEvmAddress(address),
      )) as BigNumber;
      const total = balance.toBigInt();
      return {
        total,
        publicBalance: total,
        privateBalance: 0n,
      };
    } catch (e) {
      console.error("getTokenBalance error:", e);
      return undefined;
    }
  }

  async getTokenMeta(
    params: TokenMetaParams,
  ): Promise<TokenMetaV2 | undefined> {
    const { contractAddress } = params;

    try {
      const info = await this.withQtumInfo(async (api) =>
        api.getQRC20TokenInfo(contractAddress),
      );

      return {
        name: info.name,
        symbol: info.symbol,
        decimals: info.decimals,
        contractAddress,
        uniqueId: this.config.uniqueId,
      } as TokenMetaV2;
    } catch (e) {
      console.error("getTokenMeta error:", e);
      return undefined;
    }
  }

  supportTokenTxHistory(): boolean {
    return true;
  }

  async getTokenTxHistory(
    params: TokenTxHistoryParams,
  ): Promise<TransactionHistoryResp | undefined> {
    const { address, token, pagination } = params;
    if (!token?.contractAddress) return undefined;

    const page = pagination?.pageNum ?? 0;
    const pageSize = pagination?.pageSize ?? 20;

    try {
      const result = await this.withQtumInfo(async (api) =>
        api.getQRC20Transfers(address, token.contractAddress, page, pageSize),
      );

      const txs = result.transactions.map((tx) => ({
        id: tx.transactionId,
        from: tx.from,
        to: tx.to,
        value: BigInt(tx.value),
        fees: 0n,
        timestamp: tx.timestamp * 1000,
        status:
          tx.confirmations > 0
            ? TransactionStatus.SUCCESS
            : TransactionStatus.PENDING,
        height: tx.blockHeight,
        confirmations: tx.confirmations,
      }));

      return {
        txs,
        pagination: {
          pageSize,
          pageNum: page,
          totalCount: result.totalCount,
          endReach: (page + 1) * pageSize >= result.totalCount,
        },
      };
    } catch (e) {
      console.error("getTokenTxHistory error:", e);
      return undefined;
    }
  }

  supportTokenTxDetail(): boolean {
    return true;
  }

  async getTokenTxDetail(
    params: TokenTxDetailReq,
  ): Promise<TokenTxDetailRes<CoinType.QTUM> | undefined> {
    const {
      txId,
      token,
      filter: { address },
    } = params;
    if (!token?.contractAddress) {
      return undefined;
    }

    try {
      const tx = await this.getQtumTransaction(txId);
      const transfer = this.matchQrc20Transfer(
        tx,
        token.contractAddress,
        address,
      );
      if (!transfer) {
        return undefined;
      }

      const fees = BigInt(tx.fees || "0");

      return {
        id: tx.id || tx.hash,
        from: transfer.from,
        to: transfer.to,
        value: BigInt(transfer.value),
        height: tx.blockHeight,
        timestamp: tx.timestamp * 1000,
        fees,
        status:
          tx.confirmations > 0
            ? TransactionStatus.SUCCESS
            : TransactionStatus.PENDING,
        token,
        confirmations: tx.confirmations,
        gasFee: {
          estimateGas: fees,
          fee: fees,
          feeRate: 400,
          type: GasFeeType.QTUM_DAPP,
          gasLimit: 0,
          gasPrice: 0,
        },
      };
    } catch (e) {
      console.error("getTokenTxDetail error:", e);
      return undefined;
    }
  }

  async getTokenEstimateGasFee(
    params: TokenEstimateGasParams<CoinType.QTUM>,
  ): Promise<GasFee<CoinType.QTUM> | undefined> {
    const {
      tx: { from, to, value, token },
      option,
    } = params;
    if (!from || !to || !token) return undefined;

    const gasOption = option as GasFeeQtumDapp | undefined;
    const feeRate = option?.feeRate ?? DEFAULT_FEE_RATE;

    const gasPrice = gasOption?.gasPrice ?? (await this.getDefaultGasPrice());
    const gasLimit =
      gasOption?.gasLimit ??
      (await this.getTokenGasLimit(
        from,
        token.contractAddress,
        to,
        value,
        gasPrice,
      ));

    const evmFee = BigInt(gasLimit) * BigInt(Math.ceil(gasPrice));
    const utxos = await this.getUTXOs(from);

    utxos.sort((a, b) => Number(BigInt(b.value) - BigInt(a.value)));
    const selectedUtxos: UTXO[] = [];
    let selectedTotal = 0n;
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      selectedUtxos.push(utxo);
      selectedTotal += BigInt(utxo.value);

      const vBytes = this.getEstimateVBytes(from, i + 1, [to, from]);
      const estimatedUtxoFee = BigInt(Math.ceil(vBytes * feeRate));
      if (selectedTotal >= evmFee + estimatedUtxoFee) {
        break;
      }
    }

    const txSize = 148 * selectedUtxos.length + 107 + 34 + 10;
    let utxoFee = BigInt(Math.ceil(txSize * feeRate));
    let totalFee = utxoFee + evmFee;
    const changeValue = selectedTotal - totalFee;

    if (changeValue > 0n && changeValue <= BigInt(DUST_LIMIT)) {
      totalFee += changeValue;
      utxoFee += changeValue;
    }

    return {
      estimateGas: totalFee,
      feeRate,
      fee: utxoFee,
      gasLimit,
      gasPrice: Math.ceil(gasPrice),
      type: GasFeeType.QTUM_DAPP,
    };
  }

  async sendToken(
    params: TokenSendTxParams<CoinType.QTUM>,
  ): Promise<TokenSendTxRes<CoinType.QTUM> | undefined> {
    const {
      tx: { from, to, value, token, gasFee },
      signer: { privateKey },
      option,
    } = params;
    if (!token?.contractAddress) return undefined;
    if (gasFee.type !== GasFeeType.QTUM_DAPP) {
      throw new Error("QTUM token transfer requires QTUM_DAPP gas fee");
    }

    const keyPair = this.getKeyPair(privateKey, this.network);
    const sequence = option?.sendNoRBF ? 0xffffffff : 0xfffffffd;

    const { gasLimit, gasPrice, estimateGas } = gasFee;

    // Encode transfer(to, amount) data
    const contractAddr = token.contractAddress.startsWith("0x")
      ? token.contractAddress.slice(2)
      : token.contractAddress;
    const transferData = this.encodeSendData(to, value);

    // Build OP_CALL script
    const opCallScript = this.buildQtumDappScript(
      gasLimit,
      gasPrice,
      transferData,
      contractAddr,
    );

    const inputs = await this.getUTXOs(from);
    const selectedUtxos = await this.getSelectedUtxos(inputs, 0n, from, to, {
      fee: estimateGas,
    });
    const selectedTotal = selectedUtxos.reduce(
      (sum, utxo) => sum + BigInt(utxo.value),
      0n,
    );

    // Build PSBT
    const psbt = new bitcoin.Psbt({ network: this.network });

    // Add inputs with proper witness/non-witness handling
    for (const utxo of selectedUtxos) {
      await this.addPsbtInput(psbt, utxo, from, keyPair, sequence);
    }

    // Add OP_CALL output
    psbt.addOutput({
      script: opCallScript,
      value: 0n,
    });

    // Add change output
    const changeValue = selectedTotal - estimateGas;
    if (changeValue > BigInt(DUST_LIMIT)) {
      psbt.addOutput({
        address: from,
        value: changeValue,
      });
    }

    // Sign
    for (let i = 0; i < selectedUtxos.length; i++) {
      psbt.signInput(i, keyPair);
    }

    psbt.finalizeAllInputs();
    const rawTx = psbt.extractTransaction(true).toHex();

    // Broadcast
    const txid = await this.pushTx(rawTx);

    return {
      id: txid,
      from,
      to,
      value,
      gasFee: this.serializeGasFee(gasFee),
      token,
      timestamp: Date.now(),
    };
  }

  private buildQtumDappScript(
    gasLimit: number,
    gasPrice: number,
    data: string,
    contractAddress?: string,
  ): Uint8Array {
    const OP_4 = 0x54;
    const OP_CREATE = 0xc1;
    const OP_CALL = 0xc2;

    const gasLimitBuf = this.numberToBuffer(gasLimit);
    const gasPriceBuf = this.numberToBuffer(gasPrice);
    const dataBuf = Buffer.from(data.replace(/^0x/i, ""), "hex");

    if (!contractAddress) {
      return bitcoin.script.compile([
        OP_4,
        gasLimitBuf,
        gasPriceBuf,
        dataBuf,
        OP_CREATE,
      ]);
    }

    const contractBuf = Buffer.from(contractAddress.replace(/^0x/i, ""), "hex");

    return bitcoin.script.compile([
      OP_4,
      gasLimitBuf,
      gasPriceBuf,
      dataBuf,
      contractBuf,
      OP_CALL,
    ]);
  }

  private numberToBuffer(n: number): Buffer {
    const buffer: number[] = [];
    const negative = n < 0;
    let value = Math.abs(n);

    while (value) {
      buffer.push(value & 0xff);
      value >>= 8;
    }

    const top = buffer[buffer.length - 1] ?? 0;
    if (top & 0x80) {
      buffer.push(negative ? 0x80 : 0x00);
    } else if (negative) {
      buffer[buffer.length - 1] = top | 0x80;
    }

    return Buffer.from(buffer);
  }

  // ===== Interactive Tokens =====

  supportUserInteractiveToken(): boolean {
    return true;
  }

  async getUserInteractiveTokens(
    params: InteractiveTokenParams,
  ): Promise<TokenV2[]> {
    const { address } = params;

    try {
      const addressInfo = await this.withQtumInfo(async (api) =>
        api.getAddressInfo(address),
      );

      if (
        !addressInfo.qrc20Balances ||
        addressInfo.qrc20Balances.length === 0
      ) {
        return [];
      }

      return addressInfo.qrc20Balances.map((token) => ({
        contractAddress: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        balance: token.balance,
        type: AssetType.TOKEN,
        uniqueId: this.config.uniqueId,
      })) as unknown as TokenV2[];
    } catch (e) {
      console.error("getUserInteractiveTokens error:", e);
      return [];
    }
  }

  // ===== Send Max =====

  supportSendMaxNative(): boolean {
    return true;
  }
}

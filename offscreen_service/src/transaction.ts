import type { AleoProgramImportsMap } from "./aleo.di";
import {
  PrivateKey,
  Program,
  ProgramManager,
  ProgramManagerBase,
  RecordPlaintext,
  type Transaction,
  ProvingKey,
  VerifyingKey,
} from "@provablehq/sdk/mainnet.js";
import { AleoStorage } from "./AleoStorage";
import {
  AleoTxStatus,
  type AleoSendTxParams,
  type AleoTransaction,
  type AleoLocalTxInfo,
  type AleoRequestDeploymentParams,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "./types";
import { type AleoRpcService, createAleoRpcService } from "./instances/rpc";

const NATIVE_TOKEN_DECIMALS = 6;
const INCLUSION_PROVER_URL =
  "https://keys.provable.com/wallet_v2/inclusion.prover.9fe710f";

export class AleoTxWorker {
  rpcService: AleoRpcService;
  storage: AleoStorage;
  private measureMap: {
    [process in string]?: { time: number; count: number; max: number };
  } = {};

  constructor(
    private workerId: number,
    private readonly rpcList: string[],
    public enableMeasure: boolean,
  ) {
    // rpcList = shuffle(rpcList);
    this.rpcService = createAleoRpcService(rpcList);
    this.storage = AleoStorage.getInstance();
  }

  get getWorkerId() {
    return this.workerId;
  }

  parsePrivateKey = (privateKeyStr: string): PrivateKey => {
    try {
      const privateKey = PrivateKey.from_string(privateKeyStr);
      return privateKey;
    } catch (err) {
      throw new Error("Invalid private key");
    }
  };

  parseProgram = (programStr: string): Program => {
    try {
      const program = Program.fromString(programStr);
      return program;
    } catch (err) {
      throw new Error("Invalid program " + programStr);
    }
  };

  parseRecord = (recordStr: string): RecordPlaintext => {
    try {
      const record = RecordPlaintext.fromString(recordStr);
      return record;
    } catch (err) {
      throw new Error("Invalid record " + recordStr);
    }
  };

  async getProgramContent(chainId: string, programId: string) {
    const cache = await this.storage.getProgramContent(chainId, programId);
    console.log("===> getProgramContent cache: ", cache?.length);
    if (cache) {
      return cache;
    }
    const program = await this.rpcService.getProgram(programId);
    console.log("===> getProgramContent: ", program.length);
    if (program) {
      await this.storage.setProgramContent(chainId, programId, program);
    }
    return program;
  }

  async getProgram(
    chainId: string,
    programId: string,
  ): Promise<Program | null> {
    const programStr = await this.getProgramContent(chainId, programId);
    if (programStr) {
      return this.parseProgram(programStr);
    }
    return null;
  }

  async getProgramImports(chainId: string, program: Program | string) {
    const imports: AleoProgramImportsMap = {};
    const programObj =
      program instanceof Program
        ? program
        : await this.getProgram(chainId, program);
    if (!programObj) {
      throw new Error(
        "getProgramImports get program " + program.toString() + " failed",
      );
    }
    const importList = programObj.getImports() as string[];
    console.log("===> getProgramImports: ", importList);
    for (let i = 0; i < importList.length; i++) {
      const importId = importList[i];
      if (!imports[importId]) {
        const programSource = await this.getProgramContent(chainId, importId);
        if (!programSource) {
          throw new Error(
            "getProgramImports get program " + importId + " failed",
          );
        }
        const nestedImports = await this.getProgramImports(chainId, importId);
        for (const key in nestedImports) {
          if (!imports[key]) {
            imports[key] = nestedImports[key];
          }
        }
        imports[importId] = programSource;
      }
    }
    return imports;
  }

  async synthesizeKeyPair(
    privateKey: PrivateKey,
    chainId: string,
    programId: string,
    functionName: string,
    inputs: string[],
  ) {
    const programStr = await this.getProgramContent(chainId, programId);
    if (!programStr) {
      throw new Error("Fetch program " + programId + " failed");
    }
    const program = this.parseProgram(programStr);
    console.log(
      "===> synthesizeKeyPair parsed program",
      program.toString().length,
    );
    const hasFunction = program.hasFunction(functionName);
    if (!hasFunction) {
      throw new Error(
        `Program ${programId} does not contain function ${functionName}`,
      );
    }
    const imports = await this.getProgramImports(chainId, program);
    console.log(
      "===> before inner synthesizeKeypair: ",
      programId,
      functionName,
    );
    const startTime = performance.now();
    const keyPair = await ProgramManagerBase.synthesizeKeyPair(
      privateKey,
      programStr,
      functionName,
      inputs,
      imports,
    );
    console.log(
      "===> after inner synthesizeKeypair: ",
      performance.now() - startTime,
      programId,
      functionName,
    );
    return {
      proverFile: keyPair.provingKey(),
      verifierFile: keyPair.verifyingKey(),
    };
  }

  async getProverKeyPair(
    privateKey: PrivateKey,
    chainId: string,
    programId: string,
    functionName: string,
    inputs: string[],
  ) {
    const cachedKey = await this.storage.getProgramKeyPair(
      chainId,
      programId,
      functionName,
    );
    console.log("===> getProverKeyPair cacheKey: ", !!cachedKey);
    if (cachedKey) {
      return {
        proverFile: ProvingKey.fromBytes(cachedKey.proverFile),
        verifierFile: VerifyingKey.fromBytes(cachedKey.verifierFile),
      };
    }
    const keyPair = await this.synthesizeKeyPair(
      privateKey,
      chainId,
      programId,
      functionName,
      inputs,
    );
    await this.storage.setProgramKeyPair(chainId, programId, functionName, {
      proverFile: keyPair.proverFile.copy().toBytes(),
      verifierFile: keyPair.verifierFile.copy().toBytes(),
    });
    return keyPair;
  }

  async submitTransaction(tx: Transaction) {
    return await this.rpcService.submitTransaction(tx);
  }

  // The transaction id the SDK precomputes in `tx.toString()` does not always
  // match the id the network assigns on broadcast (e.g. once the inclusion
  // proof / fee transition is finalized). The Record Scanner and explorer
  // report the on-chain id, so storing the SDK id locally makes the same
  // transaction show up twice in history (once from the local pending tx,
  // once from the scanner). The broadcast endpoint returns the canonical
  // `at1...` id, so prefer it whenever it looks valid and only fall back to
  // the locally-derived id. Mirrors provable-extension's postTransactionExecution.
  private resolveOnChainTxId(
    broadcastResult: unknown,
    fallbackId: string,
  ): string {
    const candidate =
      typeof broadcastResult === "string"
        ? broadcastResult
        : broadcastResult &&
          typeof broadcastResult === "object" &&
          "id" in broadcastResult &&
          typeof (broadcastResult as { id: unknown }).id === "string"
        ? (broadcastResult as { id: string }).id
        : undefined;
    const normalized = candidate?.trim();
    if (normalized && normalized.toLowerCase().startsWith("at1")) {
      return normalized;
    }
    return fallbackId;
  }

  toErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  private isRpcFetchError(err: unknown): boolean {
    const message = this.toErrorMessage(err);
    return /Failed to fetch/i.test(message) || /network error/i.test(message);
  }

  private getBuildRpcUrls(): string[] {
    const currentRpcUrl = this.rpcService.proxyCurrConfig();
    const seen = new Set<string>();
    return [currentRpcUrl, ...this.rpcList].filter((rpcUrl) => {
      if (seen.has(rpcUrl)) {
        return false;
      }
      seen.add(rpcUrl);
      return true;
    });
  }

  private async buildWithRpcFallback<T extends Transaction>(
    operation: string,
    build: (rpcUrl: string) => Promise<T>,
  ): Promise<T> {
    const rpcUrls = this.getBuildRpcUrls();
    let lastError: unknown;

    for (let index = 0; index < rpcUrls.length; index++) {
      const rpcUrl = rpcUrls[index];
      try {
        console.log(
          `===> ${operation} rpc attempt`,
          index + 1,
          rpcUrls.length,
          rpcUrl,
        );
        return await build(rpcUrl);
      } catch (err) {
        lastError = err;
        const message = this.toErrorMessage(err);
        console.warn(`===> ${operation} rpc attempt failed`, {
          rpcUrl,
          error: message,
        });

        if (!this.isRpcFetchError(err) || index === rpcUrls.length - 1) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  // Fetch the SnarkVM inclusion prover bytes, preferring the IndexedDB cache
  // and falling back to a one-time CDN download that gets persisted for next
  // time. Returns null on any failure so callers can let the SDK's auto-fetch
  // path (slow but functional) take over.
  private async loadInclusionProverBytes(
    chainId: string,
  ): Promise<Uint8Array | null> {
    try {
      const cached = await this.storage.getInclusionProver(
        chainId,
        INCLUSION_PROVER_URL,
      );
      if (cached) {
        return cached;
      }
      const start = performance.now();
      const response = await fetch(INCLUSION_PROVER_URL);
      if (!response.ok) {
        console.warn(
          `[InclusionProver] fetch failed status=${response.status}`,
        );
        return null;
      }
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      console.log(
        "[InclusionProver] downloaded",
        bytes.byteLength,
        "bytes in",
        (performance.now() - start).toFixed(0),
        "ms",
      );
      await this.storage.setInclusionProver(
        chainId,
        bytes,
        INCLUSION_PROVER_URL,
      );
      return bytes;
    } catch (err) {
      console.warn("[InclusionProver] preload failed:", err);
      return null;
    }
  }

  async sendTransaction({
    privateKey,
    address,
    localId,
    chainId,
    programId,
    functionName,
    inputs,
    baseFee,
    priorityFee,
    feeRecord: feeRecordStr,
    timestamp,
    amount,
    tokenId,
  }: AleoSendTxParams): Promise<null | AleoTransaction> {
    const normalizedInputs = inputs;
    const normalizedFeeRecordStr = feeRecordStr;
    const pendingTxInfo: AleoLocalTxInfo = {
      localId,
      address,
      programId,
      functionName,
      inputs: normalizedInputs,
      baseFee,
      priorityFee,
      feeRecord: normalizedFeeRecordStr,
      status: AleoTxStatus.QUEUED,
      timestamp,
      amount,
      notification: false,
      tokenId,
    };
    try {
      const startTime = performance.now();
      const privateKeyObj = this.parsePrivateKey(privateKey);
      const programStr = await this.getProgramContent(chainId, programId);
      if (!programStr) {
        throw new Error("Get program content failed " + programId);
      }
      console.log(
        "===> before getProverKeyPair ",
        programId,
        functionName,
        normalizedInputs,
      );

      pendingTxInfo.status = AleoTxStatus.GENERATING_PROVER_FILES;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const startProverTime = performance.now();
      const { proverFile, verifierFile } = await this.getProverKeyPair(
        privateKeyObj,
        chainId,
        programId,
        functionName,
        normalizedInputs,
      );
      const totalProverTiime = performance.now() - startProverTime;
      console.log("===> after getProverKeyPair ", totalProverTiime);

      pendingTxInfo.status = AleoTxStatus.GENERATING_TRANSACTION;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const imports = await this.getProgramImports(chainId, programId);
      console.log("===> before buildExecutionTransaction ");
      const priorityFeeCredits =
        Number(BigInt(baseFee) + BigInt(priorityFee)) /
        10 ** NATIVE_TOKEN_DECIMALS;
      const privateFee = !!normalizedFeeRecordStr;

      const inclusionProverBytes = await this.loadInclusionProverBytes(chainId);

      const tx: Transaction = await this.buildWithRpcFallback(
        "buildExecutionTransaction",
        async (rpcUrl) => {
          const programManager = new ProgramManager(rpcUrl);
          if (inclusionProverBytes) {
            try {
              await programManager.setInclusionProver(
                ProvingKey.fromBytes(inclusionProverBytes),
              );
            } catch (err) {
              console.warn(
                "[InclusionProver] setInclusionProver failed, SDK will auto-fetch:",
                err,
              );
            }
          }
          return await programManager.buildExecutionTransaction({
            privateKey: privateKeyObj,
            programName: programId,
            functionName,
            inputs: normalizedInputs,
            priorityFee: priorityFeeCredits,
            privateFee,
            feeRecord: normalizedFeeRecordStr ?? undefined,
            program: programStr,
            imports,
            provingKey: proverFile.copy(),
            verifyingKey: verifierFile.copy(),
          });
        },
      );
      console.log("===> before submitTransaction ", tx.toString());

      pendingTxInfo.status = AleoTxStatus.BROADCASTING;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const result = await this.submitTransaction(tx);
      const totalTime = performance.now() - startTime;
      console.log("===> sendTransaction totalTime", totalTime);
      console.log("===> sendTransaction tx: ", result);
      if (result) {
        pendingTxInfo.status = AleoTxStatus.COMPLETED;
        const txObj: AleoTransaction = JSON.parse(tx.toString());
        // Use the network-assigned id from the broadcast response as the
        // canonical id so the local tx merges with the scanner/explorer entry.
        txObj.id = this.resolveOnChainTxId(result, txObj.id);
        pendingTxInfo.transaction = txObj;
        await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
        return txObj;
      }
      throw new Error("submitTransaction returned empty response");
    } catch (err) {
      console.error("===> sendTransaction error ", err);
      pendingTxInfo.status = AleoTxStatus.FAILED;
      pendingTxInfo.error = this.toErrorMessage(err);
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
      throw err;
    }
  }

  async deploy({
    privateKey,
    chainId,
    address,
    localId,
    program,
    programId,
    baseFee,
    priorityFee,
    feeRecord: feeRecordStr,
    timestamp,
  }: AleoRequestDeploymentParams) {
    const normalizedFeeRecordStr = feeRecordStr;
    const pendingTxInfo: AleoLocalTxInfo = {
      localId,
      address,
      programId,
      functionName: "",
      inputs: [],
      baseFee,
      priorityFee,
      feeRecord: normalizedFeeRecordStr,
      status: AleoTxStatus.QUEUED,
      timestamp,
      notification: false,
      tokenId: NATIVE_TOKEN_TOKEN_ID,
    };
    try {
      const startTime = performance.now();
      const privateKeyObj = this.parsePrivateKey(privateKey);
      const programObj = this.parseProgram(program);

      // SDK 0.10.x handles fee circuit keys internally; no local
      // fee_private/fee_public prover synthesis here. See sendTransaction
      // for the same reason.

      pendingTxInfo.status = AleoTxStatus.GENERATING_TRANSACTION;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const imports = await this.getProgramImports(chainId, programObj);
      console.log("===> before buildExecutionTransaction ");
      // TODO: regenerate tx when encounter inclusion error
      const deployPriorityFeeCredits =
        Number(BigInt(baseFee) + BigInt(priorityFee)) /
        10 ** NATIVE_TOKEN_DECIMALS;
      const deployPrivateFee = !!normalizedFeeRecordStr;
      const tx = await this.buildWithRpcFallback(
        "buildDeploymentTransaction",
        async (rpcUrl) => {
          const programManager = new ProgramManager(rpcUrl);
          return await programManager.buildDeploymentTransaction(
            program,
            deployPriorityFeeCredits,
            deployPrivateFee,
            undefined,
            normalizedFeeRecordStr ?? undefined,
            privateKeyObj,
          );
        },
      );
      console.log("===> before submitTransaction ", tx.toString());

      pendingTxInfo.status = AleoTxStatus.BROADCASTING;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const result = await this.submitTransaction(tx);
      const totalTime = performance.now() - startTime;
      console.log("===> sendTransaction totalTime", totalTime, result);
      if (result) {
        pendingTxInfo.status = AleoTxStatus.COMPLETED;
        const txObj: AleoTransaction = JSON.parse(tx.toString());
        // Use the network-assigned id from the broadcast response as the
        // canonical id so the local tx merges with the scanner/explorer entry.
        txObj.id = this.resolveOnChainTxId(result, txObj.id);
        pendingTxInfo.transaction = txObj;
        await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
        return txObj;
      }
      throw new Error("submitTransaction returned empty response");
    } catch (err) {
      console.error("===> sendTransaction error ", err);
      pendingTxInfo.status = AleoTxStatus.FAILED;
      pendingTxInfo.error = this.toErrorMessage(err);
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
      throw err;
    }
  }
}

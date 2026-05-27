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
import { utils } from "ethers";
import { parseU64 } from "./utils/num";

const NATIVE_TOKEN_DECIMALS = 6;

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
      // SDK 0.10.x handles the fee circuit keys internally — synthesizing
      // fee_private/fee_public via the execution-flow API yields a key
      // SnarkVM rejects with "trace cannot call 'prove_execution' for a
      // fee type". The fee record / priorityFee / privateFee are passed
      // through ExecuteOptions; the SDK takes care of the rest.
      const isSplitTx =
        programId === NATIVE_TOKEN_PROGRAM_ID && functionName === "split";

      pendingTxInfo.status = AleoTxStatus.GENERATING_TRANSACTION;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const imports = await this.getProgramImports(chainId, programId);
      console.log("===> before buildExecutionTransaction ");
      // TODO: regenerate tx when encounter inclusion error
      let tx: Transaction;
      const priorityFeeCredits =
        Number(BigInt(baseFee) + BigInt(priorityFee)) /
        10 ** NATIVE_TOKEN_DECIMALS;
      const privateFee = !!normalizedFeeRecordStr;

      if (isSplitTx) {
        // SDK split() builds + broadcasts in one shot and returns a tx id.
        // Skip the manual submitTransaction path below.
        const splitAmountMicrocredits = Number(parseU64(normalizedInputs[1]));
        const splitTxId = await this.buildWithRpcFallback(
          "buildSplitTransaction",
          async (rpcUrl) => {
            const programManager = new ProgramManager(rpcUrl);
            return await programManager.split(
              splitAmountMicrocredits,
              normalizedInputs[0],
              privateKeyObj,
            );
          },
        );
        pendingTxInfo.status = AleoTxStatus.COMPLETED;
        await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
        const totalTime = performance.now() - startTime;
        console.log("===> split tx done", totalTime, splitTxId);
        return null;
      }

      tx = await this.buildWithRpcFallback(
        "buildExecutionTransaction",
        async (rpcUrl) => {
          const programManager = new ProgramManager(rpcUrl);
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
        pendingTxInfo.transaction = txObj;
        await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
        return JSON.parse(tx.toString());
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
        pendingTxInfo.transaction = txObj;
        await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
        return JSON.parse(tx.toString());
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

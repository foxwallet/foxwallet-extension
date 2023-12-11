import { shuffle } from "@/common/utils/array";
import type { AleoProgramImportsMap, LogFunc } from "./aleo.di";
import {
  PrivateKey,
  Program,
  ProgramManager,
  RecordPlaintext,
  Transaction,
  Field,
  ProvingKey,
  VerifyingKey,
} from "aleo_wasm";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";
import { AutoSwitch } from "@/common/utils/retry";
import { AutoSwitchServiceType } from "@/common/types/retry";
import {
  AleoTxStatus,
  type AleoSendTxParams,
  type AleoTransaction,
  type AleoLocalTxInfo,
} from "core/coins/ALEO/types/Tranaction";
import { AleoRpcService } from "core/coins/ALEO/service/instances/rpc";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";

export class AleoTxWorker {
  rpcService: AleoRpcService;
  storage: AleoStorage;
  static logger: LogFunc | undefined;
  private measureMap: {
    [process in string]?: { time: number; count: number; max: number };
  } = {};

  static setLogger(logger: LogFunc) {
    AleoTxWorker.logger = logger;
  }

  constructor(
    private workerId: number,
    rpcList: string[],
    public enableMeasure: boolean,
  ) {
    // rpcList = shuffle(rpcList);
    this.rpcService = new AleoRpcService({ configs: rpcList });
    this.storage = AleoStorage.getInstance();
  }

  get getWorkerId() {
    return this.workerId;
  }

  log(...args: any[]) {
    if (AleoTxWorker.logger) {
      AleoTxWorker.logger("log", ` workerId ${this.workerId} `, ...args);
    } else {
      console.log("===> worker's logger is not set");
    }
  }

  error(...args: any[]) {
    if (AleoTxWorker.logger) {
      AleoTxWorker.logger("error", ` workerId ${this.workerId} `, ...args);
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

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async getProgramContent(chainId: string, programId: string) {
    const cache = await this.storage.getProgramContent(chainId, programId);
    this.log("===> getProgramContent cache: ", cache?.length);
    if (cache) {
      return cache;
    }
    const program = await this.rpcService.currInstance().getProgram(programId);
    this.log("===> getProgramContent: ", program.length);
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

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
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
    this.log("===> getProgramImports: ", importList);
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
    this.log("===> before inner synthesizeKeypair: ", programId, functionName);
    const startTime = performance.now();
    const keyPair = await ProgramManager.synthesizeKeypair(
      privateKey,
      programStr,
      functionName,
      inputs,
      imports,
    );
    this.log(
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
    this.log("===> getProverKeyPair cacheKey: ", !!cachedKey);
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

  @AutoSwitch({ serviceType: AutoSwitchServiceType.RPC })
  async submitTransaction(tx: Transaction) {
    return await this.rpcService.currInstance().submitTransaction(tx);
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
  }: AleoSendTxParams): Promise<null | AleoTransaction> {
    const pendingTxInfo: AleoLocalTxInfo = {
      localId,
      programId,
      functionName,
      inputs,
      baseFee,
      priorityFee,
      feeRecord: feeRecordStr,
      status: AleoTxStatus.QUEUED,
      timestamp,
      amount,
    };
    try {
      const startTime = performance.now();
      const privateKeyObj = this.parsePrivateKey(privateKey);
      const programStr = await this.getProgramContent(chainId, programId);
      if (!programStr) {
        throw new Error("Get program content failed " + programId);
      }
      this.log(
        "===> before getProverKeyPair ",
        programId,
        functionName,
        inputs,
      );

      pendingTxInfo.status = AleoTxStatus.GENERATING_PROVER_FILES;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const startProverTime = performance.now();
      const { proverFile, verifierFile } = await this.getProverKeyPair(
        privateKeyObj,
        chainId,
        programId,
        functionName,
        inputs,
      );
      const totalProverTiime = performance.now() - startProverTime;
      this.log("===> after getProverKeyPair ", totalProverTiime);
      const baseFeeStr = `${baseFee}u64`;
      const priorityFeeStr = `${priorityFee}u64`;
      const feeMethod = feeRecordStr ? "fee_private" : "fee_public";
      const placeHolderExecutionId =
        "1143400038019697993839685533973968560341409464418545224213773009891993380112field";
      const feeInputs = feeRecordStr
        ? [feeRecordStr, baseFeeStr, priorityFeeStr, placeHolderExecutionId]
        : [baseFeeStr, priorityFeeStr, placeHolderExecutionId];
      this.log("===> before getFeeProverKeyPair ");
      const startFeeProverTime = performance.now();
      const { proverFile: feeProverFile, verifierFile: feeVerifierKey } =
        await this.getProverKeyPair(
          privateKeyObj,
          chainId,
          NATIVE_TOKEN_PROGRAM_ID,
          feeMethod,
          feeInputs,
        );
      const totalFeeProverTiime = performance.now() - startFeeProverTime;
      this.log("===> after getFeeProverKeyPair ", totalFeeProverTiime);

      pendingTxInfo.status = AleoTxStatus.GENERATING_TRANSACTION;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const imports = await this.getProgramImports(chainId, programId);
      const feeRecord = feeRecordStr
        ? this.parseRecord(feeRecordStr)
        : undefined;
      this.log("===> before buildExecutionTransaction ");
      // TODO: regenerate tx when encounter inclusion error
      const tx = await ProgramManager.buildExecutionTransaction(
        privateKeyObj,
        programStr,
        functionName,
        inputs,
        BigInt(baseFee),
        BigInt(priorityFee),
        feeRecord,
        this.rpcService.currConfig(),
        imports,
        proverFile,
        verifierFile,
        feeProverFile,
        feeVerifierKey,
      );
      this.log("===> before submitTransaction ", tx.toString());

      pendingTxInfo.status = AleoTxStatus.BROADCASTING;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const result = await this.submitTransaction(tx);
      const totalTime = performance.now() - startTime;
      this.log("===> sendTransaction totalTime", totalTime);
      this.log("===> sendTransaction tx: ", result);
      if (result) {
        pendingTxInfo.status = AleoTxStatus.COMPLETED;
        const txObj: AleoTransaction = JSON.parse(tx.toString());
        pendingTxInfo.transaction = txObj;
        await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
        return JSON.parse(tx.toString());
      }
      return null;
    } catch (err) {
      this.error("===> sendTransaction error ", err);
      pendingTxInfo.status = AleoTxStatus.FAILED;
      pendingTxInfo.error = (err as Error).toString();
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
      return null;
    }
  }
}

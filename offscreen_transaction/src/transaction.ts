import type { AleoProgramImportsMap } from "./aleo.di";
import {
  PrivateKey,
  Program,
  ProgramManager,
  RecordPlaintext,
  type Transaction,
  ProvingKey,
  VerifyingKey,
} from "@provablehq/wasm";
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
    rpcList: string[],
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
    const keyPair = await ProgramManager.synthesizeKeyPair(
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
    const pendingTxInfo: AleoLocalTxInfo = {
      localId,
      address,
      programId,
      functionName,
      inputs,
      baseFee,
      priorityFee,
      feeRecord: feeRecordStr,
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
      console.log("===> after getProverKeyPair ", totalProverTiime);
      let feeProverFile: ProvingKey | undefined;
      let feeVerifierKey: VerifyingKey | undefined;
      const isSplitTx =
        programId === NATIVE_TOKEN_PROGRAM_ID && functionName === "split";
      if (!isSplitTx) {
        const baseFeeStr = `${baseFee}u64`;
        const priorityFeeStr = `${priorityFee}u64`;
        const feeMethod = feeRecordStr ? "fee_private" : "fee_public";
        const placeHolderExecutionId =
          "1143400038019697993839685533973968560341409464418545224213773009891993380112field";
        const feeInputs = feeRecordStr
          ? [feeRecordStr, baseFeeStr, priorityFeeStr, placeHolderExecutionId]
          : [baseFeeStr, priorityFeeStr, placeHolderExecutionId];
        console.log("===> before getFeeProverKeyPair ");
        const startFeeProverTime = performance.now();
        const keys = await this.getProverKeyPair(
          privateKeyObj,
          chainId,
          NATIVE_TOKEN_PROGRAM_ID,
          feeMethod,
          feeInputs,
        );
        feeProverFile = keys.proverFile;
        feeVerifierKey = keys.verifierFile;
        const totalFeeProverTiime = performance.now() - startFeeProverTime;
        console.log("===> after getFeeProverKeyPair ", totalFeeProverTiime);
      }

      pendingTxInfo.status = AleoTxStatus.GENERATING_TRANSACTION;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const imports = await this.getProgramImports(chainId, programId);
      const feeRecord = feeRecordStr
        ? this.parseRecord(feeRecordStr)
        : undefined;
      console.log("===> before buildExecutionTransaction ");
      // TODO: regenerate tx when encounter inclusion error
      let tx: Transaction;
      if (!isSplitTx) {
        tx = await ProgramManager.buildExecutionTransaction(
          privateKeyObj,
          programStr,
          functionName,
          inputs,
          BigInt(baseFee),
          BigInt(priorityFee),
          feeRecord,
          this.rpcService.proxyCurrConfig(),
          imports,
          proverFile,
          verifierFile,
          feeProverFile,
          feeVerifierKey,
        );
      } else {
        tx = await ProgramManager.buildSplitTransaction(
          privateKeyObj,
          Number(utils.formatUnits(parseU64(inputs[1]), NATIVE_TOKEN_DECIMALS)),
          RecordPlaintext.fromString(inputs[0]),
          this.rpcService.proxyCurrConfig(),
          proverFile,
          verifierFile,
        );
      }
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
      return null;
    } catch (err) {
      console.error("===> sendTransaction error ", err);
      pendingTxInfo.status = AleoTxStatus.FAILED;
      pendingTxInfo.error = (err as Error).toString();
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
      return null;
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
    const pendingTxInfo: AleoLocalTxInfo = {
      localId,
      address,
      programId,
      functionName: "",
      inputs: [],
      baseFee,
      priorityFee,
      feeRecord: feeRecordStr,
      status: AleoTxStatus.QUEUED,
      timestamp,
      notification: false,
      tokenId: NATIVE_TOKEN_TOKEN_ID,
    };
    try {
      const startTime = performance.now();
      const privateKeyObj = this.parsePrivateKey(privateKey);
      const programObj = this.parseProgram(program);

      pendingTxInfo.status = AleoTxStatus.GENERATING_PROVER_FILES;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const baseFeeStr = `${baseFee}u64`;
      const priorityFeeStr = `${priorityFee}u64`;
      const feeMethod = feeRecordStr ? "fee_private" : "fee_public";
      const placeHolderExecutionId =
        "1143400038019697993839685533973968560341409464418545224213773009891993380112field";
      const feeInputs = feeRecordStr
        ? [feeRecordStr, baseFeeStr, priorityFeeStr, placeHolderExecutionId]
        : [baseFeeStr, priorityFeeStr, placeHolderExecutionId];
      console.log("===> before getFeeProverKeyPair ");
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
      console.log("===> after getFeeProverKeyPair ", totalFeeProverTiime);

      pendingTxInfo.status = AleoTxStatus.GENERATING_TRANSACTION;
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);

      const imports = await this.getProgramImports(chainId, programObj);
      const feeRecord = feeRecordStr
        ? this.parseRecord(feeRecordStr)
        : undefined;
      console.log("===> before buildExecutionTransaction ");
      // TODO: regenerate tx when encounter inclusion error
      const tx = await ProgramManager.buildDeploymentTransaction(
        privateKeyObj,
        program,
        BigInt(baseFee),
        BigInt(priorityFee),
        feeRecord,
        this.rpcService.proxyCurrConfig(),
        imports,
        feeProverFile,
        feeVerifierKey,
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
      return null;
    } catch (err) {
      console.error("===> sendTransaction error ", err);
      pendingTxInfo.status = AleoTxStatus.FAILED;
      pendingTxInfo.error = (err as Error).toString();
      await this.storage.setAddressLocalTx(chainId, address, pendingTxInfo);
      return null;
    }
  }
}

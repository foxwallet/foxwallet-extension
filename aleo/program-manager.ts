import {
  Account,
  AleoKeyProvider,
  AleoNetworkClient,
  ExecutionResponse,
  FunctionKeyProvider,
  FunctionKeyPair,
  KeySearchParams,
  RecordPlaintext,
  RecordProvider,
  RecordSearchParams,
  PrivateKey,
  Program,
  ProgramImports,
  ProvingKey,
  VerifyingKey,
  PRIVATE_TRANSFER_TYPES,
  VALID_TRANSFER_TYPES,
  logAndThrow,
  ProgramManagerBase as WasmProgramManager,
} from "./index";

/**
 * The ProgramManager class is used to execute and deploy programs on the Aleo network and create value transfers.
 */
class ProgramManager {
  account: Account | undefined;
  keyProvider: FunctionKeyProvider;
  host: string;
  networkClient: AleoNetworkClient;
  recordProvider: RecordProvider | undefined;

  /** Create a new instance of the ProgramManager
   *
   * @param { string | undefined } host A host uri running the official Aleo API
   * @param { FunctionKeyProvider | undefined } keyProvider A key provider that implements {@link FunctionKeyProvider} interface
   * @param { RecordProvider | undefined } recordProvider A record provider that implements {@link RecordProvider} interface
   */
  constructor(
    host: string | undefined,
    keyProvider: FunctionKeyProvider | undefined,
    recordProvider: RecordProvider | undefined,
  ) {
    if (!host) {
      this.host = "https://vm.aleo.org/api";
      this.networkClient = new AleoNetworkClient(this.host);
    } else {
      this.host = host;
      this.networkClient = new AleoNetworkClient(host);
    }

    if (!keyProvider) {
      this.keyProvider = new AleoKeyProvider();
    } else {
      this.keyProvider = keyProvider;
    }

    this.recordProvider = recordProvider;
  }

  /**
   * Set the account to use for transaction submission to the Aleo network
   *
   * @param {Account} account Account to use for transaction submission
   */
  setAccount(account: Account) {
    this.account = account;
  }

  /**
   * Set the key provider that provides the proving and verifying keys for programs
   *
   * @param {FunctionKeyProvider} keyProvider
   */
  setKeyProvider(keyProvider: FunctionKeyProvider) {
    this.keyProvider = keyProvider;
  }

  /**
   * Set the host peer to use for transaction submission to the Aleo network
   *
   * @param host {string} Peer url to use for transaction submission
   */
  setHost(host: string) {
    this.host = host;
    this.networkClient.setHost(host);
  }

  /**
   * Set the record provider that provides records for transactions
   *
   * @param {RecordProvider} recordProvider
   */
  setRecordProvider(recordProvider: RecordProvider) {
    this.recordProvider = recordProvider;
  }

  /**
   * Deploy an Aleo program to the Aleo network
   *
   * @param {string} program Program source code
   * @param {number} fee Fee to pay for the transaction
   * @param {boolean} privateFee Use a private record to pay the fee. If false this will use the account's public credit balance
   * @param {RecordSearchParams | undefined} recordSearchParams Optional parameters for searching for a record to use
   * pay the deployment fee
   * @param {string | RecordPlaintext | undefined} feeRecord Optional Fee record to use for the transaction
   * @param {PrivateKey | undefined} privateKey Optional private key to use for the transaction
   * @returns {string | Error} The transaction id of the deployed program or a failure message from the network
   *
   * @example
   * // Create a new NetworkClient, KeyProvider, and RecordProvider
   * const networkClient = new AleoNetworkClient("https://vm.aleo.org/api");
   * const keyProvider = new AleoKeyProvider();
   * const recordProvider = new NetworkRecordProvider(account, networkClient);
   *
   * // Initialize a program manager with the key provider to automatically fetch keys for deployments
   * const program = "program hello_hello.aleo;\n\nfunction hello:\n    input r0 as u32.public;\n    input r1 as u32.private;\n    add r0 r1 into r2;\n    output r2 as u32.private;\n";
   * const programManager = new ProgramManager("https://vm.aleo.org/api", keyProvider, recordProvider);
   *
   * // Define a fee in credits
   * const fee = 1.2;
   *
   * // Deploy the program
   * const tx_id = await programManager.deploy(program, fee);
   *
   * // Verify the transaction was successful
   * const transaction = await programManager.networkClient.getTransaction(tx_id);
   */
  async deploy(
    program: string,
    fee: number,
    privateFee: boolean,
    recordSearchParams?: RecordSearchParams,
    feeRecord?: string | RecordPlaintext,
    privateKey?: PrivateKey,
  ): Promise<string | Error> {
    // Ensure the program is valid and does not exist on the network
    try {
      const programObject = Program.fromString(program);
      let programSource;
      try {
        programSource = await this.networkClient.getProgram(programObject.id());
      } catch (e) {
        // Program does not exist on the network, deployment can proceed
        console.log(
          `Program ${programObject.id()} does not exist on the network, deploying...`,
        );
      }
      if (typeof programSource == "string") {
        throw `Program ${programObject.id()} already exists on the network, please rename your program`;
      }
    } catch (e) {
      throw logAndThrow(`Error validating program: ${e}`);
    }

    // Get the private key from the account if it is not provided in the parameters
    let deploymentPrivateKey = privateKey;
    if (
      typeof privateKey === "undefined" &&
      typeof this.account !== "undefined"
    ) {
      deploymentPrivateKey = this.account.privateKey();
    }

    if (typeof deploymentPrivateKey === "undefined") {
      throw "No private key provided and no private key set in the ProgramManager";
    }

    // Get the fee record from the account if it is not provided in the parameters
    try {
      feeRecord = privateFee
        ? <RecordPlaintext>(
            await this.getCreditsRecord(fee, [], feeRecord, recordSearchParams)
          )
        : undefined;
    } catch (e) {
      throw logAndThrow(
        `Error finding fee record. Record finder response: '${e}'. Please ensure you're connected to a valid Aleo network and a record with enough balance exists.`,
      );
    }

    // Get the proving and verifying keys from the key provider
    let feeKeys;
    try {
      feeKeys = privateFee
        ? <FunctionKeyPair>await this.keyProvider.feePrivateKeys()
        : <FunctionKeyPair>await this.keyProvider.feePublicKeys();
    } catch (e) {
      throw logAndThrow(
        `Error finding fee keys. Key finder response: '${e}'. Please ensure your key provider is configured correctly.`,
      );
    }
    const [feeProvingKey, feeVerifyingKey] = feeKeys;

    // Resolve the program imports if they exist
    let imports;
    try {
      imports = await this.networkClient.getProgramImports(program);
    } catch (e) {
      throw logAndThrow(
        `Error finding program imports. Network response: '${e}'. Please ensure you're connected to a valid Aleo network and the program is deployed to the network.`,
      );
    }

    // Build a deployment transaction and submit it to the network
    const tx = await WasmProgramManager.buildDeploymentTransaction(
      deploymentPrivateKey,
      program,
      fee,
      feeRecord,
      this.host,
      imports,
      feeProvingKey,
      feeVerifyingKey,
    );
    return await this.networkClient.submitTransaction(tx);
  }

  /**
   * Execute an Aleo program on the Aleo network
   *
   * @param {string} programName Program name containing the function to be executed
   * @param {string} functionName Function name to execute
   * @param {number} fee Fee to pay for the transaction
   * @param {boolean} privateFee Use a private record to pay the fee. If false this will use the account's public credit balance
   * @param {string[]} inputs Inputs to the function
   * @param {RecordSearchParams} recordSearchParams Optional parameters for searching for a record to pay the fee for
   * the execution transaction
   * @param {KeySearchParams} keySearchParams Optional parameters for finding the matching proving & verifying keys
   * for the function
   * @param {string | RecordPlaintext | undefined} feeRecord Optional Fee record to use for the transaction
   * @param {ProvingKey | undefined} provingKey Optional proving key to use for the transaction
   * @param {VerifyingKey | undefined} verifyingKey Optional verifying key to use for the transaction
   * @param {PrivateKey | undefined} privateKey Optional private key to use for the transaction
   * @returns {Promise<string | Error>}
   *
   * @example
   * // Create a new NetworkClient, KeyProvider, and RecordProvider using official Aleo record, key, and network providers
   * const networkClient = new AleoNetworkClient("https://vm.aleo.org/api");
   * const keyProvider = new AleoKeyProvider();
   * keyProvider.useCache = true;
   * const recordProvider = new NetworkRecordProvider(account, networkClient);
   *
   * // Initialize a program manager with the key provider to automatically fetch keys for executions
   * const programName = "hello_hello.aleo";
   * const programManager = new ProgramManager("https://vm.aleo.org/api", keyProvider, recordProvider);
   * const keySearchParams = { "cacheKey": "hello_hello:hello" };
   * const tx_id = await programManager.execute(programName, "hello_hello", 0.020, ["5u32", "5u32"], undefined, undefined, undefined, keySearchParams);
   * const transaction = await programManager.networkClient.getTransaction(tx_id);
   */
  async execute(
    programName: string,
    functionName: string,
    fee: number,
    privateFee: boolean,
    inputs: string[],
    recordSearchParams?: RecordSearchParams,
    keySearchParams?: KeySearchParams,
    feeRecord?: string | RecordPlaintext,
    provingKey?: ProvingKey,
    verifyingKey?: VerifyingKey,
    privateKey?: PrivateKey,
  ): Promise<string | Error> {
    // Ensure the function exists on the network
    let program;
    try {
      program = <string>await this.networkClient.getProgram(programName);
    } catch (e) {
      throw logAndThrow(
        `Error finding ${programName}. Network response: '${e}'. Please ensure you're connected to a valid Aleo network the program is deployed to the network.`,
      );
    }

    // Get the private key from the account if it is not provided in the parameters
    let executionPrivateKey = privateKey;
    if (
      typeof privateKey === "undefined" &&
      typeof this.account !== "undefined"
    ) {
      executionPrivateKey = this.account.privateKey();
    }

    if (typeof executionPrivateKey === "undefined") {
      throw "No private key provided and no private key set in the ProgramManager";
    }

    // Get the fee record from the account if it is not provided in the parameters
    try {
      feeRecord = privateFee
        ? <RecordPlaintext>(
            await this.getCreditsRecord(fee, [], feeRecord, recordSearchParams)
          )
        : undefined;
    } catch (e) {
      throw logAndThrow(
        `Error finding fee record. Record finder response: '${e}'. Please ensure you're connected to a valid Aleo network and a record with enough balance exists.`,
      );
    }

    // Get the fee proving and verifying keys from the key provider
    let feeKeys;
    try {
      feeKeys = privateFee
        ? <FunctionKeyPair>await this.keyProvider.feePrivateKeys()
        : <FunctionKeyPair>await this.keyProvider.feePublicKeys();
    } catch (e) {
      throw logAndThrow(
        `Error finding fee keys. Key finder response: '${e}'. Please ensure your key provider is configured correctly.`,
      );
    }
    const [feeProvingKey, feeVerifyingKey] = feeKeys;

    // If the function proving and verifying keys are not provided, attempt to find them using the key provider
    if (!provingKey || !verifyingKey) {
      try {
        [provingKey, verifyingKey] = <FunctionKeyPair>(
          await this.keyProvider.functionKeys(keySearchParams)
        );
      } catch (e) {
        console.log(
          `Function keys not found. Key finder response: '${e}'. The function keys will be synthesized`,
        );
      }
    }

    // Resolve the program imports if they exist
    let imports;
    try {
      imports = await this.networkClient.getProgramImports(programName);
    } catch (e) {
      throw logAndThrow(
        `Error finding program imports. Network response: '${e}'. Please ensure you're connected to a valid Aleo network and the program is deployed to the network.`,
      );
    }

    // Build an execution transaction and submit it to the network
    const tx = await WasmProgramManager.buildExecutionTransaction(
      executionPrivateKey,
      program,
      functionName,
      inputs,
      fee,
      feeRecord,
      this.host,
      imports,
      provingKey,
      verifyingKey,
      feeProvingKey,
      feeVerifyingKey,
    );
    return await this.networkClient.submitTransaction(tx);
  }

  /**
   * Execute an Aleo program in offline mode
   *
   * @param {string} program Program source code containing the function to be executed
   * @param {string} function_name Function name to execute
   * @param {string[]} inputs Inputs to the function
   * @param {number} proveExecution Whether to prove the execution of the function and return an execution transcript
   * that contains the proof.
   * @param {string[] | undefined} imports Optional imports to the program
   * @param {KeySearchParams | undefined} keySearchParams Optional parameters for finding the matching proving &
   * verifying keys for the function
   * @param {ProvingKey | undefined} provingKey Optional proving key to use for the transaction
   * @param {VerifyingKey | undefined} verifyingKey Optional verifying key to use for the transaction
   * @param {PrivateKey | undefined} privateKey Optional private key to use for the transaction
   * @returns {Promise<string | Error>}
   *
   * @example
   * import { Account, Program } from '@aleohq/sdk';
   *
   * /// Create the source for the "helloworld" program
   * const program = "program helloworld.aleo;\n\nfunction hello:\n    input r0 as u32.public;\n    input r1 as u32.private;\n    add r0 r1 into r2;\n    output r2 as u32.private;\n";
   * const programManager = new ProgramManager();
   *
   * /// Create a temporary account for the execution of the program
   * const account = new Account();
   * programManager.setAccount(account);
   *
   * /// Get the response and ensure that the program executed correctly
   * const executionResponse = await programManager.executeOffline(program, "hello", ["5u32", "5u32"]);
   * const result = executionResponse.getOutputs();
   * assert(result === ["10u32"]);
   */
  async executeOffline(
    program: string,
    function_name: string,
    inputs: string[],
    proveExecution: boolean,
    imports?: ProgramImports,
    keySearchParams?: KeySearchParams,
    provingKey?: ProvingKey,
    verifyingKey?: VerifyingKey,
    privateKey?: PrivateKey,
  ): Promise<ExecutionResponse> {
    // Get the private key from the account if it is not provided in the parameters
    let executionPrivateKey = privateKey;
    if (
      typeof privateKey === "undefined" &&
      typeof this.account !== "undefined"
    ) {
      executionPrivateKey = this.account.privateKey();
    }

    if (typeof executionPrivateKey === "undefined") {
      throw "No private key provided and no private key set in the ProgramManager";
    }

    // If the function proving and verifying keys are not provided, attempt to find them using the key provider
    if (!provingKey || !verifyingKey) {
      try {
        [provingKey, verifyingKey] = <FunctionKeyPair>(
          await this.keyProvider.functionKeys(keySearchParams)
        );
      } catch (e) {
        console.log(
          `Function keys not found. Key finder response: '${e}'. The function keys will be synthesized`,
        );
      }
    }

    // Run the program offline and return the result
    console.log("Running program offline");
    console.log("Proving key: ", provingKey);
    console.log("Verifying key: ", verifyingKey);
    return WasmProgramManager.executeFunctionOffline(
      executionPrivateKey,
      program,
      function_name,
      inputs,
      proveExecution,
      false,
      imports,
      provingKey,
      verifyingKey,
    );
  }

  /**
   * Join two credits records into a single credits record
   *
   * @param {RecordPlaintext | string} recordOne First credits record to join
   * @param {RecordPlaintext | string} recordTwo Second credits record to join
   * @param {number} fee Fee in credits pay for the join transaction
   * @param {boolean} privateFee Use a private record to pay the fee. If false this will use the account's public credit balance
   * @param {RecordSearchParams | undefined} recordSearchParams Optional parameters for finding the fee record to use
   * to pay the fee for the join transaction
   * @param {RecordPlaintext | string | undefined} feeRecord Fee record to use for the join transaction
   * @param {PrivateKey | undefined} privateKey Private key to use for the join transaction
   * @returns {Promise<string | Error>}
   */
  async join(
    recordOne: RecordPlaintext | string,
    recordTwo: RecordPlaintext | string,
    fee: number,
    privateFee: boolean,
    recordSearchParams?: RecordSearchParams | undefined,
    feeRecord?: RecordPlaintext | string | undefined,
    privateKey?: PrivateKey,
  ): Promise<string | Error> {
    // Get the private key from the account if it is not provided in the parameters
    let executionPrivateKey = privateKey;
    if (
      typeof privateKey === "undefined" &&
      typeof this.account !== "undefined"
    ) {
      executionPrivateKey = this.account.privateKey();
    }

    if (typeof executionPrivateKey === "undefined") {
      throw "No private key provided and no private key set in the ProgramManager";
    }

    // Get the proving and verifying keys from the key provider
    let feeKeys;
    let joinKeys;
    try {
      feeKeys = privateFee
        ? <FunctionKeyPair>await this.keyProvider.feePrivateKeys()
        : <FunctionKeyPair>await this.keyProvider.feePublicKeys();
      joinKeys = <FunctionKeyPair>await this.keyProvider.joinKeys();
    } catch (e) {
      throw logAndThrow(
        `Error finding fee keys. Key finder response: '${e}'. Please ensure your key provider is configured correctly.`,
      );
    }
    const [feeProvingKey, feeVerifyingKey] = feeKeys;
    const [joinProvingKey, joinVerifyingKey] = joinKeys;

    // Get the fee record from the account if it is not provided in the parameters
    try {
      feeRecord = privateFee
        ? <RecordPlaintext>(
            await this.getCreditsRecord(fee, [], feeRecord, recordSearchParams)
          )
        : undefined;
    } catch (e) {
      throw logAndThrow(
        `Error finding fee record. Record finder response: '${e}'. Please ensure you're connected to a valid Aleo network and a record with enough balance exists.`,
      );
    }

    // Validate the records provided are valid plaintext records
    try {
      recordOne =
        recordOne instanceof RecordPlaintext
          ? recordOne
          : RecordPlaintext.fromString(recordOne);
      recordTwo =
        recordTwo instanceof RecordPlaintext
          ? recordTwo
          : RecordPlaintext.fromString(recordTwo);
    } catch (e) {
      throw logAndThrow(
        "Records provided are not valid. Please ensure they are valid plaintext records.",
      );
    }

    // Build an execution transaction and submit it to the network
    const tx = await WasmProgramManager.buildJoinTransaction(
      executionPrivateKey,
      recordOne,
      recordTwo,
      fee,
      feeRecord,
      this.host,
      joinProvingKey,
      joinVerifyingKey,
      feeProvingKey,
      feeVerifyingKey,
    );
    return await this.networkClient.submitTransaction(tx);
  }

  /**
   * Split credits into two new credits records
   *
   * @param {number} splitAmount Amount in microcredits to split from the original credits record
   * @param {RecordPlaintext | string} amountRecord Amount record to use for the split transaction
   * @param {PrivateKey | undefined} privateKey Optional private key to use for the split transaction
   * @returns {Promise<string | Error>}
   *
   * @example
   * // Create a new NetworkClient, KeyProvider, and RecordProvider
   * const networkClient = new AleoNetworkClient("https://vm.aleo.org/api");
   * const keyProvider = new AleoKeyProvider();
   * const recordProvider = new NetworkRecordProvider(account, networkClient);
   *
   * // Initialize a program manager with the key provider to automatically fetch keys for executions
   * const programName = "hello_hello.aleo";
   * const programManager = new ProgramManager("https://vm.aleo.org/api", keyProvider, recordProvider);
   * const record = "{  owner: aleo184vuwr5u7u0ha5f5k44067dd2uaqewxx6pe5ltha5pv99wvhfqxqv339h4.private,  microcredits: 45000000u64.private,  _nonce: 4106205762862305308495708971985748592380064201230396559307556388725936304984group.public}"
   * const tx_id = await programManager.split(25000000, record);
   * const transaction = await programManager.networkClient.getTransaction(tx_id);
   */
  async split(
    splitAmount: number,
    amountRecord: RecordPlaintext | string,
    privateKey?: PrivateKey,
  ): Promise<string | Error> {
    // Get the private key from the account if it is not provided in the parameters
    let executionPrivateKey = privateKey;
    if (
      typeof executionPrivateKey === "undefined" &&
      typeof this.account !== "undefined"
    ) {
      executionPrivateKey = this.account.privateKey();
    }

    if (typeof executionPrivateKey === "undefined") {
      throw "No private key provided and no private key set in the ProgramManager";
    }

    // Get the split keys from the key provider
    let splitKeys;
    try {
      splitKeys = <FunctionKeyPair>await this.keyProvider.splitKeys();
    } catch (e) {
      throw logAndThrow(
        `Error finding fee keys. Key finder response: '${e}'. Please ensure your key provider is configured correctly.`,
      );
    }
    const [splitProvingKey, splitVerifyingKey] = splitKeys;

    // Validate the record to be split
    try {
      amountRecord =
        amountRecord instanceof RecordPlaintext
          ? amountRecord
          : RecordPlaintext.fromString(amountRecord);
    } catch (e) {
      throw logAndThrow(
        "Record provided is not valid. Please ensure it is a valid plaintext record.",
      );
    }

    // Build an execution transaction and submit it to the network
    const tx = await WasmProgramManager.buildSplitTransaction(
      executionPrivateKey,
      splitAmount,
      amountRecord,
      this.host,
      splitProvingKey,
      splitVerifyingKey,
    );
    return await this.networkClient.submitTransaction(tx);
  }

  /**
   * Pre-synthesize proving and verifying keys for a program
   *
   * @param program {string} The program source code to synthesize keys for
   * @param function_id {string} The function id to synthesize keys for
   * @param inputs {Array<string>}  Sample inputs to the function
   * @param privateKey {PrivateKey | undefined} Optional private key to use for the key synthesis
   *
   * @returns {Promise<FunctionKeyPair | Error>}
   */
  async synthesizeKeys(
    program: string,
    function_id: string,
    inputs: Array<string>,
    privateKey?: PrivateKey,
  ): Promise<FunctionKeyPair | Error> {
    // Resolve the program imports if they exist
    let imports;

    let executionPrivateKey = privateKey;
    if (typeof executionPrivateKey === "undefined") {
      if (typeof this.account !== "undefined") {
        executionPrivateKey = this.account.privateKey();
      } else {
        executionPrivateKey = new PrivateKey();
      }
    }

    // Attempt to run an offline execution of the program and extract the proving and verifying keys
    try {
      imports = await this.networkClient.getProgramImports(program);
      const keyPair = await WasmProgramManager.synthesizeKeypair(
        executionPrivateKey,
        program,
        function_id,
        inputs,
        imports,
      );
      return [
        <VerifyingKey>keyPair.provingKey(),
        <ProvingKey>keyPair.verifyingKey(),
      ];
    } catch (e) {
      throw logAndThrow(
        `Could not synthesize keys - error ${e}. Please ensure the program is valid and the inputs are correct.`,
      );
    }
  }

  /**
   * Transfer credits to another account
   *
   * @param {number} amount The amount of credits to transfer
   * @param {string} recipient The recipient of the transfer
   * @param {string} transferType The type of transfer to perform - options: 'private', 'privateToPublic', 'public', 'publicToPrivate'
   * @param {number} fee The fee to pay for the transfer
   * @param {boolean} privateFee Use a private record to pay the fee. If false this will use the account's public credit balance
   * @param {RecordSearchParams | undefined} recordSearchParams Optional parameters for finding the amount and fee
   * records for the transfer transaction
   * @param {RecordPlaintext | string} amountRecord Optional amount record to use for the transfer
   * @param {RecordPlaintext | string} feeRecord Optional fee record to use for the transfer
   * @param {PrivateKey | undefined} privateKey Optional private key to use for the transfer transaction
   * @returns {Promise<string | Error>} The transaction id of the transfer transaction
   *
   * @example
   * // Create a new NetworkClient, KeyProvider, and RecordProvider
   * const networkClient = new AleoNetworkClient("https://vm.aleo.org/api");
   * const keyProvider = new AleoKeyProvider();
   * const recordProvider = new NetworkRecordProvider(account, networkClient);
   *
   * // Initialize a program manager with the key provider to automatically fetch keys for executions
   * const programName = "hello_hello.aleo";
   * const programManager = new ProgramManager("https://vm.aleo.org/api", keyProvider, recordProvider);
   * await programManager.initialize();
   * const tx_id = await programManager.transfer(1, "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px", "private", 0.2)
   * const transaction = await programManager.networkClient.getTransaction(tx_id);
   */
  async transfer(
    amount: number,
    recipient: string,
    transferType: string,
    fee: number,
    privateFee: boolean,
    recordSearchParams?: RecordSearchParams,
    amountRecord?: RecordPlaintext | string,
    feeRecord?: RecordPlaintext | string,
    privateKey?: PrivateKey,
  ): Promise<string | Error> {
    // Validate the transfer type
    transferType = <string>validateTransferType(transferType);

    // Get the private key from the account if it is not provided in the parameters
    let executionPrivateKey = privateKey;
    if (
      typeof executionPrivateKey === "undefined" &&
      typeof this.account !== "undefined"
    ) {
      executionPrivateKey = this.account.privateKey();
    }

    if (typeof executionPrivateKey === "undefined") {
      throw "No private key provided and no private key set in the ProgramManager";
    }

    // Get the proving and verifying keys from the key provider
    let feeKeys;
    let transferKeys;
    try {
      feeKeys = privateFee
        ? <FunctionKeyPair>await this.keyProvider.feePrivateKeys()
        : <FunctionKeyPair>await this.keyProvider.feePublicKeys();
      transferKeys = <FunctionKeyPair>(
        await this.keyProvider.transferKeys(transferType)
      );
    } catch (e) {
      throw logAndThrow(
        `Error finding fee keys. Key finder response: '${e}'. Please ensure your key provider is configured correctly.`,
      );
    }
    const [feeProvingKey, feeVerifyingKey] = feeKeys;
    const [transferProvingKey, transferVerifyingKey] = transferKeys;

    // Get the amount and fee record from the account if it is not provided in the parameters
    try {
      // Track the nonces of the records found so no duplicate records are used
      const nonces: string[] = [];
      if (requiresAmountRecord(transferType)) {
        // If the transfer type is private and requires an amount record, get it from the record provider
        amountRecord = <RecordPlaintext>(
          await this.getCreditsRecord(fee, [], amountRecord, recordSearchParams)
        );
        nonces.push(amountRecord.nonce());
      } else {
        amountRecord = undefined;
      }
      feeRecord = privateFee
        ? <RecordPlaintext>(
            await this.getCreditsRecord(
              fee,
              nonces,
              feeRecord,
              recordSearchParams,
            )
          )
        : undefined;
    } catch (e) {
      throw logAndThrow(
        `Error finding fee record. Record finder response: '${e}'. Please ensure you're connected to a valid Aleo network and a record with enough balance exists.`,
      );
    }

    // Build an execution transaction and submit it to the network
    const tx = await WasmProgramManager.buildTransferTransaction(
      executionPrivateKey,
      amount,
      recipient,
      transferType,
      amountRecord,
      fee,
      feeRecord,
      this.host,
      transferProvingKey,
      transferVerifyingKey,
      feeProvingKey,
      feeVerifyingKey,
    );
    return await this.networkClient.submitTransaction(tx);
  }

  /**
   * Create a program object from a program's source code
   *
   * @param {string} program Program source code
   * @returns {Program | Error} The program object
   */
  createProgramFromSource(program: string): Program | Error {
    return Program.fromString(program);
  }

  /**
   * Get the credits program object
   *
   * @returns {Program} The credits program object
   */
  creditsProgram(): Program {
    return Program.getCreditsProgram();
  }

  /**
   * Verify a program is valid
   *
   * @param {string} program The program source code
   */
  verifyProgram(program: string): boolean {
    try {
      <Program>Program.fromString(program);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Internal utility function for getting a credits.aleo record
  async getCreditsRecord(
    amount: number,
    nonces: string[],
    record?: RecordPlaintext | string,
    params?: RecordSearchParams,
  ): Promise<RecordPlaintext | Error> {
    try {
      return record instanceof RecordPlaintext
        ? record
        : RecordPlaintext.fromString(<string>record);
    } catch (e) {
      try {
        const recordProvider = <RecordProvider>this.recordProvider;
        return <RecordPlaintext>(
          await recordProvider.findCreditsRecord(amount, true, nonces, params)
        );
      } catch (e) {
        throw logAndThrow(
          `Error finding fee record. Record finder response: '${e}'. Please ensure you're connected to a valid Aleo network and a record with enough balance exists.`,
        );
      }
    }
  }
}

// Ensure the transfer type requires an amount record
function requiresAmountRecord(transferType: string): boolean {
  return PRIVATE_TRANSFER_TYPES.has(transferType);
}

// Validate the transfer type
function validateTransferType(transferType: string): string | Error {
  return VALID_TRANSFER_TYPES.has(transferType)
    ? transferType
    : logAndThrow(
        `Invalid transfer type '${transferType}'. Valid transfer types are 'private', 'privateToPublic', 'public', and 'publicToPrivate'.`,
      );
}

export { ProgramManager };

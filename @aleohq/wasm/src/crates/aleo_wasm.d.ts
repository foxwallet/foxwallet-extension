/* tslint:disable */
/* eslint-disable */
/**
* Verify an execution with a single function and a single transition. Executions with multiple
* transitions or functions will fail to verify. Also, this does not verify that the state root of
* the execution is included in the Aleo Network ledger.
*
* @param {Execution} execution The function execution to verify
* @param {VerifyingKey} verifying_key The verifying key for the function
* @param {Program} program The program that the function execution belongs to
* @param {String} function_id The name of the function that was executed
* @returns {boolean} True if the execution is valid, false otherwise
* @param {Execution} execution
* @param {VerifyingKey} verifying_key
* @param {Program} program
* @param {string} function_id
* @returns {boolean}
*/
export function verifyFunctionExecution(execution: Execution, verifying_key: VerifyingKey, program: Program, function_id: string): boolean;
/**
* @param {number} receiver
*/
export function runRayonThread(receiver: number): void;
/**
* @param {URL} url
* @param {number} num_threads
* @returns {Promise<void>}
*/
export function initThreadPool(url: URL, num_threads: number): Promise<void>;
/**
* Public address of an Aleo account
*/
export class Address {
  free(): void;
/**
* Derive an Aleo address from a private key
*
* @param {PrivateKey} private_key The private key to derive the address from
* @returns {Address} Address corresponding to the private key
* @param {PrivateKey} private_key
* @returns {Address}
*/
  static from_private_key(private_key: PrivateKey): Address;
/**
* Derive an Aleo address from a view key
*
* @param {ViewKey} view_key The view key to derive the address from
* @returns {Address} Address corresponding to the view key
* @param {ViewKey} view_key
* @returns {Address}
*/
  static from_view_key(view_key: ViewKey): Address;
/**
* Create an aleo address object from a string representation of an address
*
* @param {string} address String representation of an addressm
* @returns {Address} Address
* @param {string} address
* @returns {Address}
*/
  static from_string(address: string): Address;
/**
* Get a string representation of an Aleo address object
*
* @param {Address} Address
* @returns {string} String representation of the address
* @returns {string}
*/
  to_string(): string;
/**
* Verify a signature for a message signed by the address
*
* @param {Uint8Array} Byte array representing a message signed by the address
* @returns {boolean} Boolean representing whether or not the signature is valid
* @param {Uint8Array} message
* @param {Signature} signature
* @returns {boolean}
*/
  verify(message: Uint8Array, signature: Signature): boolean;
}
/**
* Execution of an Aleo program.
*/
export class Execution {
  free(): void;
/**
* Returns the string representation of the execution.
* @returns {string}
*/
  toString(): string;
/**
* Creates an execution object from a string representation of an execution.
* @param {string} execution
* @returns {Execution}
*/
  static fromString(execution: string): Execution;
}
/**
* Webassembly Representation of an Aleo function execution response
*
* This object is returned by the execution of an Aleo function off-chain. It provides methods for
* retrieving the outputs of the function execution.
*/
export class ExecutionResponse {
  free(): void;
/**
* Get the outputs of the executed function
*
* @returns {Array} Array of strings representing the outputs of the function
* @returns {Array<any>}
*/
  getOutputs(): Array<any>;
/**
* Returns the execution object if present, null if otherwise.
*
* @returns {Execution | undefined} The execution object if present, null if otherwise
* @returns {Execution | undefined}
*/
  getExecution(): Execution | undefined;
/**
* Returns the program keys if present
* @returns {KeyPair}
*/
  getKeys(): KeyPair;
/**
* Returns the proving_key if the proving key was cached in the Execution response.
* Note the proving key is removed from the response object after the first call to this
* function. Subsequent calls will return null.
*
* @returns {ProvingKey | undefined} The proving key
* @returns {ProvingKey | undefined}
*/
  getProvingKey(): ProvingKey | undefined;
/**
* Returns the verifying_key associated with the program
*
* @returns {VerifyingKey} The verifying key
* @returns {VerifyingKey}
*/
  getVerifyingKey(): VerifyingKey;
/**
* Returns the function identifier
* @returns {string}
*/
  getFunctionId(): string;
/**
* Returns the program
* @returns {Program}
*/
  getProgram(): Program;
}
/**
*/
export class Field {
  free(): void;
/**
* @returns {string}
*/
  toString(): string;
/**
* @param {string} field
* @returns {Field}
*/
  static fromString(field: string): Field;
}
/**
* Key pair object containing both the function proving and verifying keys
*/
export class KeyPair {
  free(): void;
/**
* Create new key pair from proving and verifying keys
*
* @param {ProvingKey} proving_key Proving key corresponding to a function in an Aleo program
* @param {VerifyingKey} verifying_key Verifying key corresponding to a function in an Aleo program
* @returns {KeyPair} Key pair object containing both the function proving and verifying keys
* @param {ProvingKey} proving_key
* @param {VerifyingKey} verifying_key
*/
  constructor(proving_key: ProvingKey, verifying_key: VerifyingKey);
/**
* Get the proving key. This method will remove the proving key from the key pair
*
* @returns {ProvingKey | Error}
* @returns {ProvingKey}
*/
  provingKey(): ProvingKey;
/**
* Get the verifying key. This method will remove the verifying key from the key pair
*
* @returns {VerifyingKey | Error}
* @returns {VerifyingKey}
*/
  verifyingKey(): VerifyingKey;
}
/**
* An offline query object used to insert the global state root and state paths needed to create
* a valid inclusion proof offline.
*/
export class OfflineQuery {
  free(): void;
/**
* Creates a new offline query object. The state root is required to be passed in as a string
* @param {string} state_root
*/
  constructor(state_root: string);
/**
* Add a new state path to the offline query object.
*
* @param {string} commitment: The commitment corresponding to a record inpout
* @param {string} state_path: The state path corresponding to the commitment
* @param {string} commitment
* @param {string} state_path
*/
  addStatePath(commitment: string, state_path: string): void;
/**
* Get a json string representation of the offline query object
* @returns {string}
*/
  toString(): string;
/**
* Create an offline query object from a json string representation
* @param {string} s
* @returns {OfflineQuery}
*/
  static fromString(s: string): OfflineQuery;
}
/**
* Private key of an Aleo account
*/
export class PrivateKey {
  free(): void;
/**
* Generate a new private key using a cryptographically secure random number generator
*
* @returns {PrivateKey}
*/
  constructor();
/**
* Get a private key from a series of unchecked bytes
*
* @param {Uint8Array} seed Unchecked 32 byte long Uint8Array acting as the seed for the private key
* @returns {PrivateKey}
* @param {Uint8Array} seed
* @returns {PrivateKey}
*/
  static from_seed_unchecked(seed: Uint8Array): PrivateKey;
/**
* Get a private key from a string representation of a private key
*
* @param {string} seed String representation of a private key
* @returns {PrivateKey}
* @param {string} private_key
* @returns {PrivateKey}
*/
  static from_string(private_key: string): PrivateKey;
/**
* Get a string representation of the private key. This function should be used very carefully
* as it exposes the private key plaintext
*
* @returns {string} String representation of a private key
* @returns {string}
*/
  to_string(): string;
/**
* Get the view key corresponding to the private key
*
* @returns {ViewKey}
* @returns {ViewKey}
*/
  to_view_key(): ViewKey;
/**
* Get the address corresponding to the private key
*
* @returns {Address}
* @returns {Address}
*/
  to_address(): Address;
/**
* Sign a message with the private key
*
* @param {Uint8Array} Byte array representing a message signed by the address
* @returns {Signature} Signature generated by signing the message with the address
* @param {Uint8Array} message
* @returns {Signature}
*/
  sign(message: Uint8Array): Signature;
/**
* Get a new randomly generated private key ciphertext using a secret. The secret is sensitive
* and will be needed to decrypt the private key later, so it should be stored securely
*
* @param {string} secret Secret used to encrypt the private key
* @returns {PrivateKeyCiphertext | Error} Ciphertext representation of the private key
* @param {string} secret
* @returns {PrivateKeyCiphertext}
*/
  static newEncrypted(secret: string): PrivateKeyCiphertext;
/**
* Encrypt an existing private key with a secret. The secret is sensitive and will be needed to
* decrypt the private key later, so it should be stored securely
*
* @param {string} secret Secret used to encrypt the private key
* @returns {PrivateKeyCiphertext | Error} Ciphertext representation of the private key
* @param {string} secret
* @returns {PrivateKeyCiphertext}
*/
  toCiphertext(secret: string): PrivateKeyCiphertext;
/**
* Get private key from a private key ciphertext and secret originally used to encrypt it
*
* @param {PrivateKeyCiphertext} ciphertext Ciphertext representation of the private key
* @param {string} secret Secret originally used to encrypt the private key
* @returns {PrivateKey | Error} Private key
* @param {PrivateKeyCiphertext} ciphertext
* @param {string} secret
* @returns {PrivateKey}
*/
  static fromPrivateKeyCiphertext(ciphertext: PrivateKeyCiphertext, secret: string): PrivateKey;
}
/**
* Private Key in ciphertext form
*/
export class PrivateKeyCiphertext {
  free(): void;
/**
* Encrypt a private key using a secret string. The secret is sensitive and will be needed to
* decrypt the private key later, so it should be stored securely
*
* @param {PrivateKey} private_key Private key to encrypt
* @param {string} secret Secret to encrypt the private key with
* @returns {PrivateKeyCiphertext | Error} Private key ciphertext
* @param {PrivateKey} private_key
* @param {string} secret
* @returns {PrivateKeyCiphertext}
*/
  static encryptPrivateKey(private_key: PrivateKey, secret: string): PrivateKeyCiphertext;
/**
* Decrypts a private ciphertext using a secret string. This must be the same secret used to
* encrypt the private key
*
* @param {string} secret Secret used to encrypt the private key
* @returns {PrivateKey | Error} Private key
* @param {string} secret
* @returns {PrivateKey}
*/
  decryptToPrivateKey(secret: string): PrivateKey;
/**
* Returns the ciphertext string
*
* @returns {string} Ciphertext string
* @returns {string}
*/
  toString(): string;
/**
* Creates a PrivateKeyCiphertext from a string
*
* @param {string} ciphertext Ciphertext string
* @returns {PrivateKeyCiphertext | Error} Private key ciphertext
* @param {string} ciphertext
* @returns {PrivateKeyCiphertext}
*/
  static fromString(ciphertext: string): PrivateKeyCiphertext;
}
/**
* Webassembly Representation of an Aleo program
*/
export class Program {
  free(): void;
/**
* Create a program from a program string
*
* @param {string} program Aleo program source code
* @returns {Program | Error} Program object
* @param {string} program
* @returns {Program}
*/
  static fromString(program: string): Program;
/**
* Get a string representation of the program
*
* @returns {string} String containing the program source code
* @returns {string}
*/
  toString(): string;
/**
* Determine if a function is present in the program
*
* @param {string} functionName Name of the function to check for
* @returns {boolean} True if the program is valid, false otherwise
* @param {string} function_name
* @returns {boolean}
*/
  hasFunction(function_name: string): boolean;
/**
* Get javascript array of functions names in the program
*
* @returns {Array} Array of all function names present in the program
*
* @example
* const expected_functions = [
*   "mint",
*   "transfer_private",
*   "transfer_private_to_public",
*   "transfer_public",
*   "transfer_public_to_private",
*   "join",
*   "split",
*   "fee"
* ]
*
* const credits_program = aleo_wasm.Program.getCreditsProgram();
* const credits_functions = credits_program.getFunctions();
* console.log(credits_functions === expected_functions); // Output should be "true"
* @returns {Array<any>}
*/
  getFunctions(): Array<any>;
/**
* Get a javascript object representation of the function inputs and types. This can be used
* to generate a web form to capture user inputs for an execution of a function.
*
* @param {string} function_name Name of the function to get inputs for
* @returns {Array | Error} Array of function inputs
*
* @example
* const expected_inputs = [
*     {
*       type:"record",
*       visibility:"private",
*       record:"credits",
*       members:[
*         {
*           name:"microcredits",
*           type:"u64",
*           visibility:"private"
*         }
*       ],
*       register:"r0"
*     },
*     {
*       type:"address",
*       visibility:"private",
*       register:"r1"
*     },
*     {
*       type:"u64",
*       visibility:"private",
*       register:"r2"
*     }
* ];
*
* const credits_program = aleo_wasm.Program.getCreditsProgram();
* const transfer_function_inputs = credits_program.getFunctionInputs("transfer_private");
* console.log(transfer_function_inputs === expected_inputs); // Output should be "true"
* @param {string} function_name
* @returns {Array<any>}
*/
  getFunctionInputs(function_name: string): Array<any>;
/**
* Get a the list of a program's mappings and the names/types of their keys and values.
*
* @returns {Array | Error} - An array of objects representing the mappings in the program
* @example
* const expected_mappings = [
*    {
*       name: "account",
*       key_name: "owner",
*       key_type: "address",
*       value_name: "microcredits",
*       value_type: "u64"
*    }
* ]
*
* const credits_program = aleo_wasm.Program.getCreditsProgram();
* const credits_mappings = credits_program.getMappings();
* console.log(credits_mappings === expected_mappings); // Output should be "true"
* @returns {Array<any>}
*/
  getMappings(): Array<any>;
/**
* Get a javascript object representation of a program record and its types
*
* @param {string} record_name Name of the record to get members for
* @returns {Object | Error} Object containing the record name, type, and members
*
* @example
*
* const expected_record = {
*     type: "record",
*     record: "Credits",
*     members: [
*       {
*         name: "owner",
*         type: "address",
*         visibility: "private"
*       },
*       {
*         name: "microcredits",
*         type: "u64",
*         visibility: "private"
*       }
*     ];
*  };
*
* const credits_program = aleo_wasm.Program.getCreditsProgram();
* const credits_record = credits_program.getRecordMembers("Credits");
* console.log(credits_record === expected_record); // Output should be "true"
* @param {string} record_name
* @returns {object}
*/
  getRecordMembers(record_name: string): object;
/**
* Get a javascript object representation of a program struct and its types
*
* @param {string} struct_name Name of the struct to get members for
* @returns {Array | Error} Array containing the struct members
*
* @example
*
* const STRUCT_PROGRAM = "program token_issue.aleo;
*
* struct token_metadata:
*     network as u32;
*     version as u32;
*
* struct token:
*     token_id as u32;
*     metadata as token_metadata;
*
* function no_op:
*    input r0 as u64;
*    output r0 as u64;"
*
* const expected_struct_members = [
*    {
*      name: "token_id",
*      type: "u32",
*    },
*    {
*      name: "metadata",
*      type: "struct",
*      struct_id: "token_metadata",
*      members: [
*       {
*         name: "network",
*         type: "u32",
*       }
*       {
*         name: "version",
*         type: "u32",
*       }
*     ]
*   }
* ];
*
* const program = aleo_wasm.Program.fromString(STRUCT_PROGRAM);
* const struct_members = program.getStructMembers("token");
* console.log(struct_members === expected_struct_members); // Output should be "true"
* @param {string} struct_name
* @returns {Array<any>}
*/
  getStructMembers(struct_name: string): Array<any>;
/**
* Get the credits.aleo program
*
* @returns {Program} The credits.aleo program
* @returns {Program}
*/
  static getCreditsProgram(): Program;
/**
* Get the id of the program
*
* @returns {string} The id of the program
* @returns {string}
*/
  id(): string;
/**
* Get a unique address of the program
*
* @returns {Address} The address of the program
* @returns {Address}
*/
  address(): Address;
/**
* Determine equality with another program
*
* @param {Program} other The other program to compare
* @returns {boolean} True if the programs are equal, false otherwise
* @param {Program} other
* @returns {boolean}
*/
  isEqual(other: Program): boolean;
/**
* Get program_imports
*
* @returns {Array} The program imports
*
* @example
*
* const DOUBLE_TEST = "import multiply_test.aleo;
*
* program double_test.aleo;
*
* function double_it:
*     input r0 as u32.private;
*     call multiply_test.aleo/multiply 2u32 r0 into r1;
*     output r1 as u32.private;";
*
* const expected_imports = [
*    "multiply_test.aleo"
* ];
*
* const program = aleo_wasm.Program.fromString(DOUBLE_TEST_PROGRAM);
* const imports = program.getImports();
* console.log(imports === expected_imports); // Output should be "true"
* @returns {Array<any>}
*/
  getImports(): Array<any>;
}
/**
*/
export class ProgramManager {
  free(): void;
/**
* Deploy an Aleo program
*
* @param private_key The private key of the sender
* @param program The source code of the program being deployed
* @param imports A javascript object holding the source code of any imported programs in the
* form \{"program_name1": "program_source_code", "program_name2": "program_source_code", ..\}.
* Note that all imported programs must be deployed on chain before the main program in order
* for the deployment to succeed
* @param fee_credits The amount of credits to pay as a fee
* @param fee_record The record to spend the fee from
* @param url The url of the Aleo network node to send the transaction to
* @param imports (optional) Provide a list of imports to use for the program deployment in the
* form of a javascript object where the keys are a string of the program name and the values
* are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
* @param fee_proving_key (optional) Provide a proving key to use for the fee execution
* @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
* @returns {Transaction | Error}
* @param {PrivateKey} private_key
* @param {string} program
* @param {bigint} base_fee
* @param {bigint} priority_fee
* @param {RecordPlaintext | undefined} fee_record
* @param {string | undefined} url
* @param {object | undefined} imports
* @param {ProvingKey | undefined} fee_proving_key
* @param {VerifyingKey | undefined} fee_verifying_key
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<Transaction>}
*/
  static buildDeploymentTransaction(private_key: PrivateKey, program: string, base_fee: bigint, priority_fee: bigint, fee_record?: RecordPlaintext, url?: string, imports?: object, fee_proving_key?: ProvingKey, fee_verifying_key?: VerifyingKey, offline_query?: OfflineQuery): Promise<Transaction>;
/**
* Estimate the fee for a program deployment
*
* Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
*
* @param program The source code of the program being deployed
* @param imports (optional) Provide a list of imports to use for the deployment fee estimation
* in the form of a javascript object where the keys are a string of the program name and the values
* are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
* @returns {u64 | Error}
* @param {string} program
* @param {object | undefined} imports
* @returns {Promise<bigint>}
*/
  static estimateDeploymentFee(program: string, imports?: object): Promise<bigint>;
/**
* Estimate the component of the deployment cost which comes from the fee for the program name.
* Note that this cost does not represent the entire cost of deployment. It is additional to
* the cost of the size (in bytes) of the deployment.
*
* Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
*
* @param name The name of the program to be deployed
* @returns {u64 | Error}
* @param {string} name
* @returns {bigint}
*/
  static estimateProgramNameCost(name: string): bigint;
/**
* Execute an arbitrary function locally
*
* @param {PrivateKey} private_key The private key of the sender
* @param {string} program The source code of the program being executed
* @param {string} function The name of the function to execute
* @param {Array} inputs A javascript array of inputs to the function
* @param {boolean} prove_execution If true, the execution will be proven and an execution object
* containing the proof and the encrypted inputs and outputs needed to verify the proof offline
* will be returned.
* @param {boolean} cache Cache the proving and verifying keys in the Execution response.
* If this is set to 'true' the keys synthesized will be stored in the Execution Response
* and the `ProvingKey` and `VerifyingKey` can be retrieved from the response via the `.getKeys()`
* method.
* @param {Object | undefined} imports (optional) Provide a list of imports to use for the function execution in the
* form of a javascript object where the keys are a string of the program name and the values
* are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
* @param {ProvingKey | undefined} proving_key (optional) Provide a verifying key to use for the function execution
* @param {VerifyingKey | undefined} verifying_key (optional) Provide a verifying key to use for the function execution
* @param {PrivateKey} private_key
* @param {string} program
* @param {string} _function
* @param {Array<any>} inputs
* @param {boolean} prove_execution
* @param {boolean} cache
* @param {object | undefined} imports
* @param {ProvingKey | undefined} proving_key
* @param {VerifyingKey | undefined} verifying_key
* @param {string | undefined} url
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<ExecutionResponse>}
*/
  static executeFunctionOffline(private_key: PrivateKey, program: string, _function: string, inputs: Array<any>, prove_execution: boolean, cache: boolean, imports?: object, proving_key?: ProvingKey, verifying_key?: VerifyingKey, url?: string, offline_query?: OfflineQuery): Promise<ExecutionResponse>;
/**
* Execute Aleo function and create an Aleo execution transaction
*
* @param private_key The private key of the sender
* @param program The source code of the program being executed
* @param function The name of the function to execute
* @param inputs A javascript array of inputs to the function
* @param fee_credits The amount of credits to pay as a fee
* @param fee_record The record to spend the fee from
* @param url The url of the Aleo network node to send the transaction to
* If this is set to 'true' the keys synthesized (or passed in as optional parameters via the
* `proving_key` and `verifying_key` arguments) will be stored in the ProgramManager's memory
* and used for subsequent transactions. If this is set to 'false' the proving and verifying
* keys will be deallocated from memory after the transaction is executed.
* @param imports (optional) Provide a list of imports to use for the function execution in the
* form of a javascript object where the keys are a string of the program name and the values
* are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
* @param proving_key (optional) Provide a verifying key to use for the function execution
* @param verifying_key (optional) Provide a verifying key to use for the function execution
* @param fee_proving_key (optional) Provide a proving key to use for the fee execution
* @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
* @returns {Transaction | Error}
* @param {PrivateKey} private_key
* @param {string} program
* @param {string} _function
* @param {Array<any>} inputs
* @param {bigint} base_fee
* @param {bigint} priority_fee
* @param {RecordPlaintext | undefined} fee_record
* @param {string | undefined} url
* @param {object | undefined} imports
* @param {ProvingKey | undefined} proving_key
* @param {VerifyingKey | undefined} verifying_key
* @param {ProvingKey | undefined} fee_proving_key
* @param {VerifyingKey | undefined} fee_verifying_key
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<Transaction>}
*/
  static buildExecutionTransaction(private_key: PrivateKey, program: string, _function: string, inputs: Array<any>, base_fee: bigint, priority_fee: bigint, fee_record?: RecordPlaintext, url?: string, imports?: object, proving_key?: ProvingKey, verifying_key?: VerifyingKey, fee_proving_key?: ProvingKey, fee_verifying_key?: VerifyingKey, offline_query?: OfflineQuery): Promise<Transaction>;
/**
* Estimate Fee for Aleo function execution. Note if "cache" is set to true, the proving and
* verifying keys will be stored in the ProgramManager's memory and used for subsequent
* program executions.
*
* Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network
*
* @param private_key The private key of the sender
* @param program The source code of the program to estimate the execution fee for
* @param function The name of the function to execute
* @param inputs A javascript array of inputs to the function
* @param url The url of the Aleo network node to send the transaction to
* @param imports (optional) Provide a list of imports to use for the fee estimation in the
* form of a javascript object where the keys are a string of the program name and the values
* are a string representing the program source code \{ "hello.aleo": "hello.aleo source code" \}
* @param proving_key (optional) Provide a verifying key to use for the fee estimation
* @param verifying_key (optional) Provide a verifying key to use for the fee estimation
* @returns {u64 | Error} Fee in microcredits
* @param {PrivateKey} private_key
* @param {string} program
* @param {string} _function
* @param {Array<any>} inputs
* @param {string | undefined} url
* @param {object | undefined} imports
* @param {ProvingKey | undefined} proving_key
* @param {VerifyingKey | undefined} verifying_key
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<bigint>}
*/
  static estimateExecutionFee(private_key: PrivateKey, program: string, _function: string, inputs: Array<any>, url?: string, imports?: object, proving_key?: ProvingKey, verifying_key?: VerifyingKey, offline_query?: OfflineQuery): Promise<bigint>;
/**
* Join two records together to create a new record with an amount of credits equal to the sum
* of the credits of the two original records
*
* @param private_key The private key of the sender
* @param record_1 The first record to combine
* @param record_2 The second record to combine
* @param fee_credits The amount of credits to pay as a fee
* @param fee_record The record to spend the fee from
* @param url The url of the Aleo network node to send the transaction to
* @param join_proving_key (optional) Provide a proving key to use for the join function
* @param join_verifying_key (optional) Provide a verifying key to use for the join function
* @param fee_proving_key (optional) Provide a proving key to use for the fee execution
* @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
* @returns {Transaction | Error} Transaction object
* @param {PrivateKey} private_key
* @param {RecordPlaintext} record_1
* @param {RecordPlaintext} record_2
* @param {number} fee_credits
* @param {RecordPlaintext | undefined} fee_record
* @param {string | undefined} url
* @param {ProvingKey | undefined} join_proving_key
* @param {VerifyingKey | undefined} join_verifying_key
* @param {ProvingKey | undefined} fee_proving_key
* @param {VerifyingKey | undefined} fee_verifying_key
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<Transaction>}
*/
  static buildJoinTransaction(private_key: PrivateKey, record_1: RecordPlaintext, record_2: RecordPlaintext, fee_credits: number, fee_record?: RecordPlaintext, url?: string, join_proving_key?: ProvingKey, join_verifying_key?: VerifyingKey, fee_proving_key?: ProvingKey, fee_verifying_key?: VerifyingKey, offline_query?: OfflineQuery): Promise<Transaction>;
/**
* Split an Aleo credits record into two separate records. This function does not require a fee.
*
* @param private_key The private key of the sender
* @param split_amount The amount of the credit split. This amount will be subtracted from the
* value of the record and two new records will be created with the split amount and the remainder
* @param amount_record The record to split
* @param url The url of the Aleo network node to send the transaction to
* @param split_proving_key (optional) Provide a proving key to use for the split function
* @param split_verifying_key (optional) Provide a verifying key to use for the split function
* @returns {Transaction | Error} Transaction object
* @param {PrivateKey} private_key
* @param {number} split_amount
* @param {RecordPlaintext} amount_record
* @param {string | undefined} url
* @param {ProvingKey | undefined} split_proving_key
* @param {VerifyingKey | undefined} split_verifying_key
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<Transaction>}
*/
  static buildSplitTransaction(private_key: PrivateKey, split_amount: number, amount_record: RecordPlaintext, url?: string, split_proving_key?: ProvingKey, split_verifying_key?: VerifyingKey, offline_query?: OfflineQuery): Promise<Transaction>;
/**
* Send credits from one Aleo account to another
*
* @param private_key The private key of the sender
* @param amount_credits The amount of credits to send
* @param recipient The recipient of the transaction
* @param transfer_type The type of the transfer (options: "private", "public", "private_to_public", "public_to_private")
* @param amount_record The record to fund the amount from
* @param fee_credits The amount of credits to pay as a fee
* @param fee_record The record to spend the fee from
* @param url The url of the Aleo network node to send the transaction to
* @param transfer_verifying_key (optional) Provide a verifying key to use for the transfer
* function
* @param fee_proving_key (optional) Provide a proving key to use for the fee execution
* @param fee_verifying_key (optional) Provide a verifying key to use for the fee execution
* @returns {Transaction | Error}
* @param {PrivateKey} private_key
* @param {number} amount_credits
* @param {string} recipient
* @param {string} transfer_type
* @param {RecordPlaintext | undefined} amount_record
* @param {number} fee_credits
* @param {RecordPlaintext | undefined} fee_record
* @param {string | undefined} url
* @param {ProvingKey | undefined} transfer_proving_key
* @param {VerifyingKey | undefined} transfer_verifying_key
* @param {ProvingKey | undefined} fee_proving_key
* @param {VerifyingKey | undefined} fee_verifying_key
* @param {OfflineQuery | undefined} offline_query
* @returns {Promise<Transaction>}
*/
  static buildTransferTransaction(private_key: PrivateKey, amount_credits: number, recipient: string, transfer_type: string, amount_record: RecordPlaintext | undefined, fee_credits: number, fee_record?: RecordPlaintext, url?: string, transfer_proving_key?: ProvingKey, transfer_verifying_key?: VerifyingKey, fee_proving_key?: ProvingKey, fee_verifying_key?: VerifyingKey, offline_query?: OfflineQuery): Promise<Transaction>;
/**
* Synthesize proving and verifying keys for a program
*
* @param program {string} The program source code of the program to synthesize keys for
* @param function_id {string} The function to synthesize keys for
* @param inputs {Array} The inputs to the function
* @param imports {Object | undefined} The imports for the program
* @param {PrivateKey} private_key
* @param {string} program
* @param {string} function_id
* @param {Array<any>} inputs
* @param {object | undefined} imports
* @returns {Promise<KeyPair>}
*/
  static synthesizeKeyPair(private_key: PrivateKey, program: string, function_id: string, inputs: Array<any>, imports?: object): Promise<KeyPair>;
}
/**
* Proving key for a function within an Aleo program
*/
export class ProvingKey {
  free(): void;
/**
* Return the checksum of the proving key
*
* @returns {string} Checksum of the proving key
* @returns {string}
*/
  checksum(): string;
/**
* Create a copy of the proving key
*
* @returns {ProvingKey} A copy of the proving key
* @returns {ProvingKey}
*/
  copy(): ProvingKey;
/**
* Construct a new proving key from a byte array
*
* @param {Uint8Array} bytes Byte array representation of a proving key
* @returns {ProvingKey | Error}
* @param {Uint8Array} bytes
* @returns {ProvingKey}
*/
  static fromBytes(bytes: Uint8Array): ProvingKey;
/**
* Create a proving key from string
*
* @param {string | Error} String representation of the proving key
* @param {string} string
* @returns {ProvingKey}
*/
  static fromString(string: string): ProvingKey;
/**
* Return the byte representation of a proving key
*
* @returns {Uint8Array | Error} Byte array representation of a proving key
* @returns {Uint8Array}
*/
  toBytes(): Uint8Array;
/**
* Get a string representation of the proving key
*
* @returns {string} String representation of the proving key
* @returns {string}
*/
  toString(): string;
}
/**
* Encrypted Aleo record
*/
export class RecordCiphertext {
  free(): void;
/**
* Create a record ciphertext from a string
*
* @param {string} record String representation of a record ciphertext
* @returns {RecordCiphertext | Error} Record ciphertext
* @param {string} record
* @returns {RecordCiphertext}
*/
  static fromString(record: string): RecordCiphertext;
/**
* Return the string reprensentation of the record ciphertext
*
* @returns {string} String representation of the record ciphertext
* @returns {string}
*/
  toString(): string;
/**
* Decrypt the record ciphertext into plaintext using the view key. The record will only
* decrypt if the record was encrypted by the account corresponding to the view key
*
* @param {ViewKey} view_key View key used to decrypt the ciphertext
* @returns {RecordPlaintext | Error} Record plaintext object
* @param {ViewKey} view_key
* @returns {RecordPlaintext}
*/
  decrypt(view_key: ViewKey): RecordPlaintext;
/**
* Determines if the account corresponding to the view key is the owner of the record
*
* @param {ViewKey} view_key View key used to decrypt the ciphertext
* @returns {boolean}
* @param {ViewKey} view_key
* @returns {boolean}
*/
  isOwner(view_key: ViewKey): boolean;
}
/**
* Plaintext representation of an Aleo record
*/
export class RecordPlaintext {
  free(): void;
/**
* @param {string} program_id
* @param {string} record_name
* @returns {Field}
*/
  commitment(program_id: string, record_name: string): Field;
/**
* Return a record plaintext from a string.
*
* @param {string} record String representation of a plaintext representation of an Aleo record
* @returns {RecordPlaintext | Error} Record plaintext
* @param {string} record
* @returns {RecordPlaintext}
*/
  static fromString(record: string): RecordPlaintext;
/**
* Returns the record plaintext string
*
* @returns {string} String representation of the record plaintext
* @returns {string}
*/
  toString(): string;
/**
* Returns the amount of microcredits in the record
*
* @returns {u64} Amount of microcredits in the record
* @returns {bigint}
*/
  microcredits(): bigint;
/**
* Returns the nonce of the record. This can be used to uniquely identify a record.
*
* @returns {string} Nonce of the record
* @returns {string}
*/
  nonce(): string;
/**
* Attempt to get the serial number of a record to determine whether or not is has been spent
*
* @param {PrivateKey} private_key Private key of the account that owns the record
* @param {string} program_id Program ID of the program that the record is associated with
* @param {string} record_name Name of the record
* @returns {string | Error} Serial number of the record
* @param {PrivateKey} private_key
* @param {string} program_id
* @param {string} record_name
* @returns {string}
*/
  serialNumberString(private_key: PrivateKey, program_id: string, record_name: string): string;
}
/**
* Cryptographic signature of a message signed by an Aleo account
*/
export class Signature {
  free(): void;
/**
* Sign a message with a private key
*
* @param {PrivateKey} private_key The private key to sign the message with
* @param {Uint8Array} message Byte representation of the message to sign
* @returns {Signature} Signature of the message
* @param {PrivateKey} private_key
* @param {Uint8Array} message
* @returns {Signature}
*/
  static sign(private_key: PrivateKey, message: Uint8Array): Signature;
/**
* Verify a signature of a message with an address
*
* @param {Address} address The address to verify the signature with
* @param {Uint8Array} message Byte representation of the message to verify
* @returns {boolean} True if the signature is valid, false otherwise
* @param {Address} address
* @param {Uint8Array} message
* @returns {boolean}
*/
  verify(address: Address, message: Uint8Array): boolean;
/**
* Get a signature from a string representation of a signature
*
* @param {string} signature String representation of a signature
* @returns {Signature} Signature
* @param {string} signature
* @returns {Signature}
*/
  static from_string(signature: string): Signature;
/**
* Get a string representation of a signature
*
* @returns {string} String representation of a signature
* @returns {string}
*/
  to_string(): string;
}
/**
* Webassembly Representation of an Aleo transaction
*
* This object is created when generating an on-chain function deployment or execution and is the
* object that should be submitted to the Aleo Network in order to deploy or execute a function.
*/
export class Transaction {
  free(): void;
/**
* Create a transaction from a string
*
* @param {string} transaction String representation of a transaction
* @returns {Transaction | Error}
* @param {string} transaction
* @returns {Transaction}
*/
  static fromString(transaction: string): Transaction;
/**
* Get the transaction as a string. If you want to submit this transaction to the Aleo Network
* this function will create the string that should be submitted in the `POST` data.
*
* @returns {string} String representation of the transaction
* @returns {string}
*/
  toString(): string;
/**
* Get the id of the transaction. This is the merkle root of the transaction's inclusion proof.
*
* This value can be used to query the status of the transaction on the Aleo Network to see
* if it was successful. If successful, the transaction will be included in a block and this
* value can be used to lookup the transaction data on-chain.
*
* @returns {string} Transaction id
* @returns {string}
*/
  transactionId(): string;
/**
* Get the type of the transaction (will return "deploy" or "execute")
*
* @returns {string} Transaction type
* @returns {string}
*/
  transactionType(): string;
}
/**
* Verifying key for a function within an Aleo program
*/
export class VerifyingKey {
  free(): void;
/**
* Get the checksum of the verifying key
*
* @returns {string} Checksum of the verifying key
* @returns {string}
*/
  checksum(): string;
/**
* Create a copy of the verifying key
*
* @returns {VerifyingKey} A copy of the verifying key
* @returns {VerifyingKey}
*/
  copy(): VerifyingKey;
/**
* Construct a new verifying key from a byte array
*
* @param {Uint8Array} bytes Byte representation of a verifying key
* @returns {VerifyingKey | Error}
* @param {Uint8Array} bytes
* @returns {VerifyingKey}
*/
  static fromBytes(bytes: Uint8Array): VerifyingKey;
/**
* Create a verifying key from string
*
* @param {String} string String representation of a verifying key
* @returns {VerifyingKey | Error}
* @param {string} string
* @returns {VerifyingKey}
*/
  static fromString(string: string): VerifyingKey;
/**
* Create a byte array from a verifying key
*
* @returns {Uint8Array | Error} Byte representation of a verifying key
* @returns {Uint8Array}
*/
  toBytes(): Uint8Array;
/**
* Get a string representation of the verifying key
*
* @returns {String} String representation of the verifying key
* @returns {string}
*/
  toString(): string;
}
/**
*/
export class ViewKey {
  free(): void;
/**
* Create a new view key from a private key
*
* @param {PrivateKey} private_key Private key
* @returns {ViewKey} View key
* @param {PrivateKey} private_key
* @returns {ViewKey}
*/
  static from_private_key(private_key: PrivateKey): ViewKey;
/**
* Create a new view key from a string representation of a view key
*
* @param {string} view_key String representation of a view key
* @returns {ViewKey} View key
* @param {string} view_key
* @returns {ViewKey}
*/
  static from_string(view_key: string): ViewKey;
/**
* Get a string representation of a view key
*
* @returns {string} String representation of a view key
* @returns {string}
*/
  to_string(): string;
/**
* Get the address corresponding to a view key
*
* @returns {Address} Address
* @returns {Address}
*/
  to_address(): Address;
/**
* Decrypt a record ciphertext with a view key
*
* @param {string} ciphertext String representation of a record ciphertext
* @returns {string} String representation of a record plaintext
* @param {string} ciphertext
* @returns {string}
*/
  decrypt(ciphertext: string): string;
}
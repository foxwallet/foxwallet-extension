import { Block } from "../../types/AleoBlock";
import { Transaction } from "../../types/AleoTransaction";

async function get(url: URL | string) {
  try {
    const response = await fetch(url);
    return response;
  } catch (err) {
    throw new Error("network error: " + (err as Error).message);
  }
}

async function post(url: URL | string, options: RequestInit) {
  try {
    options.method = "POST";
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    throw new Error("network error: " + (err as Error).message);
  }
}

export class AleoRpc {
  host: string;
  chainId: string;

  constructor(host: string) {
    this.host = host;
    this.chainId = "testnet3";
  }

  /**
   * Set a new host for the networkClient
   *
   * @param {string} host The address of a node hosting the Aleo API
   * @param host
   */
  setHost(host: string) {
    this.host = host;
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  async fetchData<Type>(url = "/"): Promise<Type> {
    const response = await get(`${this.host}/${this.chainId}${url}`);
    if (!response.ok) {
      throw new Error(
        `get error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    return await response.json();
  }

  /**
   * Returns the contents of the block at the specified block height
   *
   * @param {number} height
   * @example
   * const block = networkClient.getBlock(1234);
   */
  async getBlock(height: number): Promise<Block> {
    const block = await this.fetchData<Block>("/block/" + height);
    return block;
  }

  /**
   * Returns a range of blocks between the specified block heights
   *
   * @param {number} start
   * @param {number} end
   * @example
   * const blockRange = networkClient.getBlockRange(2050, 2100);
   */
  async getBlockRange(start: number, end: number): Promise<Array<Block>> {
    return await this.fetchData<Array<Block>>(
      "/blocks?start=" + start + "&end=" + end,
    );
  }

  /**
   * Returns the contents of the latest block
   *
   * @example
   * const latestHeight = networkClient.getLatestBlock();
   */
  async getLatestBlock(): Promise<Block> {
    return (await this.fetchData<Block>("/latest/block")) as Block;
  }

  /**
   * Returns the hash of the last published block
   *
   * @example
   * const latestHash = networkClient.getLatestHash();
   */
  async getLatestHash(): Promise<string> {
    return await this.fetchData<string>("/latest/hash");
  }

  /**
   * Returns the latest block height
   *
   * @example
   * const latestHeight = networkClient.getLatestHeight();
   */
  async getLatestHeight(): Promise<number> {
    return await this.fetchData<number>("/latest/height");
  }

  /**
   * Returns the source code of a program given a program ID
   *
   * @param {string} programId The program ID of a program deployed to the Aleo Network
   * @return {Promise<string>} Source code of the program
   *
   * @example
   * const program = networkClient.getProgram("hello_hello.aleo");
   * const expectedSource = "program hello_hello.aleo;\n\nfunction hello:\n    input r0 as u32.public;\n    input r1 as u32.private;\n    add r0 r1 into r2;\n    output r2 as u32.private;\n"
   * assert.equal(program, expectedSource);
   */
  async getProgram(programId: string): Promise<string> {
    return await this.fetchData<string>("/program/" + programId);
  }

  /**
   * Returns the names of the mappings of a program
   *
   * @param {string} programId - The program ID to get the mappings of (e.g. "credits.aleo")
   * @example
   * const mappings = networkClient.getProgramMappingNames("credits.aleo");
   * const expectedMappings = ["account"];
   * assert.deepStrictEqual(mappings, expectedMappings);
   */
  async getProgramMappingNames(programId: string): Promise<Array<string>> {
    return await this.fetchData<Array<string>>(
      "/program/" + programId + "/mappings",
    );
  }

  /**
   * Returns the value of a program's mapping for a specific key
   *
   * @param {string} programId - The program ID to get the mapping value of (e.g. "credits.aleo")
   * @param {string} mappingName - The name of the mapping to get the value of (e.g. "account")
   * @param {string} key - The key of the mapping to get the value of (e.g. "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px")
   * @return {Promise<string>} String representation of the value of the mapping
   *
   * @example
   * // Get public balance of an account
   * const mappingValue = networkClient.getMappingValue("credits.aleo", "account", "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px");
   * const expectedValue = "0u64";
   * assert.equal(mappingValue, expectedValue);
   */
  async getProgramMappingValue(
    programId: string,
    mappingName: string,
    key: string,
  ): Promise<string> {
    return await this.fetchData<string>(
      "/program/" + programId + "/mapping/" + mappingName + "/" + key,
    );
  }

  /**
   * Returns the latest state/merkle root of the Aleo blockchain
   *
   * @example
   * const stateRoot = networkClient.getStateRoot();
   */
  async getStateRoot(): Promise<string> {
    return await this.fetchData<string>("/latest/stateRoot");
  }

  /**
   * Returns a transaction by its unique identifier
   *
   * @param {string} id
   * @example
   * const transaction = networkClient.getTransaction("at1handz9xjrqeynjrr0xay4pcsgtnczdksz3e584vfsgaz0dh0lyxq43a4wj");
   */
  async getTransaction(id: string): Promise<Transaction> {
    return await this.fetchData<Transaction>("/transaction/" + id);
  }

  /**
   * Returns the transactions present at the specified block height
   *
   * @param {number} height
   * @example
   * const transactions = networkClient.getTransactions(654);
   */
  async getTransactions(height: number): Promise<Array<Transaction>> {
    return await this.fetchData<Array<Transaction>>(
      "/block/" + height.toString() + "/transactions",
    );
  }

  /**
   * Returns the transactions in the memory pool.
   *
   * @example
   * const transactions = networkClient.getTransactionsInMempool();
   */
  async getTransactionsInMempool(): Promise<Array<Transaction>> {
    return await this.fetchData<Array<Transaction>>("/memoryPool/transactions");
  }

  /**
   * Returns the transition id by its unique identifier
   * @param {string} transition_id - The transition id to get
   *
   * @example
   * const transition = networkClient.getTransitionId("2429232855236830926144356377868449890830704336664550203176918782554219952323field");
   */
  async getTransitionId(transition_id: string): Promise<string> {
    return await this.fetchData<string>("/find/transitionID/" + transition_id);
  }

  /**
   * Submit an execute or deployment transaction to the Aleo network
   *
   * @param {WasmTransaction | string} transaction  - The transaction to submit to the network
   * @returns {string | Error} - The transaction id of the submitted transaction or the resulting error
   */
  async submitTransaction(transaction: any): Promise<string> {
    const url = `${this.host}/${this.chainId}/transaction/broadcast`;
    try {
      const transaction_string = transaction.toString();
      const response = await post(url, {
        body: transaction_string,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `post error: submitTransaction statusCode ${response.status} body ${response.body}`,
        );
      }

      return await response.json();
    } catch (err) {
      throw new Error(`${(err as Error).message}  url: ${url}`);
    }
  }
}

import { get } from "@/common/utils/request";

export const PROVABLE_EXPLORER_API = "https://api.provable.com";
const PROVABLE_API = `${PROVABLE_EXPLORER_API}/v2`;

export class ProvableApi {
  private readonly baseURL: string;

  constructor(baseURL: string = PROVABLE_API) {
    this.baseURL = baseURL;
  }

  async getProgramMappingValue(params: {
    network: string;
    programId: string;
    mappingName: string;
    key: string;
  }): Promise<string | null> {
    const { network, programId, mappingName, key } = params;
    const url = `${this.baseURL}/${network}/program/${programId}/mapping/${mappingName}/${key}`;
    const response = await get(url);
    if (!response.ok) {
      throw new Error(
        `ProvableApi getProgramMappingValue error: url ${url} statusCode ${
          response.status
        } body ${await response.text()}`,
      );
    }
    const value = await response.json();
    if (value === null || value === "null") {
      return null;
    }
    return value as string;
  }

  async getPublicBalance(
    network: string,
    address: string,
  ): Promise<string | null> {
    return await this.getProgramMappingValue({
      network,
      programId: "credits.aleo",
      mappingName: "account",
      key: address,
    });
  }
}

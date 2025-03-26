import { walletApiRequest } from "@/common/utils/request";
import { type NameTagItem } from "@/store/addressModel";
import { MemoizeExpiring } from "typescript-memoize";

class AddressApi {
  @MemoizeExpiring(30 * 60 * 1000)
  async getNameTag(address: string): Promise<NameTagItem> {
    const res = await walletApiRequest.get(
      `https://wallet.foxnb.net/api/v1/addr/name_tag`,
      {
        params: { addr: address },
      },
    );
    return res.data;
  }
}
export const addressApi = new AddressApi();

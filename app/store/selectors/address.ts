import { createSelector } from "reselect";
import { type RootState } from "@/store/store";
import { fallbackToEmptyArray } from "@/store/selectors/utils";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { CoinType } from "core/types";
import { isSameAddress } from "core/utils/address";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";

const createAppSelector = createSelector.withTypes<RootState>();

export const addressBookSelector = (state: RootState) =>
  fallbackToEmptyArray(state.address.addressBookV2);

/**
 * @returns AddressItemWithType[] 某条链下已添加过的所有地址簿
 */
export const getChainAddressBooksSelector = createAppSelector(
  [
    addressBookSelector,
    (_state, { uniqueId }: { uniqueId?: ChainUniqueId }) => uniqueId,
  ],
  (addressBookList, uniqueId) => {
    if (!uniqueId) return [...addressBookList];

    const coinType = chainUniqueIdToCoinType(uniqueId);
    return addressBookList.filter((item) => {
      // 可能选择了支持所有EVM，这里优先判断，后续新增链后就不用再处理
      return (
        (coinType === CoinType.ETH && item.isShowInAllEVM) ||
        item.uniqueIds.includes(uniqueId)
      );
    });
  },
);

export const hasDupAddressSelector = createAppSelector(
  [
    getChainAddressBooksSelector,
    (_state, { address }: { address: string }) => address,
  ],
  (addressBook, address) => {
    return addressBook.some((addressItem) => {
      return isSameAddress(addressItem.address, address);
    });
  },
);

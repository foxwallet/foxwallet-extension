import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { createModel } from "@rematch/core";
import { type RootModel } from "@/store/index";
import { isSameAddress } from "core/utils/address";
import { addressApi } from "@/services/api/address";
import { nanoid } from "nanoid";

export type AddressItemV2 = {
  id: string;
  addressName: string;
  address: string;
  uniqueIds: ChainUniqueId[];
  isShowInAllEVM: boolean;
};

export type NameTagItem = {
  name_tag: string;
  addr: string;
  warning: boolean;
};

export type AddressBookV2 = AddressItemV2[];

type NameTags = {
  [address: string]: NameTagItem;
};

export const address = createModel<RootModel>()({
  name: "address",
  state: {
    addressBookV2: [] as AddressBookV2 | undefined,
    nameTags: {} as NameTags,
  },
  reducers: {
    setNameTag(state, payload: { item: NameTagItem }) {
      const { item } = payload;
      return {
        ...state,
        nameTags: {
          ...state.nameTags,
          [item.addr]: item,
        },
      };
    },
    _clearNameTag(state) {
      return {
        ...state,
        nameTags: {} as NameTags,
      };
    },
    addAddress(state, payload: { addressItem: Omit<AddressItemV2, "id"> }) {
      const { addressItem } = payload;
      const addressBook = state.addressBookV2 ?? [];
      if (
        !addressItem.addressName ||
        !addressItem.address ||
        addressItem.uniqueIds.length === 0
      ) {
        console.error("Wrong addressItem ", addressItem);
        return state;
      }
      const exist = addressBook.some((item) =>
        isSameAddress(item.address, addressItem.address),
      );
      if (exist) {
        console.error("addressItem exist ", addressItem);
        return state;
      }
      const id = nanoid();
      return {
        ...state,
        addressBookV2: [
          ...addressBook,
          {
            ...addressItem,
            id,
          },
        ],
      };
    },
    editAddress(
      state,
      payload: {
        id: string;
        newAddressItem: Omit<AddressItemV2, "id">;
      },
    ) {
      const addressBook = state.addressBookV2 ?? [];
      const { id, newAddressItem } = payload;

      const list = addressBook.map((item) => {
        if (item.id === id) {
          return { ...newAddressItem, id };
        } else {
          return item;
        }
      });

      return {
        ...state,
        addressBookV2: [...list],
      };
    },
    removeAddress(state, payload: { id: string }) {
      const { id } = payload;
      const addressBook = state.addressBookV2 ?? [];
      const list = addressBook.filter((item: AddressItemV2) => {
        return item.id !== id;
      });

      return {
        ...state,
        addressBookV2: [...list],
      };
    },
  },
  effects: (dispatch) => ({
    async fetchNameTag(queryAddress: string) {
      const nameTagItem = await addressApi.getNameTag(queryAddress);
      dispatch.address.setNameTag({ item: nameTagItem });
    },
  }),
});

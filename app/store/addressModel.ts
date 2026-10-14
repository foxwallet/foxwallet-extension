import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isSameAddress } from "core/utils/address";
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

export const address = createSlice({
  name: "address",
  initialState: {
    addressBookV2: [] as AddressBookV2 | undefined,
    nameTags: {} as NameTags,
  },
  reducers: {
    _resetNameTags(state) {
      return { ...state, nameTags: {} };
    },
    setNameTag(state, action: PayloadAction<{ item: NameTagItem }>) {
      const payload = action.payload;
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
    addAddress: {
      prepare(payload: { addressItem: Omit<AddressItemV2, "id"> }) {
        return { payload, meta: { id: nanoid() } };
      },
      reducer(
        state,
        action: PayloadAction<
          { addressItem: Omit<AddressItemV2, "id"> },
          string,
          { id: string }
        >,
      ) {
        const payload = action.payload;
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
        const id = action.meta.id;
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
    },
    editAddress(
      state,
      action: PayloadAction<{
        id: string;
        newAddressItem: Omit<AddressItemV2, "id">;
      }>,
    ) {
      const payload = action.payload;
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
    removeAddress(state, action: PayloadAction<{ id: string }>) {
      const payload = action.payload;
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
});

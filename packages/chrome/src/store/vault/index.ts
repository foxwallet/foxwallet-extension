import { createModel } from "@rematch/core";
import { type RootModel } from "../index";
import { Cipher, Vault } from "../../common/types/keyring";

export const vault = createModel<RootModel>()({
  name: "vault",
  state: {} as Vault,
  reducers: {
    initCipher(state, payload: { cipher: Cipher }) {
      const { cipher } = payload;
      return {
        ...state,
        cipher,
      };
    },
  },
  effects: (dispatch) => ({}),
});

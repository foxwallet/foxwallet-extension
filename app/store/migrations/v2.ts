import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { RootState } from "../store";

export const migrationV2 = (state: RootState): RootState => {
  try {
    console.log("migrationV2 start....");
    const account = state.account || {};

    return {
      ...state,
      account: {
        ...account,
        selectedUniqueId: InnerChainUniqueId.ALEO_MAINNET,
      },
    };
  } catch (err) {
    console.log(err);
    return state;
  }
};

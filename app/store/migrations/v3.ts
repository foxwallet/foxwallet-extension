import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type RootState } from "../store";

export const migrationV3 = (state: RootState): RootState => {
  try {
    console.log("migrationV3 start....");
    const account = state.account;

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

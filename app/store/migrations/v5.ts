import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type RootState } from "../store";
import { AssetType, type TokenV2 } from "core/types/Token";

export const migrationV5 = (state: RootState): RootState => {
  try {
    console.log("migrationV5 start....");
    const tokens = state.tokens ?? {};
    const { userTokens, hasInitTokensByInteractiveTokens } = tokens;

    const newUserTokens = Object.entries(userTokens).map(
      ([uniqueId, tokenMap]) => {
        if (tokenMap) {
          const newTokenMap = Object.entries(tokenMap).map(
            ([address, tokens]) => {
              if (tokens) {
                const newTokens: TokenV2[] = tokens.map((item) => {
                  const {
                    tokenId,
                    name,
                    symbol,
                    decimals,
                    logo,
                    official,
                    programId,
                  } = item;
                  return {
                    symbol,
                    decimals,
                    name,
                    type: AssetType.TOKEN,
                    uniqueId: InnerChainUniqueId.ALEO_MAINNET,
                    icon: logo,
                    official,
                    programId,
                    tokenId,
                    ownerAddress: address,
                    contractAddress: "",
                  };
                });
                return { [address]: newTokens };
              }
              return {};
            },
          );
          return { [uniqueId]: newTokenMap };
        }
        return {};
      },
    );

    return {
      ...state,
      userTokens: newUserTokens,
      hasInitTokensByInteractiveTokens,
    };
  } catch (err) {
    console.log(err);
    return state;
  }
};

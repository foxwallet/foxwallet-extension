import { Flex, Image, TabPanel, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { useAssetList } from "@/hooks/useAssetList";
import { Token } from "core/coins/ALEO/types/Token";
import { TokenItemWithBalance } from "../TokenItem";
import { serializeToken } from "@/common/utils/string";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";

export const AssetList = () => {
  const navigate = useNavigate();
  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChainUniqueIds } = useChainMode();
  const uniqueId = availableChainUniqueIds[0];
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [uniqueId, getMatchAccountsWithUniqueId]);

  const { assets } = useAssetList(uniqueId, selectedAccount.account.address);

  const onTokenDetail = useCallback(
    (token: Token) => {
      // need to be modified when adapt for multi-chain
      navigate(
        `/token_detail/${uniqueId}/${
          selectedAccount.account.address
        }?token=${serializeToken(token)}`,
      );
    },
    [navigate, uniqueId, selectedAccount],
  );

  return (
    <TabPanel
      flex={1}
      flexDir={"column"}
      overflowY={"auto"}
      marginBottom={"60px"}
    >
      {assets.map((token) => (
        <TokenItemWithBalance
          key={token.tokenId}
          uniqueId={uniqueId}
          address={selectedAccount.account.address}
          token={token}
          onClick={onTokenDetail}
          hover
        />
      ))}
    </TabPanel>
  );
};

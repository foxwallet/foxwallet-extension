import { Flex, Image, TabPanel, Text } from "@chakra-ui/react";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useAssetList } from "@/hooks/useAssetList";
import { Token } from "core/coins/ALEO/types/Token";
import { TokenItemWithBalance } from "../TokenItem";
import { serializeToken } from "@/common/utils/string";

export const AssetList = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { assets } = useAssetList(uniqueId, selectedAccount.address);

  const onTokenDetail = useCallback(
    (token: Token) => {
      // need to be modified when adapt for multi-chain
      navigate(
        `/token_detail/${uniqueId}/${
          selectedAccount.address
        }?token=${serializeToken(token)}`,
      );
    },
    [navigate, uniqueId, selectedAccount],
  );

  return (
    <TabPanel>
      <Flex direction={"column"} maxH={"238px"} overflowY={"auto"} mt={2}>
        {assets.map((token) => (
          <TokenItemWithBalance
            key={token.tokenId}
            uniqueId={uniqueId}
            address={selectedAccount.address}
            token={token}
            onClick={onTokenDetail}
            hover
          />
        ))}
      </Flex>
    </TabPanel>
  );
};

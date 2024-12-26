import { Flex, Image, TabPanel, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { TokenItemWithBalance } from "../TokenItem";
import { serializeToken } from "@/common/utils/string";
import { type TokenV2 } from "core/types/Token";
import { useGroupAccountAssets } from "@/hooks/useGroupAccountAssets";

export const AssetList = () => {
  const navigate = useNavigate();

  const { assets: groupAssets } = useGroupAccountAssets();
  // console.log("      group assets", { ...groupAssets });

  const onTokenDetail = useCallback(
    (token: TokenV2) => {
      navigate(
        `/token_detail/${token.uniqueId}/${
          token.ownerAddress
        }?token=${serializeToken(token)}`,
      );
    },
    [navigate],
  );

  return (
    <TabPanel
      flex={1}
      flexDir={"column"}
      overflowY={"auto"}
      marginBottom={"60px"}
    >
      {groupAssets.map((token) => (
        <TokenItemWithBalance
          key={`${token.contractAddress}-${token.symbol}-${token.type}-${token.uniqueId}`}
          uniqueId={token.uniqueId}
          address={token.ownerAddress}
          token={token}
          onClick={onTokenDetail}
          hover
        />
      ))}
    </TabPanel>
  );
};

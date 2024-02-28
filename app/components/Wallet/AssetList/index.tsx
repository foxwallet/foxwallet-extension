import { Flex, Image, TabPanel, Text } from "@chakra-ui/react";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useAssetList } from "@/hooks/useAssetList";
import { Token } from "core/coins/ALEO/types/Token";
import { TokenItemWithBalance } from "../TokenItem";

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
        }?token=${JSON.stringify(token)}`,
      );
    },
    [navigate, uniqueId, selectedAccount],
  );

  return (
    <TabPanel>
      {/* <Hover variant="cell" onClick={onTokenDetail}>
        <Flex
          w={"100%"}
          py={3}
          px={5}
          align={"center"}
          justify={"space-between"}
        >
          <Flex align={"center"}>
            <IconAleo />
            <Text ml={2.5} fontSize={13} fontWeight={600}>
              {nativeCurrency.symbol}
            </Text>
          </Flex>
          {showBalance ? (
            <TokenNum
              amount={balance?.total}
              decimals={nativeCurrency.decimals}
              symbol={""}
            />
          ) : (
            <Text>*****</Text>
          )}
        </Flex>
      </Hover> */}
      <Flex direction={"column"} maxH={"250px"} overflowY={"auto"} mt={2}>
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

import { IconAleo } from "@/components/Custom/Icon";
import { Flex, Image, TabPanel, Text } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import Hover from "@/components/Custom/Hover";
import { useAssetList } from "@/hooks/useAssetList";
import { Token } from "core/coins/ALEO/types/Token";
import { ChainUniqueId } from "core/types/ChainUniqueId";

export const TokenItem = ({
  uniqueId,
  address,
  token,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  token: Token;
}) => {
  const navigate = useNavigate();
  const showBalance = usePopupSelector((state) => state.account.showBalance);
  const { balance } = useBalance({
    uniqueId,
    address,
    tokenId: token.tokenId,
    refreshInterval: 4000,
  });

  const onTokenDetail = useCallback(() => {
    // need to be modified when adapt for multi-chain
    navigate(
      `/token_detail/${uniqueId}/${address}?token=${JSON.stringify(token)}`,
    );
  }, [navigate, uniqueId]);

  return (
    <Hover variant="cell" onClick={onTokenDetail}>
      <Flex w={"100%"} py={3} px={5} align={"center"} justify={"space-between"}>
        <Flex align={"center"}>
          <Image src={token.logo} w={6} h={6} borderRadius={12} />
          <Text ml={2.5} fontSize={13} fontWeight={600}>
            {token.symbol}
          </Text>
        </Flex>
        {showBalance ? (
          <TokenNum
            amount={balance?.total}
            decimals={token.decimals}
            symbol={""}
          />
        ) : (
          <Text>*****</Text>
        )}
      </Flex>
    </Hover>
  );
};

export const AssetList = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { assets } = useAssetList(uniqueId, selectedAccount.address);
  const { balance } = useBalance({
    uniqueId,
    address: selectedAccount.address,
    refreshInterval: 4000,
  });
  const showBalance = usePopupSelector((state) => state.account.showBalance);

  const onTokenDetail = useCallback(() => {
    // need to be modified when adapt for multi-chain
    navigate(`/token_detail/${uniqueId}`);
  }, [navigate, uniqueId]);

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
      <Flex direction={"column"} maxH={"250px"} overflowY={"auto"}>
        {assets.map((token) => (
          <TokenItem
            key={token.tokenId}
            uniqueId={uniqueId}
            address={selectedAccount.address}
            token={token}
          />
        ))}
      </Flex>
    </TabPanel>
  );
};

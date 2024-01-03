import { IconAleo } from "@/components/Custom/Icon";
import { Flex, TabPanel, Text } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { usePopupSelector } from "@/hooks/useStore";

export const AssetList = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance } = useBalance(uniqueId, selectedAccount.address, 4000);
  const showBalance = usePopupSelector((state) => state.account.showBalance);

  const onTokenDetail = useCallback(() => {
    // need to be modified when adapt for multi-chain
    navigate(`/token_detail/${uniqueId}`);
  }, [navigate, uniqueId]);

  return (
    <TabPanel>
      <Flex
        w={"100%"}
        as="button"
        py={3}
        px={5}
        align={"center"}
        justify={"space-between"}
        _hover={{ background: "#F5F5F5" }}
        onClick={onTokenDetail}
      >
        <Flex align={"center"}>
          <IconAleo />
          <Text ml={2.5} fontSize={13} fontWeight={600}>
            {nativeCurrency.symbol}
          </Text>
        </Flex>
        {showBalance ? (
          <TokenNum
            amount={balance?.total || 0n}
            decimals={nativeCurrency.decimals}
            symbol={""}
          />
        ) : (
          <Text>*****</Text>
        )}
      </Flex>
    </TabPanel>
  );
};

import { IconAleo } from "@/components/Custom/Icon";
import { Flex, TabPanel, Text } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";

export const AssetList = () => {
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance } = useBalance(uniqueId, selectedAccount.address, 4000);

  return (
    <TabPanel>
      <Flex
        w={"100%"}
        as="button"
        py={2}
        align={"center"}
        justify={"space-between"}
      >
        <Flex align={"center"}>
          <IconAleo />
          <Text ml={2.5} fontSize={13} fontWeight={600}>
            {nativeCurrency.symbol}
          </Text>
        </Flex>
        <TokenNum
          amount={balance?.total || 0n}
          decimals={nativeCurrency.decimals}
          symbol={""}
        />
      </Flex>
    </TabPanel>
  );
};

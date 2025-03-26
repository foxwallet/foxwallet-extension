import { PageWithHeader } from "@/layouts/Page";
import { Content } from "@/layouts/Content";
import { VStack, Text, Flex, Image } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useAllChainList } from "@/hooks/useChainList";
import { type CoinType } from "core/types";
import { DEFAULT_CHAIN_UNIQUE_ID } from "core/constants/chain";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconCheckboxSelected } from "@/components/Custom/Icon";
import { timeout } from "@/common/utils/timeout";

const ChangeCoinTypeScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currCoinType: paramCoinType } = useParams();
  const [currCoinType, setCurrCoinType] = useState(paramCoinType);
  const allChains = useAllChainList();

  const supportedChains = useMemo(() => {
    const coinTypes: CoinType[] = [];
    allChains.forEach((item) => {
      if (!coinTypes.includes(item.coinType)) {
        coinTypes.push(item.coinType);
      }
    });
    const uniqueIds = coinTypes.map((item) => DEFAULT_CHAIN_UNIQUE_ID[item]);
    return allChains.filter((item) => uniqueIds.includes(item.uniqueId));
  }, [allChains]);

  return (
    <PageWithHeader title={t("PrivateKey:selectCoinType")}>
      <Content>
        <VStack spacing={"10px"}>
          {supportedChains.map((item) => {
            const isSelected = item.coinType === currCoinType;
            return (
              <Flex
                cursor={"pointer"}
                justifyContent="space-between"
                alignItems="center"
                w={"full"}
                h={"44px"}
                pl={2}
                onClick={async () => {
                  setCurrCoinType(item.coinType);
                  sessionStorage.setItem("chooseNewCoinType", item.coinType);
                  await timeout(50);
                  navigate(-1);
                }}
                key={item.uniqueId}
              >
                <Flex justify={"center"} alignItems="center">
                  <Image
                    src={item.logo}
                    w={"24px"}
                    h={"24px"}
                    borderRadius={"50px"}
                  />
                  <Text pl={2}>{item.nativeCurrency.symbol}</Text>
                </Flex>
                {isSelected && <IconCheckboxSelected w={4} h={4} mr={2} />}
              </Flex>
            );
          })}
        </VStack>
      </Content>
    </PageWithHeader>
  );
};

export default ChangeCoinTypeScreen;

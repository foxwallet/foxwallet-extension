import React from "react";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
} from "core/types/ChainUniqueId";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import { useTranslation } from "react-i18next";
import { Flex, Image, Text } from "@chakra-ui/react";
import {
  IconAllNetworks,
  IconCheckboxSelected,
} from "@/components/Custom/Icon";
import { type ChainDisplayData } from "@/components/Wallet/ChangeNetworkDrawer";

export const NetworkItem = ({
  item,
  isSelected,
  onSelectTab,
}: {
  item: ChainDisplayData;
  isSelected: boolean;
  onSelectTab: (displayMode: ChainDisplayMode) => void;
}) => {
  const language = getCurrLanguage();
  const { t } = useTranslation();

  if (item.mode === ChainAssembleMode.ALL) {
    return (
      <Flex
        cursor={"pointer"}
        justifyContent="space-between"
        alignItems="center"
        w={"full"}
        h={"44px"}
        pl={2}
        onClick={() => {
          onSelectTab({ mode: ChainAssembleMode.ALL });
        }}
      >
        <Flex justify={"center"} alignItems="center">
          <IconAllNetworks w={"24px"} h={"24px"} borderRadius={"50px"} />
          <Text pl={2}>{t("Wallet:allNetworks")}</Text>
        </Flex>
        {isSelected && <IconCheckboxSelected w={4} h={4} mr={2} />}
      </Flex>
    );
  } else {
    const remark =
      item.chainRemark?.[language] ?? item.chainRemark?.[SupportLanguages.EN];
    const chainName = remark ? `${item.chainName} - ${remark}` : item.chainName;
    return (
      <Flex
        cursor={"pointer"}
        justifyContent="space-between"
        alignItems="center"
        w={"full"}
        h={"44px"}
        pl={2}
        onClick={() => {
          onSelectTab({
            mode: ChainAssembleMode.SINGLE,
            uniqueId: item.uniqueId,
          });
        }}
      >
        <Flex justify={"center"} alignItems="center">
          <Image src={item.logo} w={"24px"} h={"24px"} borderRadius={"50px"} />
          <Text pl={2}>{chainName}</Text>
        </Flex>
        {isSelected && <IconCheckboxSelected w={4} h={4} mr={2} />}
      </Flex>
    );
  }
};

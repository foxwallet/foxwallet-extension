import React, { useCallback } from "react";
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
  onSelectNetwork,
}: {
  item: ChainDisplayData;
  isSelected: boolean;
  onSelectNetwork: (data: ChainDisplayMode) => void;
}) => {
  const language = getCurrLanguage();
  const { t } = useTranslation();

  let chainName: string;
  if (item.mode === ChainAssembleMode.SINGLE) {
    const remark =
      item.chainRemark?.[language] ?? item.chainRemark?.[SupportLanguages.EN];
    chainName = remark ? `${item.chainName} - ${remark}` : item.chainName;
  } else {
    chainName = t("Wallet:allNetworks");
  }

  const onSelect = useCallback(() => {
    onSelectNetwork(
      item.mode === ChainAssembleMode.ALL
        ? { mode: ChainAssembleMode.ALL }
        : { mode: ChainAssembleMode.SINGLE, uniqueId: item.uniqueId },
    );
  }, [item, onSelectNetwork]);

  return (
    <Flex
      cursor={"pointer"}
      justifyContent="space-between"
      alignItems="center"
      w={"full"}
      h={"44px"}
      pl={2}
      onClick={onSelect}
    >
      <Flex justify={"center"} alignItems="center">
        {item.mode === ChainAssembleMode.ALL ? (
          <IconAllNetworks w={"24px"} h={"24px"} borderRadius={"50px"} />
        ) : (
          <Image src={item.logo} w={"24px"} h={"24px"} borderRadius={"50px"} />
        )}
        <Text pl={2}>{chainName}</Text>
      </Flex>
      {isSelected && <IconCheckboxSelected w={4} h={4} mr={2} />}
    </Flex>
  );
};

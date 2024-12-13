import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import {
  IconCheckboxSelected,
  IconCheckboxUnselected,
  IconEmptyTxPlaceholder,
  IconInfo,
  IconSearch,
} from "@/components/Custom/Icon";
import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { EmptyView } from "@/components/Custom/EmptyView";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { getChainConfigsByFilter } from "@/hooks/useGroupAccount";
import { isEqual } from "lodash";
import { currSelectedChainsSelector } from "@/store/selectors/account";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";

export type NetworkListItemProps = {
  item: ChainBaseConfig;
  isSelected: boolean;
  onPressItem: (item: ChainBaseConfig, isSelected: boolean) => void;
};

export const NetworkListItem = (props: NetworkListItemProps) => {
  const { item, isSelected, onPressItem } = props;
  const titleColor = useColorModeValue("black", "white");
  const language = getCurrLanguage();

  const remark =
    item.chainRemark?.[language] ?? item.chainRemark?.[SupportLanguages.EN];
  const chainName = remark ? `${item.chainName} - ${remark}` : item.chainName;

  const onSelect = useCallback(() => {}, []);

  const onInfo = useCallback(() => {}, []);

  return (
    <Flex
      alignItems={"center"}
      justify={"space-between"}
      // bg={"aqua"}
      w={"full"}
      minH={"44px"}
    >
      <Flex
        cursor={"pointer"}
        justify={"start"}
        alignItems={"center"}
        // bg={"yellow"}
        h={"full"}
        w={"full"}
        onClick={onSelect}
      >
        {isSelected ? (
          <IconCheckboxSelected ml={1} />
        ) : (
          <IconCheckboxUnselected ml={1} />
        )}
        <Image
          src={item.logo}
          w={"24px"}
          h={"24px"}
          borderRadius={"50px"}
          ml={2}
        />
        <Text ml={2} fontSize={13} color={titleColor} align={"start"}>
          {chainName}
        </Text>
      </Flex>
      <Flex
        cursor={"pointer"}
        // bg={"red"}
        mr={1}
        w={8}
        h={"full"}
        justify={"center"}
        alignItems={"center"}
        onClick={onInfo}
      >
        <IconInfo />
      </Flex>
    </Flex>
  );
};

const NetworksScreen = () => {
  const { t } = useTranslation();
  const [searchStr, setSearchStr] = useState("");
  const [debounceAddress] = useDebounce(searchStr, 500);
  const titleColor = useColorModeValue("black", "white");

  const searchRes: ChainBaseConfig[] = [];

  const chainConfigs = useSelector((state: RootState) => {
    return getChainConfigsByFilter({
      state,
      filter: (_item) => {
        return true;
      },
    });
  }, isEqual);

  const selectedUniqueIds = useSelector((state: RootState) => {
    return currSelectedChainsSelector(state);
  }, isEqual);
  console.log("      selectedUniqueIds");
  console.log({ ...selectedUniqueIds });

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const dataList = useMemo(() => {
    return debounceAddress ? searchRes : chainConfigs;
  }, [chainConfigs, debounceAddress, searchRes]);

  const showEmpty = useMemo(() => {
    return debounceAddress && searchRes.length === 0;
  }, [debounceAddress, searchRes.length]);

  const renderNetworkItem = useCallback(
    (item: ChainBaseConfig) => {
      const isSelected = !!selectedUniqueIds?.some(
        (id) => id === item.uniqueId,
      );
      return (
        <NetworkListItem
          item={item}
          isSelected={isSelected}
          onPressItem={(item, isSelected) => {}}
        />
      );
    },
    [selectedUniqueIds],
  );

  return (
    <PageWithHeader title={t("Networks:title")}>
      <InputGroup flexDir={"column"} px={5} position={"relative"}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchStr}
          onChange={onInputChange}
          placeholder={t("Networks:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      <Content>
        {showEmpty ? (
          <EmptyView searching={false} text={t("Common:noSearchResult")} />
        ) : (
          <Box overflowY="auto" maxHeight={"calc(100vh - 120px)"}>
            <VStack spacing={"10px"}>
              {dataList.map((item) => {
                return renderNetworkItem(item);
              })}
            </VStack>
          </Box>
        )}
      </Content>
    </PageWithHeader>
  );
};

export default NetworksScreen;

import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import {
  Button,
  Flex,
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

const NetworksScreen = () => {
  const { t } = useTranslation();
  const [searchStr, setSearchStr] = useState("");
  const [debounceAddress] = useDebounce(searchStr, 500);
  const titleColor = useColorModeValue("black", "white");

  const chainConfig: ChainBaseConfig[] = []; // all networks
  const searchRes = [1, 2, 3];

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const dataList = useMemo(() => {
    return debounceAddress ? searchRes : chainConfig;
  }, [chainConfig, debounceAddress, searchRes]);

  const showEmpty = useMemo(() => {
    return debounceAddress && searchRes.length === 0;
  }, [debounceAddress, searchRes.length]);

  const renderNetworkItem = useCallback(() => {
    return (
      <Flex
        alignItems={"center"}
        justify={"space-between"}
        bg={"aqua"}
        w={"full"}
        minH={"44px"}
      >
        <Flex>
          <IconCheckboxUnselected ml={1} />
          <Text
            ml={2}
            fontSize={13}
            fontWeight={"bold"}
            color={titleColor}
            align={"start"}
          >
            3332
          </Text>
        </Flex>
        <IconInfo mr={1} />
      </Flex>
    );
  }, [titleColor]);

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
          <VStack spacing={3}>{dataList.map(renderNetworkItem)}</VStack>
        )}
      </Content>
    </PageWithHeader>
  );
};

export default NetworksScreen;

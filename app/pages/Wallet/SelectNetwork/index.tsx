import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  Image,
} from "@chakra-ui/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconSearch } from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import { ChainAssembleMode } from "core/types/ChainUniqueId";
import { useUserSelectedChains } from "@/hooks/useUserSelectedChains";
import { type SingleChainDisplayData } from "@/components/Wallet/ChangeNetworkDrawer";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchNetworks } from "@/hooks/useSearchNetworks";

export enum NextAction {
  Receive = "receive",
  Send = "send",
}

type NetworkItemProps = {
  config: SingleChainDisplayData;
  onSelect: (item: SingleChainDisplayData) => void;
};

const NetworkItem = (prop: NetworkItemProps) => {
  const { config, onSelect } = prop;
  const language = getCurrLanguage();

  const remark =
    config.chainRemark?.[language] ?? config.chainRemark?.[SupportLanguages.EN];
  const chainName = remark
    ? `${config.chainName} - ${remark}`
    : config.chainName;

  return (
    <Flex
      cursor={"pointer"}
      w={"full"}
      justify={"start"}
      alignItems={"center"}
      minH={"44px"}
      onClick={() => {
        onSelect(config);
      }}
    >
      <Flex justify={"start"} alignItems={"center"} h={"full"} w={"full"}>
        <Image
          src={config.logo}
          w={"24px"}
          h={"24px"}
          borderRadius={"50px"}
          ml={2}
        />
        <Text ml={2} fontSize={13} align={"start"}>
          {chainName}
        </Text>
      </Flex>
    </Flex>
  );
};

const SelectNetworkScreen = () => {
  const { action = NextAction.Receive } = useParams<{
    action: NextAction;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedChains } = useUserSelectedChains();
  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const displaySingleList = useMemo(() => {
    return selectedChains.filter(
      (i) => i.mode === ChainAssembleMode.SINGLE,
    ) as SingleChainDisplayData[];
  }, [selectedChains]);

  const { searchRes, searching: loading } = useSearchNetworks(
    searchStr,
    displaySingleList,
  );

  const displayList = useMemo(() => {
    return debounceSearchStr ? searchRes : displaySingleList;
  }, [debounceSearchStr, displaySingleList, searchRes]);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const onSelect = useCallback(
    (item: SingleChainDisplayData) => {
      navigate(`/select_token_v2/${item.uniqueId}/${action}`);
    },
    [action, navigate],
  );

  const renderNetworks = useMemo(() => {
    return (
      <Box overflowY="auto">
        <VStack spacing={"10px"}>
          {displayList.map((i, index) => {
            const key = i.uniqueId;
            return <NetworkItem config={i} onSelect={onSelect} key={key} />;
          })}
        </VStack>
      </Box>
    );
  }, [displayList, onSelect]);

  return (
    <PageWithHeader title={t("Networks:selectNetwork")}>
      <InputGroup flexDir={"column"} px={5} position={"relative"}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchStr}
          onChange={onKeywordChange}
          placeholder={t("Networks:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      <Content>{renderNetworks}</Content>
    </PageWithHeader>
  );
};

export default SelectNetworkScreen;

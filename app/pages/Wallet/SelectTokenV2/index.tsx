import {
  Box,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconSearch, IconTokenPlaceHolder } from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useNavigate, useParams } from "react-router-dom";
import { NextAction } from "@/pages/Wallet/SelectNetwork";
import { type TokenV2 } from "core/types/Token";
import { useAssetList } from "@/hooks/useAssetList";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { serializeToken } from "@/common/utils/string";

type TokenItemProps = {
  token: TokenV2;
  onSelect: (token: TokenV2) => void;
};

const TokenItem = (prop: TokenItemProps) => {
  const { token, onSelect } = prop;

  return (
    <Flex
      cursor={"pointer"}
      w={"full"}
      justify={"start"}
      alignItems={"center"}
      minH={"44px"}
      onClick={() => {
        onSelect(token);
      }}
    >
      <Flex justify={"start"} alignItems={"center"} h={"full"} w={"full"}>
        {token.icon ? (
          <Image
            src={token.icon}
            w={"24px"}
            h={"24px"}
            borderRadius={"50px"}
            ml={2}
          />
        ) : (
          <IconTokenPlaceHolder ml={2} />
        )}
        <Text ml={3} fontSize={13} align={"start"}>
          {token.symbol}
        </Text>
      </Flex>
    </Flex>
  );
};

const SelectTokenScreenV2 = () => {
  const {
    uniqueId = InnerChainUniqueId.ETHEREUM,
    action = NextAction.Receive,
  } = useParams<{
    uniqueId: ChainUniqueId;
    action: NextAction;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();

  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);
  const { assets } = useAssetList(uniqueId, selectedAccount.account.address);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const onSelect = useCallback(
    (token: TokenV2) => {
      if (action === NextAction.Receive) {
        navigate(
          `/receive/${uniqueId}/${
            selectedAccount.account.address
          }?token=${serializeToken(token)}`,
        );
      }
    },
    [action, navigate, selectedAccount.account.address, uniqueId],
  );

  const renderTokens = useMemo(() => {
    return (
      <Box overflowY="auto">
        <VStack spacing={"10px"}>
          {assets.map((item, index) => {
            const key = item.uniqueId;
            return <TokenItem token={item} onSelect={onSelect} key={key} />;
          })}
        </VStack>
      </Box>
    );
  }, [assets, onSelect]);

  return (
    <PageWithHeader title={t("Networks:selectToken")}>
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
      <Content>{renderTokens}</Content>
    </PageWithHeader>
  );
};

export default SelectTokenScreenV2;

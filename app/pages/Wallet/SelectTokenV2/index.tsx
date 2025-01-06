import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconSearch } from "@/components/Custom/Icon";
import { useDebounce } from "use-debounce";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { PageWithHeader } from "@/layouts/Page";
import { useNavigate, useParams } from "react-router-dom";
import { NextAction } from "@/pages/Wallet/SelectNetwork";
import { type TokenV2 } from "core/types/Token";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { serializeToken } from "@/common/utils/string";
import { TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useAllTokens, useRecommendTokens } from "@/hooks/useToken";

const SelectTokenScreenV2 = () => {
  const { action = NextAction.Receive } = useParams<{
    uniqueId: ChainUniqueId;
    action: NextAction;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId } = useSafeParams();

  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);

  const { getMatchAccountsWithUniqueId } = useGroupAccount();

  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  const recommendTokens = useRecommendTokens(uniqueId); // 推荐 数量适中
  // console.log("      recommendTokens", recommendTokens);
  //
  // const rawAllTokens = useAllTokens(uniqueId); // 所有 数量很多
  // console.log("      rawAllTokens", rawAllTokens);
  //
  // const whiteListTokens = useAllWhiteTokens(uniqueId); // 白名单 数量较多
  // console.log("      whiteListTokens", whiteListTokens);
  //
  // const { assets: addressTokens } = useGroupAccountAssets();
  // console.log("      addressTokens", addressTokens);

  const userTokens = usePopupSelector(
    (state) =>
      state.tokens.userTokens?.[uniqueId]?.[selectedAccount?.account.address],
    isEqual,
  );

  const assets = useMemo(() => {
    if (action === NextAction.Send) {
      return userTokens ?? [];
    } else {
      return recommendTokens;
    }
  }, [action, recommendTokens, userTokens]);

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
      } else if (action === NextAction.Send) {
        if (uniqueId !== InnerChainUniqueId.ALEO_MAINNET) {
          navigate(
            `/send_token/${uniqueId}/${
              selectedAccount.account.address
            }/?token=${serializeToken(token)}`,
          );
        } else {
          navigate(`/send_aleo`);
        }
      }
    },
    [action, navigate, selectedAccount.account.address, uniqueId],
  );

  const renderTokens = useMemo(() => {
    return (
      <Box overflowY="auto">
        <VStack spacing={"10px"}>
          {assets.map((item, index) => {
            const { symbol, name, contractAddress, tokenId } = item;
            const key = `${symbol}${name}${contractAddress}${tokenId}`;
            // return <TokenItem token={item} onSelect={onSelect} key={key} />;
            return (
              <TokenItemWithBalance
                key={key}
                uniqueId={uniqueId}
                address={selectedAccount.account.address}
                token={item}
                onClick={onSelect}
                hover
              />
            );
          })}
        </VStack>
      </Box>
    );
  }, [assets, onSelect, selectedAccount.account.address, uniqueId]);

  return (
    <PageWithHeader title={t("Networks:selectToken")}>
      <InputGroup flexDir={"column"} px={5} position={"relative"} mb={3}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchStr}
          onChange={onKeywordChange}
          placeholder={t("SelectToken:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      {renderTokens}
    </PageWithHeader>
  );
};

export default SelectTokenScreenV2;

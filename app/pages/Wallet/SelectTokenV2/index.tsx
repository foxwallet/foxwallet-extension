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
import { serializeToken } from "@/common/utils/string";
import { TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useAllTokens, useRecommendTokens } from "@/hooks/useToken";
import { useAssetList } from "@/hooks/useAssetList";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { useSearchTokens } from "@/hooks/useSearchTokens";
import { useGroupAccountAssets } from "@/hooks/useGroupAccountAssets";

const SelectTokenScreenV2 = () => {
  const { action = NextAction.Receive } = useParams<{
    uniqueId: ChainUniqueId;
    action: NextAction;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId, address } = useSafeParams();

  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);
  const { nativeToken } = useAssetList(uniqueId, address);
  const { assets: groupAssets } = useGroupAccountAssets();

  const assetsOfUniqueId = useMemo(() => {
    return groupAssets.filter((item) => item.uniqueId === uniqueId);
  }, [groupAssets, uniqueId]);

  const recommendTokens = useRecommendTokens(uniqueId); // 推荐 数量适中
  const rawAllTokens = useAllTokens(uniqueId); // 所有 数量很多

  const assets = useMemo(() => {
    if (action === NextAction.Send) {
      return assetsOfUniqueId;
    } else {
      return [nativeToken, ...recommendTokens];
    }
  }, [action, assetsOfUniqueId, nativeToken, recommendTokens]);

  const { searchRes, searching: loading } = useSearchTokens(
    searchStr,
    action === NextAction.Send ? assetsOfUniqueId : rawAllTokens,
  );

  const displayList = useMemo(() => {
    return debounceSearchStr ? searchRes : assets;
  }, [debounceSearchStr, assets, searchRes]);

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
          `/receive/${uniqueId}/${address}?token=${serializeToken(token)}`,
        );
      } else if (action === NextAction.Send) {
        if (uniqueId !== InnerChainUniqueId.ALEO_MAINNET) {
          navigate(
            `/send_token/${uniqueId}/${address}/?token=${serializeToken(
              token,
            )}`,
          );
        } else {
          navigate(`/send_aleo`);
        }
      }
    },
    [action, navigate, address, uniqueId],
  );

  const renderTokens = useMemo(() => {
    return (
      <Box overflowY="auto" sx={HIDE_SCROLL_BAR_CSS}>
        <VStack spacing={"10px"}>
          {displayList.map((item, index) => {
            const { symbol, name, contractAddress, tokenId } = item;
            const key = `${symbol}${name}${contractAddress}${tokenId}`;
            return (
              <TokenItemWithBalance
                key={key}
                uniqueId={uniqueId}
                address={address}
                token={item}
                onClick={onSelect}
                hover
                showPriceAndChange={action === NextAction.Send}
                showBalnaceAndValue={action === NextAction.Send}
              />
            );
          })}
        </VStack>
      </Box>
    );
  }, [displayList, uniqueId, address, onSelect, action]);

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

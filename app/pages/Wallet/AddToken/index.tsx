import {
  IconAddCircle,
  IconRemoveCircle,
  IconSearch,
} from "@/components/Custom/Icon";
import { TokenItem, TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import {
  matchedAndUnMatchedTokens,
  useAllTokens,
  useRecommendTokens,
} from "@/hooks/useToken";
import { PageWithHeader } from "@/layouts/Page";
import {
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  BETA_STAKING_ALEO_TOKEN_ID,
  BETA_STAKING_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import { isEqual } from "lodash";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeParams } from "@/hooks/useSafeParams";
import { type TokenV2 } from "core/types/Token";
import { LoadingView } from "@/components/Custom/Loading";
import { useSearchTokens } from "@/hooks/useSearchTokens";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import type { AleoService } from "core/coins/ALEO/service/AleoService";
import { useCoinService } from "@/hooks/useCoinService";

function AddToken() {
  const { t } = useTranslation();
  const { uniqueId } = useSafeParams();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);
  const [searchText, setSearchText] = useState("");
  const { coinService } = useCoinService(uniqueId);

  const recommendTokens = useRecommendTokens(uniqueId); // 推荐 数量适中
  // console.log("      recommendTokens", recommendTokens);

  const rawAllTokens = useAllTokens(uniqueId); // 所有 数量很多
  // console.log("      rawAllTokens", rawAllTokens);

  const {
    searchRes,
    searching: loading,
    delaySearchStr,
  } = useSearchTokens(searchText, rawAllTokens);

  const userTokens = usePopupSelector(
    (state) =>
      state.tokens.userTokens?.[uniqueId]?.[selectedAccount?.account.address],
    isEqual,
  );
  console.log("      userTokens", userTokens);
  const dispatch = usePopupDispatch();

  // 需要区分用户已添加/没有添加的数据
  const targetTokens = useMemo(() => {
    return searchText ? [...searchRes] : recommendTokens;
  }, [searchText, searchRes, recommendTokens]);

  // 区分结果
  const { matchedTokens, unMatchedTokens } = useMemo(() => {
    return matchedAndUnMatchedTokens(uniqueId, targetTokens, userTokens);
  }, [targetTokens, uniqueId, userTokens]);

  // 页面显示的数据
  const { selectedTokens, unselectedTokens } = useMemo(() => {
    return {
      selectedTokens: searchText ? matchedTokens : userTokens ?? [],
      unselectedTokens: unMatchedTokens ?? [],
    };
  }, [matchedTokens, searchText, unMatchedTokens, userTokens]);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchText(value);
    },
    [],
  );

  const selectToken = useCallback(
    (token: TokenV2) => {
      // betastaking.aleo 特殊处理
      if (uniqueId === InnerChainUniqueId.ALEO_MAINNET) {
        const { programId: _programId, tokenId: _tokenId } = (
          coinService as AleoService
        ).parseContractAddress(token.contractAddress);
        if (_programId === BETA_STAKING_PROGRAM_ID) {
          token.tokenId = BETA_STAKING_ALEO_TOKEN_ID;
          token.programId = BETA_STAKING_PROGRAM_ID;
        }
      }

      dispatch.tokens.selectToken({
        uniqueId,
        address: selectedAccount.account.address,
        token,
      });
    },
    [uniqueId, dispatch.tokens, selectedAccount.account.address, coinService],
  );

  const unselectToken = useCallback(
    (token: TokenV2) => {
      dispatch.tokens.unselectToken({
        uniqueId,
        address: selectedAccount.account.address,
        token,
      });
    },
    [dispatch.tokens, uniqueId, selectedAccount],
  );

  return (
    <PageWithHeader title={t("ManageToken:title")}>
      <InputGroup flexDir={"column"} px={5} position={"relative"}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchText}
          onChange={onKeywordChange}
          placeholder={t("ManageToken:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      {loading && <LoadingView w={12} h={12} alignSelf={"center"} mt={2} />}
      <Flex
        flexDir={"column"}
        maxH={"500px"}
        overflowY={"auto"}
        mt={"6px"}
        sx={HIDE_SCROLL_BAR_CSS}
      >
        {/* added tokens */}
        {selectedTokens.length > 0 && (
          <>
            {selectedTokens.map((token) => {
              return (
                <Flex
                  key={token.tokenId}
                  flexDir={"row"}
                  align={"center"}
                  justifyContent={"space-between"}
                  pr={5}
                  _hover={{ bg: "gray.50", borderRadius: "lg" }}
                >
                  <TokenItemWithBalance
                    uniqueId={uniqueId}
                    address={selectedAccount.account.address}
                    token={token}
                    onClick={() => {
                      unselectToken(token);
                    }}
                    showPriceAndChange={false}
                  />
                  <Flex
                    cursor={"pointer"}
                    onClick={() => {
                      unselectToken(token);
                    }}
                  >
                    <IconRemoveCircle w={4} h={4} />
                  </Flex>
                </Flex>
              );
            })}
            <Flex alignSelf={"stretch"}>
              <Divider h={"1px"} mx={5} w={100} bg={"gray.100"} flex={1} />
            </Flex>
          </>
        )}
        {/* not added tokens */}
        {!loading &&
          unselectedTokens.length > 0 &&
          unselectedTokens.map((token) => {
            return (
              <Flex
                key={token.tokenId}
                flexDir={"row"}
                align={"center"}
                justifyContent={"space-between"}
                pr={5}
                _hover={{ bg: "gray.50", borderRadius: "lg" }}
              >
                <TokenItem
                  token={token}
                  onClick={() => {
                    selectToken(token);
                  }}
                  hideId={token.programId === BETA_STAKING_PROGRAM_ID}
                />
                <Flex
                  cursor={"pointer"}
                  onClick={() => {
                    selectToken(token);
                  }}
                >
                  <IconAddCircle w={4} h={4} />
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    </PageWithHeader>
  );
}

export default AddToken;

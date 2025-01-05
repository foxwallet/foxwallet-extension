import {
  IconAddCircle,
  IconRemoveCircle,
  IconSearch,
} from "@/components/Custom/Icon";
import { TokenItem, TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import {
  selectedAndUnselectedTokens,
  useAllTokens,
  useAllWhiteTokens,
  useRecommendTokens,
  useTokens,
} from "@/hooks/useToken";
import { PageWithHeader } from "@/layouts/Page";
import {
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react";
import {
  BETA_STAKING_ALEO_TOKEN_ID,
  BETA_STAKING_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import { type Token } from "core/coins/ALEO/types/Token";
import { isEqual } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeParams } from "@/hooks/useSafeParams";
import { type TokenV2 } from "core/types/Token";
import { useGroupAccountAssets } from "@/hooks/useGroupAccountAssets";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

function AddToken() {
  const { t } = useTranslation();
  const { uniqueId } = useSafeParams();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);
  const [keyword, setKeyword] = useState("");

  const recommendTokens = useRecommendTokens(uniqueId); // 推荐 数量适中
  console.log("      recommendTokens", recommendTokens);

  const rawAllTokens = useAllTokens(uniqueId); // 所有 数量很多
  console.log("      rawAllTokens", rawAllTokens);

  // const whiteListTokens = useAllWhiteTokens(uniqueId); // 白名单 数量较多
  // console.log("      whiteListTokens", whiteListTokens);
  //
  // const { assets: addressTokens } = useGroupAccountAssets();
  // console.log("      addressTokens", addressTokens);
  //
  const { tokens, loadingTokens, getTokens } = useTokens(uniqueId, keyword);
  const userTokens = usePopupSelector(
    (state) =>
      state.tokens.userTokens?.[uniqueId]?.[selectedAccount?.account.address],
    isEqual,
  );
  console.log("      userTokens", userTokens);
  const dispatch = usePopupDispatch();

  const targetTokens = useMemo(() => {
    return keyword ? rawAllTokens : recommendTokens;
  }, [keyword, rawAllTokens, recommendTokens]);

  const { selectedTokens, unselectedTokens } = useMemo(() => {
    return selectedAndUnselectedTokens(uniqueId, targetTokens, userTokens);
  }, [targetTokens, uniqueId, userTokens]);

  // const { selectedTokens, unselectedTokens } = useMemo(() => {
  //   const selected: TokenV2[] = [];
  //   let unselected: TokenV2[] = [];
  //   if (userTokens && userTokens.length > 0) {
  //     let contractAddressSet: Set<string>;
  //     if (uniqueId === InnerChainUniqueId.ALEO_MAINNET) {
  //       contractAddressSet = new Set(
  //         userTokens.map((token) => {
  //           if (token.contractAddress) {
  //             return token.contractAddress.toLowerCase();
  //           } else if (token.tokenId === BETA_STAKING_ALEO_TOKEN_ID) {
  //             return `${token.programId}-stAleo`.toLowerCase();
  //           } else {
  //             return `${token.programId}-${token.tokenId}`.toLowerCase();
  //           }
  //         }) ?? [],
  //       );
  //     } else {
  //       contractAddressSet = new Set(
  //         userTokens.map((token) => token.contractAddress.toLowerCase()) ?? [],
  //       );
  //     }
  //     // debugger;
  //     targetTokens.forEach((t) => {
  //       if (contractAddressSet.has(t.contractAddress.toLowerCase())) {
  //         selected.push(t);
  //       } else {
  //         unselected.push(t);
  //       }
  //     });
  //   } else {
  //     unselected = targetTokens;
  //   }
  //   return { selectedTokens: selected, unselectedTokens: unselected };
  // }, [targetTokens, uniqueId, userTokens]);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setKeyword(value);
    },
    [],
  );

  const selectToken = useCallback(
    (token: TokenV2) => {
      dispatch.tokens.selectToken({
        uniqueId,
        address: selectedAccount.account.address,
        token,
      });
    },
    [dispatch.tokens, uniqueId, selectedAccount],
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
          value={keyword}
          onChange={onKeywordChange}
          placeholder={t("ManageToken:searchHint")}
          pl={10}
          py={2}
        />
      </InputGroup>
      {loadingTokens && <Spinner w={6} h={6} alignSelf={"center"} mt={10} />}
      <Flex flexDir={"column"} maxH={"500px"} overflowY={"auto"} mt={"10px"}>
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
        {!loadingTokens &&
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

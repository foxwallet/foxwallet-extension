import {
  IconAddCircle,
  IconRemoveCircle,
  IconSearch,
} from "@/components/Custom/Icon";
import { TokenItem, TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { useChainMode } from "@/hooks/useChainMode";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useTokens } from "@/hooks/useToken";
import { PageWithHeader } from "@/layouts/Page";
import {
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react";
import { BETA_STAKING_PROGRAM_ID } from "core/coins/ALEO/constants";
import { type Token } from "core/coins/ALEO/types/Token";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function AddToken() {
  const { t } = useTranslation();
  // TODO: get uniqueId from nav param
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { availableChainUniqueIds } = useChainMode();
  const uniqueId = availableChainUniqueIds[0];
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  const [keyword, setKeyword] = useState("");
  const { tokens, loadingTokens, getTokens } = useTokens(uniqueId, keyword);
  const userTokens = usePopupSelector(
    (state) =>
      state.tokens.userTokens?.[uniqueId]?.[selectedAccount?.account.address],
    isEqual,
  );
  const dispatch = usePopupDispatch();

  const [selectedTokens, unselectedTokens] = useMemo(() => {
    const useTokenIds = new Set(
      userTokens?.map((token) => token.tokenId) ?? [],
    );
    const _selectedTokens: Token[] = [];
    const _unselectedTokens: Token[] = [];
    tokens?.forEach((token) => {
      if (useTokenIds.has(token.tokenId)) {
        _selectedTokens.push(token);
      } else {
        _unselectedTokens.push(token);
      }
    });
    return [_selectedTokens, _unselectedTokens];
  }, [tokens, userTokens]);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setKeyword(value);
    },
    [],
  );

  const selectToken = useCallback(
    (token: Token) => {
      dispatch.tokens.selectToken({
        uniqueId,
        address: selectedAccount.account.address,
        token,
      });
    },
    [dispatch.tokens, uniqueId, selectedAccount],
  );

  const unselectToken = useCallback(
    (token: Token) => {
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

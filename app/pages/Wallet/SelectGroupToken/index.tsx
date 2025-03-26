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
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { PageWithHeader } from "@/layouts/Page";
import { useNavigate, useParams } from "react-router-dom";
import { NextAction } from "@/pages/Wallet/SelectNetwork";
import { type TokenV2 } from "core/types/Token";
import { serializeToken } from "@/common/utils/string";
import { TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { useSearchTokens } from "@/hooks/useSearchTokens";
import { useGroupAccountAssets } from "@/hooks/useGroupAccountAssets";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { showBlockContinuousSendAleoDialog } from "@/components/Wallet/BlockContinuousSendAleoDialog";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";

const SelectGroupTokenScreen = () => {
  const { action = NextAction.Receive } = useParams<{
    action: NextAction;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendingAleoTx } = useIsSendingAleoTx();

  const [searchStr, setSearchStr] = useState("");
  const [debounceSearchStr] = useDebounce(searchStr, 500);
  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();
  const { assets: groupAssets } = useGroupAccountAssets();
  // console.log("      groupAssets", groupAssets);

  const { searchRes, searching: loading } = useSearchTokens(
    searchStr,
    groupAssets,
  );

  const displayList = useMemo(() => {
    return debounceSearchStr ? searchRes : groupAssets;
  }, [debounceSearchStr, groupAssets, searchRes]);

  const onKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const onSelect = useCallback(
    async (token: TokenV2) => {
      if (action === NextAction.Send) {
        if (token.uniqueId !== InnerChainUniqueId.ALEO_MAINNET) {
          navigate(
            `/send_token/${token.uniqueId}/${
              token.ownerAddress
            }/?token=${serializeToken(token)}`,
          );
        } else if (sendingAleoTx) {
          await showBlockContinuousSendAleoDialog();
        } else {
          navigate(`/send_aleo?token=${serializeToken(token)}`);
        }
      }
    },
    [action, navigate, sendingAleoTx],
  );

  const renderTokens = useMemo(() => {
    return (
      <Box overflowY="auto" sx={HIDE_SCROLL_BAR_CSS} maxH={480}>
        <VStack spacing={"10px"}>
          {displayList.map((item, index) => {
            const { symbol, name, contractAddress, tokenId, uniqueId } = item;
            const selectAccount = getMatchAccountsWithUniqueId(
              item.uniqueId,
            )[0];
            const key = `${symbol}${name}${contractAddress}${tokenId}`;
            return (
              <TokenItemWithBalance
                key={key}
                uniqueId={uniqueId}
                address={selectAccount.account.address}
                token={item}
                onClick={onSelect}
                hover
              />
            );
          })}
        </VStack>
      </Box>
    );
  }, [displayList, getMatchAccountsWithUniqueId, onSelect]);

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

export default SelectGroupTokenScreen;

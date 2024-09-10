import {
  IconAleo,
  IconChevronRight,
  IconEmptyTxPlaceholder,
  IconReceiveBlack,
  IconSendBlack,
} from "@/components/Custom/Icon";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import {
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AleoHistoryItem,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import browser from "webextension-polyfill";
import { useTxHistory } from "@/hooks/useTxHistory";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";
import { useRecords } from "@/hooks/useRecord";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useBottomReach } from "@/hooks/useBottomReach";
import { useLocationParams } from "@/hooks/useLocationParams";
import { useAssetList } from "@/hooks/useAssetList";
import { Token } from "core/coins/ALEO/types/Token";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  BETA_STAKING_ALEO_TOKEN_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { serializeToken } from "@/common/utils/string";

interface TokenTxHistoryItemProps {
  item: AleoHistoryItem;
  uniqueId: InnerChainUniqueId;
  token: Token;
}

const TokenTxHistoryItem: React.FC<TokenTxHistoryItemProps> = ({
  uniqueId,
  item,
  token,
}) => {
  const { t } = useTranslation();
  const { coinService } = useCoinService(uniqueId);

  const timeOfItem = dayjs(item.timestamp);
  const isCurrentYear = dayjs().year() === timeOfItem.year();
  const timeStr = timeOfItem.format(
    isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT",
  );

  const onClick = useCallback(() => {
    if (!item.txId) {
      return;
    }
    const url = coinService.getTxDetailUrl(item.txId);
    browser.tabs.create({ url });
  }, [item.txId]);

  const txLabel = useMemo(
    () => `${item.functionName.split("_").join(" ")}`,
    [],
  );
  const amount = useMemo(() => BigInt(item.amount || 0n), [item.amount]);

  const { borderColor } = useThemeStyle();

  return (
    <Flex
      align={"center"}
      justify={"space-between"}
      borderColor={borderColor}
      borderBottomWidth={"1px"}
      py={2.5}
      mt={2.5}
      as={"button"}
      onClick={onClick}
    >
      <Flex align={"center"}>
        <Box bg={"#E6E8EC"} p={1} borderRadius={"50px"}>
          {item.addressType === AleoTxAddressType.RECEIVE ? (
            <IconReceiveBlack />
          ) : (
            <IconSendBlack />
          )}
        </Box>
        <Flex direction={"column"} ml={2.5} alignItems={"flex-start"}>
          <Flex align={"center"}>
            <Flex fontWeight={"bold"} fontSize={12}>
              <Text maxWidth={150} textOverflow={"ellipsis"} textAlign={"left"}>
                {txLabel}
              </Text>
            </Flex>
            {!!item.amount && (
              <Box fontWeight={"bold"} fontSize={12} ml={1}>
                <TokenNum
                  amount={amount}
                  decimals={token.decimals}
                  symbol={token.symbol}
                />
              </Box>
            )}
          </Flex>
          <Flex color={"gray.500"} fontSize={10} align={"center"}>
            <Text mr={2}>{item.status}</Text>
            <Text>{timeStr}</Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex alignItems={"center"}>
        <Text fontSize={10}>{t("TokenDetail:jump_explorer")}</Text>
        <IconChevronRight />
      </Flex>
    </Flex>
  );
};

const TokenDetailScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { selectedAccount } = useCurrAccount();

  const {
    uniqueId = InnerChainUniqueId.ALEO_MAINNET,
    address = selectedAccount.address,
  } = useParams<{
    uniqueId: InnerChainUniqueId;
    address: string;
  }>();

  const token = useLocationParams("token");

  const { nativeToken } = useAssetList(uniqueId, address);

  const tokenInfo = useMemo(() => {
    try {
      if (!token) {
        return nativeToken;
      }
      return JSON.parse(token) as Token;
    } catch (err) {
      return nativeToken;
    }
  }, [nativeToken, token]);

  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.address,
    programId: tokenInfo.programId,
    tokenId: tokenInfo.tokenId,
  });

  const { history, getMore, loading, loadingLocalTxs, loadingOnChainHistory } =
    useTxHistory({
      uniqueId,
      address: selectedAccount.address,
      token: tokenInfo,
      refreshInterval: 4000,
    });
  const listRef = useRef<HTMLDivElement | null>(null);
  const reachBottom = useBottomReach(listRef);
  useEffect(() => {
    if (reachBottom) {
      getMore();
    }
  }, [reachBottom]);

  const { sendingAleoTx } = useIsSendingAleoTx(uniqueId);
  const { records, loading: loadingRecords } = useRecords({
    uniqueId,
    address: selectedAccount.address,
    recordFilter: RecordFilter.UNSPENT,
    programId: tokenInfo.programId,
  });

  const tokenRecords = useMemo(() => {
    switch (tokenInfo.programId) {
      case NATIVE_TOKEN_PROGRAM_ID: {
        return records;
      }
      case ALPHA_TOKEN_PROGRAM_ID: {
        return records
          .filter((record) => {
            return record.parsedContent?.token === tokenInfo.tokenId;
          })
          .sort(
            (record1, record2) =>
              record2.parsedContent?.amount - record1.parsedContent?.amount,
          );
      }
      case BETA_STAKING_PROGRAM_ID: {
        return records;
      }
      default: {
        console.error("Unsupport programId " + tokenInfo.programId);
        return [];
      }
    }
  }, [records, token]);

  const recordStr = useMemo(() => {
    if (!tokenRecords) {
      return "";
    }
    if (tokenRecords.length === 0) {
      return t("Send:noRecordExist");
    }
    return t("Send:recordStatistics", { COUNT: tokenRecords.length });
  }, [tokenRecords]);

  const recordAmount = useMemo(() => {
    switch (tokenInfo.programId) {
      case NATIVE_TOKEN_PROGRAM_ID: {
        return tokenRecords[0]?.parsedContent?.microcredits;
      }
      case ALPHA_TOKEN_PROGRAM_ID: {
        return tokenRecords[0]?.parsedContent?.amount;
      }
      case BETA_STAKING_PROGRAM_ID: {
        return tokenRecords[0]?.parsedContent?.amount;
      }
      default: {
        console.error("Unsupport programId " + tokenInfo.programId);
      }
    }
  }, [tokenInfo, tokenRecords]);

  const onReceive = useCallback(() => {
    navigate(`/receive`);
  }, [navigate]);

  const onSend = useCallback(() => {
    navigate(`/send_aleo?token=${serializeToken(tokenInfo)}`);
  }, [navigate]);

  const renderTxHistoryItem = useCallback(
    (item: AleoHistoryItem, index: number) => {
      return (
        <TokenTxHistoryItem
          key={`${item.txId}${index}`}
          item={item}
          uniqueId={uniqueId}
          token={tokenInfo}
        />
      );
    },
    [uniqueId, tokenInfo],
  );

  return (
    <PageWithHeader title={t("TokenDetail:title")}>
      <Flex direction={"column"} px={5} py={2.5}>
        <Flex align={"center"}>
          <Image src={tokenInfo.logo} mr={2.5} w={6} h={6} borderRadius={12} />
          <Flex direction={"column"}>
            <Text fontSize={13} fontWeight={"bold"}>
              {tokenInfo.symbol}
            </Text>
            <Flex>
              <Text color={"#777E90"} fontSize={10} mr={2}>
                {tokenInfo.programId}
              </Text>
              {tokenInfo.tokenId !== NATIVE_TOKEN_TOKEN_ID &&
                tokenInfo.tokenId !== BETA_STAKING_ALEO_TOKEN_ID && (
                  <MiddleEllipsisText
                    text={tokenInfo.tokenId}
                    width={150}
                    style={{ color: "#777E90", fontSize: 10 }}
                  />
                )}
            </Flex>
          </Flex>
        </Flex>
        <Divider orientation="horizontal" h={"1px"} my={2.5} />
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <Flex flexDir={"column"} pt={2} fontSize={"smaller"}>
              <Flex>
                <Text>{t("Send:publicBalance")}:&nbsp;</Text>
                {loadingBalance ? (
                  <Spinner w={2} h={2} />
                ) : (
                  <TokenNum
                    amount={balance?.publicBalance}
                    decimals={tokenInfo.decimals}
                    symbol={tokenInfo.symbol}
                  />
                )}
              </Flex>
              <Flex mt={2}>
                <Text>{t("Send:privateRecord")}:&nbsp;</Text>
                <Flex flexDir={"column"}>
                  {loadingBalance ? (
                    <Spinner w={2} h={2} />
                  ) : (
                    <TokenNum
                      amount={balance?.privateBalance}
                      decimals={tokenInfo.decimals}
                      symbol={tokenInfo.symbol}
                    />
                  )}
                  {!!recordStr && !!tokenRecords[0] && (
                    <Flex>
                      (<Text>{recordStr}</Text>&nbsp;
                      <TokenNum
                        amount={recordAmount}
                        decimals={tokenInfo.decimals}
                        symbol={tokenInfo.symbol}
                      />
                      )
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          {/* todo: cash value */}
          {/* <Text color={"#777E90"} fontSize={10}>
            $123,234
          </Text> */}
        </Flex>
        <Flex justify={"space-between"} flex={1} mt={2.5}>
          <Button flex={1} onClick={onReceive}>
            {t("Receive:title")}
          </Button>
          <Button
            flex={1}
            ml={3}
            colorScheme="normal"
            borderColor={"black"}
            isDisabled={sendingAleoTx || loadingBalance || !balance?.total}
            onClick={onSend}
          >
            {t("Send:title")}
          </Button>
        </Flex>
      </Flex>
      <Divider orientation="horizontal" h={"1px"} />
      <Flex direction={"column"} px={5} py={2.5}>
        <Text fontWeight={"bold"}>{t("TokenDetail:tx_records")}</Text>
        {loading && history.length === 0 ? (
          <Spinner w={6} h={6} alignSelf={"center"} mt={10} />
        ) : history.length > 0 ? (
          <Flex ref={listRef} direction={"column"} maxH={320} overflowY="auto">
            {loadingLocalTxs && (
              <Spinner w={6} h={6} alignSelf={"center"} mt={10} />
            )}
            {history?.map(renderTxHistoryItem)}

            {loadingOnChainHistory && (
              <Flex mt={6} mb={4} alignSelf={"center"}>
                <Spinner w={10} h={10} />
              </Flex>
            )}
          </Flex>
        ) : (
          <VStack mt={2.5}>
            <IconEmptyTxPlaceholder />
            <Text color={"#777E90"} fontSize={10}>
              {t("TokenDetail:empty_tx")}
            </Text>
          </VStack>
        )}
      </Flex>
    </PageWithHeader>
  );
};

export default TokenDetailScreen;

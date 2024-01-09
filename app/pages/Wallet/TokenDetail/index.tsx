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
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AleoHistoryItem,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AleoTxStatus } from "../../../../offscreen_transaction/src/types";
import dayjs from "dayjs";
import browser from "webextension-polyfill";
import { ALE0_EXPOLER_TRANSACTION_URL } from "@/common/constants";
import { useTxHistory } from "@/hooks/useTxHistory";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";
import { useRecords } from "@/hooks/useRecord";
import { useThemeStyle } from "@/hooks/useThemeStyle";

interface TokenTxHistoryItemProps {
  item: AleoHistoryItem;
  uniqueId: InnerChainUniqueId;
}

const TokenTxHistoryItem: React.FC<TokenTxHistoryItemProps> = ({
  uniqueId,
  item,
}) => {
  const { t } = useTranslation();
  const { nativeCurrency } = useCoinService(uniqueId);

  const timeOfItem = dayjs(item.timestamp);
  const isCurrentYear = dayjs().year() === timeOfItem.year();
  const timeStr = timeOfItem.format(
    isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT",
  );

  const onClick = useCallback(() => {
    if (!item.txId) {
      return;
    }
    const url = `${ALE0_EXPOLER_TRANSACTION_URL}/${item.txId}`;
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
                  decimals={nativeCurrency.decimals}
                  symbol={nativeCurrency.symbol}
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
      <IconChevronRight />
    </Flex>
  );
};

const TokenDetailScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { uniqueId = InnerChainUniqueId.ALEO_TESTNET3 } = useParams<{
    uniqueId: InnerChainUniqueId;
  }>();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { selectedAccount } = useCurrAccount();
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
  );

  const { history } = useTxHistory(uniqueId, selectedAccount.address, 4000);
  const { sendingAleoTx } = useIsSendingAleoTx(uniqueId);
  const { records, loading: loadingRecords } = useRecords(
    uniqueId,
    selectedAccount.address,
  );

  const recordStr = useMemo(() => {
    if (!records) {
      return "";
    }
    if (records.length === 0) {
      return t("Send:noRecordExist");
    }
    return t("Send:recordStatistics", { COUNT: records.length });
  }, [records]);

  const onReceive = useCallback(() => {
    navigate(`/receive`);
  }, [navigate]);

  const onSend = useCallback(() => {
    navigate(`/send_aleo`);
  }, [navigate]);

  const renderTxHistoryItem = useCallback(
    (item: AleoHistoryItem, index: number) => {
      return (
        <TokenTxHistoryItem
          key={`${item.txId}${index}`}
          item={item}
          uniqueId={uniqueId}
        />
      );
    },
    [uniqueId],
  );

  return (
    <PageWithHeader title={t("TokenDetail:title")}>
      <Flex direction={"column"} px={5} py={2.5}>
        <Flex align={"center"}>
          <IconAleo mr={2.5} w={6} h={6} />
          <Flex direction={"column"}>
            <Text fontSize={13} fontWeight={"bold"}>
              {nativeCurrency.symbol}
            </Text>
            <Text color={"#777E90"} fontSize={10}>
              {nativeCurrency.address}
            </Text>
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
                    amount={balance?.publicBalance || 0n}
                    decimals={nativeCurrency.decimals}
                    symbol={nativeCurrency.symbol}
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
                      amount={balance?.privateBalance || 0n}
                      decimals={nativeCurrency.decimals}
                      symbol={nativeCurrency.symbol}
                    />
                  )}
                  {!!recordStr && !!records[0] && (
                    <Flex>
                      (<Text>{recordStr}</Text>&nbsp;
                      <TokenNum
                        amount={records[0].parsedContent?.microcredits || 0n}
                        decimals={nativeCurrency.decimals}
                        symbol={nativeCurrency.symbol}
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
            isDisabled={sendingAleoTx}
            onClick={onSend}
          >
            {t("Send:title")}
          </Button>
        </Flex>
      </Flex>
      <Divider orientation="horizontal" h={"1px"} />
      <Flex direction={"column"} px={5} py={2.5}>
        <Text fontWeight={"bold"}>{t("TokenDetail:tx_records")}</Text>
        {history && history?.length > 0 ? (
          <Flex direction={"column"} maxH={320} overflowY="auto">
            {history?.map(renderTxHistoryItem)}
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

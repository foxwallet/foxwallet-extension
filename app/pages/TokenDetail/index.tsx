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
import { Box, Button, Divider, Flex, Text, VStack } from "@chakra-ui/react";
import {
  AleoHistoryItem,
  AleoHistoryType,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AleoTxStatus } from "../../../offscreen_transaction/src/types";
import { parseU64 } from "../../../offscreen_sync/helper";
import dayjs from "dayjs";
import browser from "webextension-polyfill";
import { ALE0_EXPOLER_TRANSACTION_URL } from "@/common/constants";

const history: any[] = [
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.SEND,
    amount: "123.33",
    status: AleoTxStatus.COMPLETED,
  },
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.SEND,
    amount: "123",
    status: AleoTxStatus.COMPLETED,
  },
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.SEND,
    amount: "123",
    status: AleoTxStatus.COMPLETED,
  },
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.SEND,
    amount: "123",
    status: AleoTxStatus.COMPLETED,
  },
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.RECEIVE,
    amount: "123",
    status: AleoTxStatus.COMPLETED,
  },
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.RECEIVE,
    amount: "123",
    status: AleoTxStatus.COMPLETED,
  },
  {
    type: AleoHistoryType.LOCAL,
    localId: "localid1",
    txId: "at1g37atr7cuy35s2y4me2eu0h2r3u2xyhhcs8yryz2x8xhgd7klurqdqpluq",
    error: "",
    programId: "programId_mock-1",
    functionName: "send",
    inputs: [],
    timestamp: Date.now(),
    addressType: AleoTxAddressType.RECEIVE,
    amount: "123",
    status: AleoTxStatus.COMPLETED,
  },
];

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
    const url = `${ALE0_EXPOLER_TRANSACTION_URL}/${item.txId}`;
    browser.tabs.create({ url });
  }, [item.txId]);

  const txLabel = useMemo(
    () =>
      item.addressType === AleoTxAddressType.RECEIVE
        ? t("Receive:title")
        : t("Send:title"),
    [],
  );
  const amount = useMemo(() => parseU64("1232"), [item.amount]);

  return (
    <Flex
      align={"center"}
      justify={"space-between"}
      borderColor={"#E6E8EC"}
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
            <Text fontWeight={"bold"} fontSize={12}>
              {txLabel}
            </Text>
            <Box fontWeight={"bold"} fontSize={12} ml={1}>
              <TokenNum
                amount={amount}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            </Box>
          </Flex>
          <Text color={"#777E90"} fontSize={10}>
            {timeStr}
          </Text>
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
  const { balance } = useBalance(uniqueId, selectedAccount.address);

  // const { history } = useTxHistory(uniqueId, selectedAccount.address, 4000);

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
            <Text color={"black"} fontSize={13} fontWeight={"bold"}>
              {nativeCurrency.symbol}
            </Text>
            <Text color={"#777E90"} fontSize={10}>
              {nativeCurrency.address}
            </Text>
          </Flex>
        </Flex>
        <Divider orientation="horizontal" h={"1px"} bg={"#E6E8EC"} my={2.5} />
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <Text mr={1} fontWeight={"bold"} fontSize={12}>
              {t("TokenDetail:balance")}:
            </Text>
            <Box fontWeight={"bold"} fontSize={12}>
              <TokenNum
                amount={balance?.total || 0n}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            </Box>
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
            onClick={onSend}
          >
            {t("Send:title")}
          </Button>
        </Flex>
      </Flex>
      <Divider orientation="horizontal" h={"1px"} bg={"#E6E8EC"} />
      <Flex direction={"column"} px={5} py={2.5}>
        <Text fontWeight={"bold"}>{t("TokenDetail:tx_records")}</Text>
        {history && history?.length > 0 ? (
          <Flex direction={"column"} maxH={340} overflowY="auto">
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

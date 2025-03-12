import {
  IconCopyBlack,
  IconEmptyTxPlaceholder,
  IconReceiveBlack,
  IconSendBlack,
  IconTokenPlaceHolder,
} from "@/components/Custom/Icon";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { PageWithHeader } from "@/layouts/Page";
import {
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
  useClipboard,
  VStack,
} from "@chakra-ui/react";
import {
  type AleoHistoryItem,
  AleoHistoryType,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import {
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAleoTxHistory, useTxHistory } from "@/hooks/useTxHistory";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useBottomReach } from "@/hooks/useBottomReach";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import {
  BETA_STAKING_ALEO_TOKEN_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { serializeData, serializeToken } from "@/common/utils/string";
import { useBalance } from "@/hooks/useBalance";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { ethers } from "ethers";
import { type TransactionHistoryItem } from "core/types/TransactionHistory";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { usePopupSelector } from "@/hooks/useStore";
import { showCopyContractAddressDialog } from "@/components/Wallet/CopyContractAddressDialog";
import { TransactionStatus } from "core/types/TransactionStatus";
import {
  SimplifiedAleoTxStatus,
  simplifyAleoTxStatus,
} from "core/coins/ALEO/utils/utils";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { TokenImage } from "@/components/Wallet/TokenItem";

interface AleoTokenTxHistoryItemProps {
  item: AleoHistoryItem;
  uniqueId: ChainUniqueId;
  token: TokenV2;
  address: string;
}

const AleoTxHistoryItem: React.FC<AleoTokenTxHistoryItemProps> = ({
  uniqueId,
  item,
  token,
  address,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const timeOfItem = dayjs(item.timestamp);
  const isCurrentYear = dayjs().year() === timeOfItem.year();
  const timeStr = timeOfItem.format(
    isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT",
  );

  const onClick = useCallback(() => {
    navigate(
      `/transaction_detail/${uniqueId}/${address}?token=${serializeToken(
        token,
      )}&txItem=${serializeData(item)}`,
    );
  }, [address, item, navigate, token, uniqueId]);

  const txTitle = useMemo(() => {
    return t(`TokenDetail:${item.addressType}`);
  }, [item.addressType, t]);
  const txPublicInfo = useMemo(() => {
    const prefix = "transfer_";
    const functionName = item.functionName.startsWith(prefix)
      ? item.functionName.slice(prefix.length)
      : item.functionName;
    return `(${functionName.split("_").join(" ")})`;
  }, [item.functionName]);
  const amount = useMemo(() => {
    if (item.functionName === "join" || item.functionName === "split") {
      return 0n;
    }
    return BigInt(item.amount ?? 0n);
  }, [item]);

  const addressLabel = useMemo(() => {
    let ret = "";
    let addr = "";
    const isSend = item.addressType === AleoTxAddressType.SEND;
    const fromTo = isSend ? "To" : "From"; // if send , show to address

    if (item.functionName === AleoTransferMethod.PUBLIC) {
      if (item.type === AleoHistoryType.LOCAL) {
        addr = item.inputs[0];
      } else {
        addr = isSend ? item.to ?? "" : item.from ?? "";
      }
      ret = `${fromTo} ${addr}`;
    }
    return ret;
  }, [item]);

  const { txStatus, txStatusStr } = simplifyAleoTxStatus(item.status);

  return (
    <TxHistoryItem
      isSend={item.addressType === AleoTxAddressType.SEND}
      timeStr={timeStr}
      txTitle={txTitle}
      txTitle2={txPublicInfo}
      addressLabel={addressLabel}
      status={
        txStatus === SimplifiedAleoTxStatus.Success ? undefined : txStatusStr
      }
      amount={amount}
      decimals={token.decimals}
      symbol={token.symbol}
      onClick={onClick}
    />
  );
};

interface TokenTxHistoryItemProps {
  item: TransactionHistoryItem;
  uniqueId: ChainUniqueId;
  token: TokenV2;
  address: string;
}

const TokenTxHistoryItem = (props: TokenTxHistoryItemProps) => {
  const { uniqueId, item, token, address } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const timeOfItem = dayjs(item.timestamp);
  const isCurrentYear = dayjs().year() === timeOfItem.year();
  const timeStr = timeOfItem.format(
    isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT",
  );

  const onClick = useCallback(() => {
    navigate(
      `/transaction_detail/${uniqueId}/${address}?token=${serializeToken(
        token,
      )}&txItem=${serializeData(item)}`,
    );
  }, [address, item, navigate, token, uniqueId]);

  const txTitle = useMemo(() => {
    if (item.label) {
      return t(`TokenDetail:${item.label}`);
    } else {
      if (item.from === address) {
        return t("TokenDetail:send");
      } else if (item.to === address) {
        return t("TokenDetail:receive");
      }
    }
    return "";
  }, [address, item, t]);
  const amount = useMemo(() => item.value ?? 0n, [item]);

  const isSend = useMemo(() => {
    return item.from === address;
  }, [address, item]);

  const addressLabel = useMemo(() => {
    return isSend ? `To ${item.to}` : `From ${item.from}`;
  }, [isSend, item]);

  const status = useMemo(() => {
    return item.status === TransactionStatus.SUCCESS
      ? undefined
      : item.status.toLowerCase();
  }, [item.status]);

  return (
    <TxHistoryItem
      isSend={isSend}
      timeStr={timeStr}
      txTitle={txTitle}
      addressLabel={addressLabel}
      status={status}
      amount={amount}
      decimals={token.decimals}
      symbol={token.symbol}
      onClick={onClick}
    />
  );
};

type TxHistoryItemProps = {
  isSend: boolean;
  timeStr?: string;
  onClick?: () => void;
  txTitle?: string;
  txTitle2?: string;
  addressLabel?: string;
  status?: string;
  amount: bigint;
  decimals: number;
  symbol: string;
};

const TxHistoryItem = (props: TxHistoryItemProps) => {
  const {
    isSend,
    timeStr,
    txTitle,
    txTitle2,
    addressLabel,
    amount,
    status,
    onClick,
    decimals,
    symbol,
  } = props;
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
          {isSend ? <IconSendBlack /> : <IconReceiveBlack />}
        </Box>
        <Flex direction={"column"} ml={2.5} alignItems={"flex-start"}>
          <Flex align={"center"}>
            {txTitle && (
              <Flex fontWeight={"bold"} fontSize={12}>
                <Text
                  maxWidth={150}
                  textOverflow={"ellipsis"}
                  textAlign={"left"}
                >
                  {txTitle}
                </Text>
              </Flex>
            )}
            {txTitle2 && (
              <Flex
                h={"14px"}
                pl={1}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Text fontSize={"11px"}>{txTitle2}</Text>
              </Flex>
            )}
            {status && (
              <Flex
                h={"14px"}
                bg={"#EF466F"}
                px={1.5}
                ml={1}
                borderRadius={"7px"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Text fontSize={"10px"} textColor={"white"}>
                  {status}
                </Text>
              </Flex>
            )}
          </Flex>
          {addressLabel && (
            <Flex color={"gray.500"} fontSize={10} align={"center"}>
              <Flex flexDirection={"row"}>
                <MiddleEllipsisText text={addressLabel} width={180} />
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        direction={"column"}
        justifyContent={"center"}
        alignItems={"flex-end"}
      >
        {amount >= 0n && (
          <Box fontWeight={"bold"} fontSize={12} ml={1}>
            <TokenNum
              amount={amount}
              decimals={decimals}
              symbol={symbol}
              textColor={isSend ? "#00D856" : "#EF466F"}
              extraPreText={amount === 0n ? "" : isSend ? "- " : "+ "}
            />
          </Box>
        )}
        <Text color={"gray.500"} fontSize={10}>
          {timeStr}
        </Text>
      </Flex>
    </Flex>
  );
};

const TokenDetailScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId, address } = useSafeParams();
  const { tokenInfo } = useSafeTokenInfo(uniqueId, address);
  const { chainConfig, nativeCurrency } = useCoinService(uniqueId);
  const showBalance = usePopupSelector((state) => state.accountV2.showBalance);

  const isAleo = useMemo(() => {
    return uniqueId === InnerChainUniqueId.ALEO_MAINNET;
  }, [uniqueId]);

  const { symbol, decimals } = useMemo(() => {
    return {
      symbol: tokenInfo?.symbol ?? nativeCurrency.symbol,
      decimals: tokenInfo?.decimals ?? nativeCurrency.decimals,
    };
  }, [nativeCurrency, tokenInfo]);

  const { onCopy } = useClipboard(address);
  const { showToast } = useCopyToast();

  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address,
    refreshInterval: 10000,
    token: tokenInfo,
  });

  const {
    history: aleoHistory,
    getMore: aleoGetMore,
    loading: aleoLoading,
    loadingLocalTxs,
    loadingOnChainTxs,
  } = useAleoTxHistory({
    uniqueId,
    address,
    token: tokenInfo,
    refreshInterval: 4000,
  });
  const listRef = useRef<HTMLDivElement | null>(null);
  const reachBottom = useBottomReach(listRef);

  const {
    history: evmHistory,
    getMore: evmGetMore,
    loading: evmLoading,
    error: evmError,
  } = useTxHistory({
    uniqueId,
    address,
    token: tokenInfo,
    refreshInterval: 4000,
  });

  const { history, loading, getMore } = useMemo(() => {
    return {
      history: isAleo ? aleoHistory : evmHistory,
      getMore: isAleo ? aleoGetMore : evmGetMore,
      loading: isAleo ? aleoLoading : evmLoading,
    };
  }, [
    aleoGetMore,
    aleoHistory,
    aleoLoading,
    evmGetMore,
    evmHistory,
    evmLoading,
    isAleo,
  ]);
  // console.log("      history", history);

  useEffect(() => {
    if (reachBottom) {
      getMore();
    }
  }, [getMore, reachBottom]);

  const { sendingAleoTx } = useIsSendingAleoTx();

  const onReceive = useCallback(() => {
    navigate(
      `/receive/${uniqueId}/${address}?token=${serializeToken(tokenInfo)}`,
    );
  }, [navigate, uniqueId, address, tokenInfo]);

  const onSend = useCallback(() => {
    isAleo
      ? navigate(`/send_aleo?token=${serializeToken(tokenInfo)}`)
      : navigate(
          `/send_token/${uniqueId}/${address}/?token=${serializeToken(
            tokenInfo,
          )}`,
        );
  }, [address, isAleo, navigate, tokenInfo, uniqueId]);

  const renderTxHistory = useMemo(() => {
    if (isAleo) {
      return (history as AleoHistoryItem[])?.map(
        (item: AleoHistoryItem, index: number) => {
          return (
            <AleoTxHistoryItem
              key={`${item.txId}${index}`}
              item={item}
              uniqueId={uniqueId}
              token={tokenInfo}
              address={address}
            />
          );
        },
      );
    }
    return (history as TransactionHistoryItem[])?.map(
      (item: TransactionHistoryItem, index: number) => {
        return (
          <TokenTxHistoryItem
            key={`${item.id}${index}`}
            item={item}
            uniqueId={uniqueId}
            token={tokenInfo}
            address={address}
          />
        );
      },
    );
  }, [isAleo, history, uniqueId, tokenInfo, address]);

  const onCopyAddress = useCallback(() => {
    onCopy();
    showToast();
  }, [onCopy, showToast]);

  const balanceStr = useMemo(() => {
    if (balance) {
      const num = ethers.utils.formatUnits(balance.total, decimals);
      return `${num} ${symbol}`;
    }
    return "";
  }, [balance, decimals, symbol]);

  const onCopyContractAddress = useCallback(async () => {
    const { confirmed } = await showCopyContractAddressDialog();
    if (confirmed) {
      await navigator.clipboard.writeText(tokenInfo.contractAddress);
      showToast();
    }
  }, [showToast, tokenInfo.contractAddress]);

  return (
    <PageWithHeader title={t("TokenDetail:title")}>
      <Flex direction={"column"} px={5} py={2.5}>
        <Flex alignItems={"center"}>
          <TokenImage
            token={tokenInfo}
            uniqueId={uniqueId}
            imageStyle={{
              width: 6,
              height: 6,
              backgroundColor: "green",
              borderRadius: 12,
            }}
          />
          <Flex direction={"column"} ml={2.5}>
            <Flex>
              <Text fontSize={13} fontWeight={"bold"}>
                {tokenInfo.symbol}
              </Text>
              {!isAleo && tokenInfo.type === AssetType.TOKEN && (
                <Flex
                  bg={"#f9f9f9"}
                  align={"center"}
                  borderRadius={"10px"}
                  ml={1}
                  cursor={"pointer"}
                  fontSize={"xx-small"}
                  noOfLines={1}
                  onClick={onCopyContractAddress}
                >
                  <MiddleEllipsisText
                    text={tokenInfo.contractAddress}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "2px",
                      maxWidth: "240px",
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  />
                </Flex>
              )}
            </Flex>

            {isAleo ? (
              <Flex>
                <Text color={"#777E90"} fontSize={10} mr={2}>
                  {tokenInfo.programId}
                </Text>
                {tokenInfo.tokenId !== NATIVE_TOKEN_TOKEN_ID &&
                  tokenInfo.tokenId !== BETA_STAKING_ALEO_TOKEN_ID && (
                    <MiddleEllipsisText
                      text={tokenInfo.tokenId ?? ""}
                      width={150}
                      style={{ color: "#777E90", fontSize: 10 }}
                    />
                  )}
              </Flex>
            ) : (
              <Text color={"#777E90"} fontSize={10} mr={2}>
                {chainConfig.chainName}
              </Text>
            )}
          </Flex>
        </Flex>
        <Divider orientation="horizontal" h={"1px"} my={2.5} />
        {/* my address */}
        <Flex
          alignItems={"center"}
          fontSize={"smaller"}
          cursor={"pointer"}
          onClick={onCopyAddress}
          h={"25px"}
        >
          <Flex flexDirection={"row"}>
            <Text noOfLines={1}>{t("TokenDetail:myAddress")}:&nbsp;</Text>
            <MiddleEllipsisText text={address} width={200} />
          </Flex>
          <IconCopyBlack ml={1} w={3} h={3} />
        </Flex>
        {/*  balance */}
        {isAleo ? (
          <Box>
            <Flex align={"center"} justify={"space-between"}>
              <Flex align={"center"}>
                <Flex flexDir={"column"} pt={2} fontSize={"smaller"}>
                  <Flex>
                    <Text>{t("TokenDetail:public")}:&nbsp;</Text>
                    {loadingBalance ? (
                      <Spinner w={2} h={2} />
                    ) : showBalance ? (
                      <TokenNum
                        amount={balance?.publicBalance}
                        decimals={tokenInfo.decimals}
                        symbol={tokenInfo.symbol}
                        precision={6}
                      />
                    ) : (
                      <Text>*****</Text>
                    )}
                  </Flex>
                  <Flex mt={2}>
                    <Text>{t("TokenDetail:private")}:&nbsp;</Text>
                    <Flex flexDir={"column"}>
                      {loadingBalance ? (
                        <Spinner w={2} h={2} />
                      ) : showBalance ? (
                        <TokenNum
                          amount={balance?.privateBalance}
                          decimals={tokenInfo.decimals}
                          symbol={tokenInfo.symbol}
                          precision={6}
                        />
                      ) : (
                        <Text>*****</Text>
                      )}
                    </Flex>
                  </Flex>
                  <Flex mt={2}>
                    <Text>{t("TokenDetail:total")}:&nbsp;</Text>
                    <Flex flexDir={"column"}>
                      {loadingBalance ? (
                        <Spinner w={2} h={2} />
                      ) : showBalance ? (
                        <TokenNum
                          amount={balance?.total}
                          decimals={tokenInfo.decimals}
                          symbol={tokenInfo.symbol}
                          precision={6}
                        />
                      ) : (
                        <Text>*****</Text>
                      )}
                      {/* {!!recordStr && !!tokenRecords[0] && ( */}
                      {/*  <Flex> */}
                      {/*    (<Text>{recordStr}</Text>&nbsp; */}
                      {/*    <TokenNum */}
                      {/*      amount={recordAmount} */}
                      {/*      decimals={tokenInfo.decimals} */}
                      {/*      symbol={tokenInfo.symbol} */}
                      {/*    /> */}
                      {/*    ) */}
                      {/*  </Flex> */}
                      {/* )} */}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              {/* todo: cash value */}
            </Flex>
          </Box>
        ) : (
          <Flex fontSize={"smaller"}>
            <Text>{t("TokenDetail:balance")}:&nbsp;</Text>
            <Text>{showBalance ? balanceStr : "*****"}</Text>
          </Flex>
        )}
        {/* send and receive */}
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
      {/* Transaction Records */}
      <Divider orientation="horizontal" h={"1px"} />
      <Flex direction={"column"} px={5} py={2.5}>
        <Text fontWeight={"bold"}>{t("TokenDetail:tx_records")}</Text>
        {loading ? (
          <Spinner w={6} h={6} alignSelf={"center"} mt={10} />
        ) : history.length > 0 ? (
          <Flex
            ref={listRef}
            direction={"column"}
            maxH={isAleo ? 270 : 330}
            overflowY="auto"
            sx={HIDE_SCROLL_BAR_CSS}
          >
            {loadingLocalTxs && (
              <Spinner w={6} h={6} alignSelf={"center"} mt={10} />
            )}
            {renderTxHistory}
            {loadingOnChainTxs && (
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

import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Divider, Flex, Text } from "@chakra-ui/react";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";
import { useLocationParams } from "@/hooks/useLocationParams";
import { useCallback, useMemo } from "react";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  type AleoHistoryItem,
  AleoHistoryType,
} from "core/coins/ALEO/types/History";
import type { TransactionHistoryItem } from "core/types/TransactionHistory";
import { TransactionStatus } from "core/types/TransactionStatus";
import dayjs from "dayjs";
import {
  IconCopyBlack,
  IconFailed,
  IconProcessing,
  IconSuccess,
} from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { BigNumber, ethers } from "ethers";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useTransactionDetail } from "@/hooks/useTransactionDetail";
import { useCoinService } from "@/hooks/useCoinService";
import browser from "webextension-polyfill";
import { simplifyAleoTxStatus } from "core/coins/ALEO/utils/utils";
import {
  AleoRecordMethod,
  AleoTransferMethod,
} from "core/coins/ALEO/types/TransferMethod";

type InfoAProps = {
  title: string;
  info: string;
  isHasCopy?: boolean;
  onClick?: () => void;
  textDecoration?: string;
};

const DetailInfoA = (props: InfoAProps) => {
  const {
    title,
    info,
    isHasCopy = false,
    onClick: onParamClick,
    ...rest
  } = props;
  const { showToast } = useCopyToast();

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(info);
    showToast();
  }, [info, showToast]);

  const onClick = useCallback(async () => {
    if (onParamClick) {
      onParamClick();
      return;
    }
    onCopy();
  }, [onCopy, onParamClick]);

  return (
    <Flex direction={"column"}>
      <Text textColor={"#777e90"} fontSize={"12px"}>
        {title}
      </Text>
      <Flex align={"center"} justifyContent={"space-between"} mb={2}>
        <Text
          flex={1}
          fontSize={"12px"}
          cursor={"pointer"}
          onClick={onClick}
          overflow={"hidden"}
          fontWeight={"bold"}
          {...rest}
        >
          {info}
        </Text>
        {isHasCopy && (
          <Flex
            ml={2}
            justifyContent={"center"}
            alignItems={"center"}
            w={"22px"}
            h={"22px"}
            bg={"#E6E8EC"}
            borderRadius={"11px"}
            cursor={"pointer"}
            onClick={onCopy}
          >
            <IconCopyBlack />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

type InfoBProps = {
  title: string;
  info: string;
};

const DetailInfoB = (props: InfoBProps) => {
  const { title, info } = props;
  const { showToast } = useCopyToast();

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(info);
    showToast();
  }, [info, showToast]);

  return (
    <Flex
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      fontSize={"12px"}
      height={"28px"}
      cursor={"pointer"}
      onClick={onCopy}
    >
      <Text color={"#777E90"}>{title}</Text>
      <Text fontWeight={"bold"}>{info}</Text>
    </Flex>
  );
};

enum TxIconStatus {
  Success = "Success",
  Failed = "Failed",
  Pending = "pending",
}

const TransactionDetailScreen = () => {
  const { t } = useTranslation();
  const { uniqueId, address } = useSafeParams();
  const { tokenInfo } = useSafeTokenInfo(uniqueId, address);
  const txItem = useLocationParams("txItem");
  // console.log("      txItem", txItem);
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);

  const isAleo = useMemo(() => {
    return uniqueId === InnerChainUniqueId.ALEO_MAINNET;
  }, [uniqueId]);

  const { historyDetail, historyTxType, historyTxStatusStr, historyTxStatus } =
    useMemo(() => {
      if (!txItem) {
        return { isSuccess: false };
      }
      try {
        let tx;
        let txId, from, to, nonce;
        let amount;
        let txStatusStr = "";
        let txStatus;
        let txType;
        let txFees;
        let txConfirmations;
        let timestamp = 0;
        let status;
        let label;
        let height = 0;

        if (isAleo) {
          tx = JSON.parse(txItem) as AleoHistoryItem;
          // console.log("      tx", tx);

          txId = tx.txId;
          amount = tx.amount ? BigInt(tx.amount) : undefined;
          txType = `${tx.functionName.split("_").join(" ")}`;
          timestamp = tx.timestamp;

          if (tx.type === AleoHistoryType.LOCAL) {
            switch (tx.functionName) {
              case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
                from = address;
                to = tx.inputs[0];
                break;
              }
              case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
                from = address;
                to = tx.inputs[1];
                break;
              }
              case AleoTransferMethod.PUBLIC: {
                from = address;
                to = tx.inputs[0];
                break;
              }
              case AleoTransferMethod.PRIVATE: {
                from = address;
                to = tx.inputs[1];
                break;
              }
              case AleoRecordMethod.SPLIT:
              case AleoRecordMethod.JOIN: {
                from = address;
                to = address;
                amount = 0n;
                break;
              }
            }
          } else {
            from = tx.from;
            to = tx.to;
          }

          const { txStatus: simplifiedStatus } = simplifyAleoTxStatus(
            tx.status,
          );
          txStatusStr = tx.status;
          txStatus = simplifiedStatus;
        } else {
          tx = JSON.parse(txItem) as TransactionHistoryItem;
          // console.log("      tx", tx);

          txId = tx.id;
          from = tx.from;
          to = tx.to;
          amount = BigInt(tx.value ?? "0");
          txFees = tx.fees;
          txConfirmations = tx.confirmations;
          nonce = String(tx.nonce ?? "");
          timestamp = tx.timestamp;
          status = tx.status;
          label = tx.label;
          height = tx.height;
          txType = label
            ? t(`TokenDetail:${tx.label}`)
            : from === address
            ? t(`TokenDetail:send`)
            : t(`TokenDetail:receive`);

          switch (status) {
            case TransactionStatus.SUCCESS: {
              txStatus = TxIconStatus.Success;
              txStatusStr = t("Common:success");
              break;
            }
            case TransactionStatus.PENDING: {
              txStatus = TxIconStatus.Pending;
              txStatusStr = t("Common:pending");
              break;
            }
            case TransactionStatus.FAILED: {
              txStatus = TxIconStatus.Failed;
              txStatusStr = t("Common:failed");
              break;
            }
            default: {
              break;
            }
          }
        }

        return {
          historyDetail: {
            id: txId,
            from,
            to,
            value: amount,
            fees: txFees,
            confirmations: txConfirmations,
            timestamp,
            nonce,
            status,
            label,
            height,
          },
          historyTxType: txType,
          historyTxStatusStr: txStatusStr,
          historyTxStatus: txStatus,
        };
      } catch (e) {
        console.error(e);
        return { isSuccess: false };
      }
    }, [address, isAleo, t, txItem]);

  const txId = historyDetail?.id;

  const { data: networkTxDetail } = useTransactionDetail({
    uniqueId,
    address,
    txId,
    token: tokenInfo,
  });
  console.log("      txDetail", networkTxDetail);

  const txDetail = useMemo(() => {
    return {
      ...historyDetail,
      ...networkTxDetail,
    };
  }, [historyDetail, networkTxDetail]);

  const from = txDetail.from;
  const to = txDetail.to;
  const nonce = txDetail.nonce !== undefined ? String(txDetail.nonce) : "";

  const isSend = from === address;

  const txType = useMemo(() => {
    if (isAleo) {
      return historyTxType;
    }
    if (txDetail.label) {
      return t(`TokenDetail:${txDetail.label}`);
    }
    return isSend ? t(`TokenDetail:send`) : t(`TokenDetail:receive`);
  }, [historyTxType, isAleo, isSend, t, txDetail.label]);

  const txStatusStr = useMemo(() => {
    if (isAleo) {
      return historyTxStatusStr;
    }
    switch (txDetail.status) {
      case TransactionStatus.SUCCESS:
        return t("Common:success");
      case TransactionStatus.PENDING:
        return t("Common:pending");
      case TransactionStatus.FAILED:
        return t("Common:failed");
      default:
        return "";
    }
  }, [historyTxStatusStr, isAleo, t, txDetail.status]);

  const txStatus = useMemo(() => {
    if (isAleo) {
      return historyTxStatus;
    }
    switch (txDetail.status) {
      case TransactionStatus.SUCCESS:
        return TxIconStatus.Success;
      case TransactionStatus.PENDING:
        return TxIconStatus.Pending;
      case TransactionStatus.FAILED:
        return TxIconStatus.Failed;
      default:
        return undefined;
    }
  }, [historyTxStatus, isAleo, txDetail.status]);

  const time = useMemo(() => {
    if (!txDetail.timestamp) {
      return undefined;
    }
    const timeOfItem = dayjs(txDetail.timestamp);
    const isCurrentYear = dayjs().year() === timeOfItem.year();
    return timeOfItem.format(isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT");
  }, [txDetail.timestamp]);

  const amountStr = useMemo(() => {
    if (txDetail.value === undefined) {
      return "";
    }
    const amount = BigInt(txDetail.value);
    const valueStr = ethers.utils.formatUnits(
      BigNumber.from(amount),
      tokenInfo.decimals,
    );
    const addOrMinus = amount === 0n ? "" : isSend ? `- ` : `+ `;
    return `${addOrMinus}${valueStr} ${tokenInfo.symbol}`;
  }, [isSend, tokenInfo.decimals, tokenInfo.symbol, txDetail.value]);

  const feeStr = useMemo(() => {
    const feeValue = txDetail.fees;
    const fee =
      feeValue !== undefined
        ? ethers.utils.formatUnits(
            BigNumber.from(feeValue),
            nativeCurrency.decimals,
          )
        : undefined;
    if (fee) {
      return `${fee} ${nativeCurrency.symbol}`;
    }
    return undefined;
  }, [nativeCurrency, txDetail.fees]);

  const confirmationsStr = useMemo(() => {
    const confirmations = txDetail.confirmations;
    if (!confirmations) {
      return undefined;
    }
    return String(confirmations);
  }, [txDetail.confirmations]);

  const onHash = useCallback(() => {
    if (txId) {
      const url = coinService.getTxDetailUrl(txId);
      void browser.tabs.create({ url });
    }
  }, [coinService, txId]);

  const renderDetailA = useMemo(() => {
    return (
      <Flex direction={"column"}>
        {/* hash */}
        {txId && (
          <DetailInfoA
            title={t("TransactionDetail:hash")}
            info={txId}
            isHasCopy={true}
            textDecoration={"underline"}
            onClick={onHash}
          />
        )}
        {/* from */}
        {from && (
          <DetailInfoA title={t("TransactionDetail:from")} info={from} />
        )}
        {/* to */}
        {to && <DetailInfoA title={t("TransactionDetail:to")} info={to} />}
      </Flex>
    );
  }, [from, onHash, t, to, txId]);

  const renderDetailB = useMemo(() => {
    return (
      <Flex direction={"column"} mt={1}>
        {/* {amountStr && ( */}
        {/*  <DetailInfoB title={t("TransactionDetail:value")} info={amountStr} /> */}
        {/* )} */}
        <DetailInfoB
          title={t("TransactionDetail:type")}
          info={txType ?? "----"}
        />
        <DetailInfoB
          title={t("TransactionDetail:time")}
          info={time ?? "----"}
        />
        <DetailInfoB
          title={t("TransactionDetail:gasFee")}
          info={feeStr ?? "----"}
        />
        {confirmationsStr && (
          <DetailInfoB
            title={t("TransactionDetail:confirmations")}
            info={confirmationsStr}
          />
        )}
        {nonce && (
          <DetailInfoB title={t("TransactionDetail:nonce")} info={nonce} />
        )}
        <DetailInfoB
          title={t("TransactionDetail:network")}
          info={chainConfig.chainName}
        />
      </Flex>
    );
  }, [chainConfig.chainName, feeStr, nonce, t, time, confirmationsStr, txType]);

  return (
    <PageWithHeader title="Transaction Detail">
      <Content>
        <Flex direction={"column"} alignItems={"center"}>
          {txStatus === TxIconStatus.Success ? (
            <IconSuccess />
          ) : txStatus === TxIconStatus.Pending ? (
            <IconProcessing />
          ) : (
            <IconFailed />
          )}
          <Text fontSize={"12px"} pt={1}>
            {txStatusStr}
          </Text>
          {amountStr && (
            <Flex fontWeight={"bold"} fontSize={18} mt={"10px"}>
              <Text>{amountStr}</Text>
            </Flex>
          )}
        </Flex>
        {renderDetailA}
        <Divider h={"1px"} />
        {renderDetailB}
      </Content>
    </PageWithHeader>
  );
};

export default TransactionDetailScreen;

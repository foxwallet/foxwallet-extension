import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Divider, Flex, Text } from "@chakra-ui/react";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";
import { useLocationParams } from "@/hooks/useLocationParams";
import React, { useCallback, useMemo } from "react";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import {
  type AleoHistoryItem,
  AleoHistoryType,
  AleoTxAddressType,
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
import { AleoTxStatus } from "core/coins/ALEO/types/Transaction";

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

  const {
    tx,
    from,
    to,
    txId,
    time,
    amountStr,
    isSend,
    nonce,
    txStatusStr,
    txStatus,
    txType,
  } = useMemo(() => {
    if (!txItem) {
      return { isSuccess: false };
    }
    try {
      let tx;
      let txId, from, to, nonce;
      let amount;
      let isSend = false;
      let txStatusStr = "";
      let txStatus;
      let txType;

      if (isAleo) {
        tx = JSON.parse(txItem) as AleoHistoryItem;
        // console.log("      tx", tx);

        txId = tx.txId;
        amount = tx.amount ? BigInt(tx.amount) : undefined;
        isSend = tx.addressType === AleoTxAddressType.SEND;

        const prefix = "transfer_";
        const functionName = tx.functionName.startsWith(prefix)
          ? tx.functionName.slice(prefix.length)
          : tx.functionName;
        txType = `${functionName.split("_").join(" ")}`;

        if (tx.type === AleoHistoryType.LOCAL) {
          if (isSend) {
            from = address;
            to = tx.inputs[0];
          } else {
            from = tx.inputs[0];
          }
        } else {
          from = tx.from;
          to = tx.to;
        }
        if (tx.functionName === "join" || tx.functionName === "split") {
          from = address;
          to = address;
          amount = 0n;
        }
        switch (tx.status) {
          case AleoTxStatus.FINALIZD:
          case AleoTxStatus.COMPLETED: {
            txStatus = TxIconStatus.Success;
            txStatusStr = t("Common:success");
            break;
          }
          case AleoTxStatus.QUEUED:
          case AleoTxStatus.GENERATING_TRANSACTION:
          case AleoTxStatus.GENERATING_PROVER_FILES:
          case AleoTxStatus.BROADCASTING: {
            txStatus = TxIconStatus.Pending;
            txStatusStr = tx.status;
            break;
          }
          case AleoTxStatus.REJECTED:
          case AleoTxStatus.FAILED:
          case AleoTxStatus.UNACCEPTED: {
            txStatus = TxIconStatus.Failed;
            txStatusStr = t("Common:failed");
            break;
          }
          default: {
            break;
          }
        }
      } else {
        tx = JSON.parse(txItem) as TransactionHistoryItem;
        txId = tx.id;
        from = tx.from;
        to = tx.to;
        amount = BigInt(tx.value ?? "0");
        isSend = tx.from === address;
        nonce = String(tx.nonce ?? "");
        txType = t(`TokenDetail:${tx.label}`);

        switch (tx.status) {
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

      const timeOfItem = dayjs(tx.timestamp);
      const isCurrentYear = dayjs().year() === timeOfItem.year();
      const time = timeOfItem.format(
        isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT",
      );

      const valueStr =
        amount !== undefined
          ? ethers.utils.formatUnits(BigNumber.from(amount), tokenInfo.decimals)
          : "";
      const addOrMinus =
        amount === undefined ? "" : amount === 0n ? "" : isSend ? `- ` : `+ `;

      const amountStr =
        amount !== undefined
          ? `${addOrMinus}${valueStr} ${tokenInfo.symbol}`
          : "";

      return {
        tx,
        from,
        to,
        txId,
        time,
        amountStr,
        isSend,
        nonce,
        txStatusStr,
        txStatus,
        txType,
      };
    } catch (e) {
      console.error(e);
      return { isSuccess: false };
    }
  }, [address, isAleo, t, tokenInfo, txItem]);

  const { data: txDetail } = useTransactionDetail({
    uniqueId,
    address,
    txId,
    token: tokenInfo,
  });
  console.log("      txDetail", txDetail);

  const feeStr = useMemo(() => {
    const fee = txDetail?.fees
      ? ethers.utils.formatUnits(
          BigNumber.from(txDetail?.fees),
          nativeCurrency.decimals,
        )
      : undefined;
    if (fee) {
      return `${fee} ${nativeCurrency.symbol}`;
    }
    return undefined;
  }, [nativeCurrency, txDetail?.fees]);

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
        {txDetail?.confirmations && (
          <DetailInfoB
            title={t("TransactionDetail:confirmations")}
            info={String(txDetail?.confirmations ?? "----")}
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
  }, [
    chainConfig.chainName,
    feeStr,
    nonce,
    t,
    time,
    txDetail?.confirmations,
    txType,
  ]);

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

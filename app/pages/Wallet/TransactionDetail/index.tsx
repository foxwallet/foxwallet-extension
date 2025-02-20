import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Divider, Flex, Text } from "@chakra-ui/react";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";
import { useLocationParams } from "@/hooks/useLocationParams";
import React, { useCallback, useMemo } from "react";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import type { AleoHistoryItem } from "core/coins/ALEO/types/History";
import type { TransactionHistoryItem } from "core/types/TransactionHistory";
import { TransactionStatus } from "core/types/TransactionStatus";
import dayjs from "dayjs";
import {
  IconCopyBlack,
  IconFailed,
  IconSuccess,
} from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { BigNumber, ethers } from "ethers";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useTransactionDetail } from "@/hooks/useTransactionDetail";
import { useCoinService } from "@/hooks/useCoinService";

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
      return onParamClick;
    }
    return onCopy();
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

const TransactionDetailScreen = () => {
  const { t } = useTranslation();
  const { uniqueId, address } = useSafeParams();
  const { tokenInfo } = useSafeTokenInfo(uniqueId, address);
  const txItem = useLocationParams("txItem");
  // console.log("      tokenInfo", tokenInfo);
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);

  const isAleo = useMemo(() => {
    return uniqueId === InnerChainUniqueId.ALEO_MAINNET;
  }, [uniqueId]);

  const { tx, isSuccess, from, to, txId, time, amountStr, isSend, nonce } =
    useMemo(() => {
      if (!txItem) {
        return { isSuccess: false };
      }
      try {
        let tx;
        let isSuccess = false;
        let txId, from, to, nonce;
        let amount = 0n;
        let isSend = false;

        if (isAleo) {
          tx = JSON.parse(txItem) as AleoHistoryItem;
          isSuccess = false;
          txId = tx.txId;
          amount = BigInt(tx.amount ?? "0");
          // todo
        } else {
          tx = JSON.parse(txItem) as TransactionHistoryItem;
          isSuccess = tx.status === TransactionStatus.SUCCESS;
          txId = tx.id;
          from = tx.from;
          to = tx.to;
          amount = BigInt(tx.value ?? "0");
          isSend = tx.from === address;
          nonce = String(tx.nonce ?? "");
        }

        const timeOfItem = dayjs(tx.timestamp);
        const isCurrentYear = dayjs().year() === timeOfItem.year();
        const time = timeOfItem.format(
          isCurrentYear ? "MM-DD LT" : "YYYY-MM-DD LT",
        );

        const valueStr = ethers.utils.formatUnits(
          BigNumber.from(amount),
          tokenInfo.decimals,
        );

        const addOrMinus = amount === 0n ? "" : isSend ? `- ` : `+ `;

        const amountStr = `${addOrMinus}${valueStr} ${tokenInfo.symbol}`;
        // console.log("      amountStr", valueStr);

        return {
          tx,
          isSuccess,
          from,
          to,
          txId,
          time,
          amountStr,
          isSend,
          nonce,
        };
      } catch (e) {
        console.error(e);
        return { isSuccess: false };
      }
    }, [address, isAleo, tokenInfo, txItem]);
  // console.log("      tx", tx);

  // const [txDetail, setTxDetail] = useState<
  //   | NativeCoinTxDetailRes<CoinType.ETH>
  //   | TokenTxDetailRes<CoinType.ETH>
  //   | undefined
  // >(undefined);
  // useEffect(() => {
  //   const getTxDetail = async () => {
  //     let res;
  //     if (tokenInfo.type === AssetType.COIN) {
  //       if (coinService.supportNativeCoinTxDetail() && txId) {
  //         res = await coinService.getNativeCoinTxDetail({
  //           txId,
  //           filter: { address },
  //         });
  //       }
  //     } else {
  //       if (coinService.supportTokenTxDetail() && txId) {
  //         res = await coinService.getTokenTxDetail({
  //           txId,
  //           token: tokenInfo,
  //           filter: { address },
  //         });
  //       }
  //     }
  //     setTxDetail(res);
  //   };
  //   if (!txDetail) {
  //     getTxDetail();
  //   }
  // }, [address, coinService, tokenInfo, txDetail, txId]);

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

  const renderDetailA = useMemo(() => {
    return (
      <Flex direction={"column"}>
        {/* hash */}
        <DetailInfoA
          title={t("TransactionDetail:hash")}
          info={txId ?? ""}
          isHasCopy={true}
          textDecoration={"underline"}
          onClick={() => {}}
        />
        {/* from */}
        <DetailInfoA title={t("TransactionDetail:from")} info={from ?? ""} />
        {/* to */}
        <DetailInfoA title={t("TransactionDetail:to")} info={to ?? ""} />
      </Flex>
    );
  }, [from, t, to, txId]);

  const renderDetailB = useMemo(() => {
    return (
      <Flex direction={"column"} mt={1}>
        {amountStr && (
          <DetailInfoB title={t("TransactionDetail:value")} info={amountStr} />
        )}
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
    amountStr,
    chainConfig.chainName,
    feeStr,
    nonce,
    t,
    time,
    txDetail?.confirmations,
  ]);

  return (
    <PageWithHeader title="Transaction Detail">
      <Content>
        <Flex direction={"column"} alignItems={"center"}>
          {isSuccess ? <IconSuccess /> : <IconFailed />}
          <Text fontSize={"12px"} pt={1}>
            {isSuccess ? t("Common:success") : t("Common:failed")}
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

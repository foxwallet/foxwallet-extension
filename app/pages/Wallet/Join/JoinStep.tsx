import { showErrorToast } from "@/components/Custom/ErrorToast";
import { IconChevronRight } from "@/components/Custom/Icon";
import { WarningArea } from "@/components/Custom/WarningArea";
import { showSelectFeeTypeDialog } from "@/components/Send/SelectFeeType";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useAleoBalance } from "@/hooks/useAleoBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  AleoRecordMethod,
  AleoTransferMethod,
} from "core/coins/ALEO/types/TransferMethod";
import { ChainUniqueId, InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AleoGasFee } from "core/types/GasFee";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBalance } from "@/hooks/useBalance";

export interface JoinStepProps {
  selectedRecords: RecordDetailWithSpent[];
  records: RecordDetailWithSpent[];
  onConfirm: (params: {
    feeRecord?: RecordDetailWithSpent;
    gasFee: AleoGasFee;
  }) => void;
}

export const JoinStep = (props: JoinStepProps) => {
  const { selectedRecords, onConfirm, records } = props;

  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  // TODO: get uniqueId from chain mode or page params
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;

  const { nativeCurrency, coinService } = useCoinService(uniqueId);
  const { t } = useTranslation();
  // const { balance, loadingBalance } = useAleoBalance({
  //   uniqueId,
  //   programId: NATIVE_TOKEN_PROGRAM_ID,
  //   address: selectedAccount.account.address,
  // });

  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.account.address,
  });

  const [feeInfo, setFeeInfo] = useState<AleoGasFee | null>(null);
  const gasFee = useMemo(() => {
    if (!feeInfo) {
      return 0n;
    }
    return feeInfo.baseFee + feeInfo.priorityFee;
  }, [feeInfo]);
  const [loadingGasFee, setLoadingGasFee] = useState(false);
  const gasFeeEstimated = !loadingGasFee && gasFee > 0n;
  const getGasFee = useCallback(
    async (method: AleoRecordMethod) => {
      setLoadingGasFee(true);
      try {
        const { baseFee, priorityFee } = await coinService.getGasFee(
          NATIVE_TOKEN_PROGRAM_ID,
          method,
        );
        setFeeInfo({ baseFee, priorityFee });
      } catch (err) {
        setFeeInfo(null);
        void showErrorToast({ message: (err as Error).message });
      } finally {
        setLoadingGasFee(false);
      }
    },
    [coinService],
  );
  useEffect(() => {
    void getGasFee(AleoRecordMethod.JOIN);
  }, []);

  // fee record
  const defaultFeeRecord: RecordDetailWithSpent | undefined = useMemo(() => {
    return records.filter(
      (item) =>
        !selectedRecords.some(
          (record) => record.commitment === item.commitment,
        ),
    )[0];
  }, [selectedRecords, records]);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<
    RecordDetailWithSpent | undefined
  >();
  const currFeeRecord = selectedFeeRecord ?? defaultFeeRecord;

  // fee type
  const defaultFeeType = useMemo(() => {
    if (!gasFeeEstimated) {
      return AleoFeeMethod.FEE_PUBLIC;
    }
    if (!loadingBalance && balance?.publicBalance) {
      if (balance.publicBalance > gasFee) {
        return AleoFeeMethod.FEE_PUBLIC;
      }
    }
    if (!currFeeRecord) {
      return AleoFeeMethod.FEE_PUBLIC;
    }
    try {
      const amount = BigInt(currFeeRecord.parsedContent?.microcredits);
      const valid = amount > gasFee;
      return valid ? AleoFeeMethod.FEE_PRIVATE : AleoFeeMethod.FEE_PUBLIC;
    } catch (err) {
      console.log(err);
      return AleoFeeMethod.FEE_PRIVATE;
    }
  }, [currFeeRecord, gasFeeEstimated, balance, loadingBalance]);
  const [selectedFeeType, setSelectedFeeType] = useState<AleoFeeMethod | null>(
    null,
  );
  const currFeeType: AleoFeeMethod = selectedFeeType ?? defaultFeeType;
  const onSelectFeeType = useCallback(async () => {
    if (!balance) {
      return;
    }
    let recordList = [...records];
    recordList = recordList.filter(
      (item) =>
        !selectedRecords.some(
          (record) => record.commitment === item.commitment,
        ),
    );
    const { data } = await showSelectFeeTypeDialog({
      balance,
      selectedFeeMethod: currFeeType,
      selectedFeeRecord: currFeeRecord,
      recordList,
      nativeCurrency,
    });
    if (data) {
      setSelectedFeeType(AleoFeeMethod.FEE_PRIVATE);
      setSelectedFeeRecord(data);
    } else {
      setSelectedFeeType(AleoFeeMethod.FEE_PUBLIC);
      setSelectedFeeRecord(undefined);
    }
  }, [
    balance,
    currFeeType,
    currFeeRecord,
    records,
    selectedRecords,
    nativeCurrency,
  ]);

  const gasFeeValid = useMemo(() => {
    if (!gasFeeEstimated) {
      return true;
    }
    switch (currFeeType) {
      case AleoFeeMethod.FEE_PUBLIC: {
        if (!loadingBalance && balance?.publicBalance) {
          return balance.publicBalance > gasFee;
        }
        return false;
      }
      case AleoFeeMethod.FEE_PRIVATE: {
        if (!currFeeRecord) {
          return false;
        }
        try {
          const amount = currFeeRecord.parsedContent?.microcredits;
          if (amount) {
            const valid = BigInt(amount) > gasFee;
            return valid;
          }
          return false;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    }
  }, [gasFeeEstimated, currFeeType, loadingBalance, balance, currFeeRecord]);

  const errorInfo = useMemo(() => {
    if (!gasFeeValid) {
      return t("Send:insufficientFee");
    }
    return "";
  }, [gasFeeValid, t]);

  const onSubmit = useCallback(() => {
    if (!feeInfo) {
      return;
    }
    onConfirm({
      feeRecord:
        currFeeType === AleoFeeMethod.FEE_PRIVATE ? currFeeRecord : undefined,
      gasFee: feeInfo,
    });
  }, [currFeeRecord, feeInfo]);

  return (
    <Content>
      <Flex justify={"space-between"}>
        <Text>{t("JoinSplit:join")}</Text>
        <Flex flexDir={"column"} fontWeight={"bold"}>
          <TokenNum
            amount={selectedRecords[0]?.parsedContent?.microcredits}
            decimals={nativeCurrency.decimals}
            precision={nativeCurrency.decimals}
            symbol={nativeCurrency.symbol}
          />
          <TokenNum
            amount={selectedRecords[1]?.parsedContent?.microcredits}
            decimals={nativeCurrency.decimals}
            precision={nativeCurrency.decimals}
            symbol={nativeCurrency.symbol}
          />
        </Flex>
      </Flex>
      <Flex justify={"space-between"} mt={2}>
        <Text>{t("Common:total")}</Text>
        <TokenNum
          fontWeight={"bold"}
          amount={
            (selectedRecords[0]?.parsedContent?.microcredits ?? 0n) +
            (selectedRecords[1]?.parsedContent?.microcredits ?? 0n)
          }
          decimals={nativeCurrency.decimals}
          precision={nativeCurrency.decimals}
          symbol={nativeCurrency.symbol}
        />
      </Flex>
      <Flex mt={4} flexDir={"column"}>
        <Text>{t("Send:gasFee")}</Text>
        <Flex
          borderStyle={"solid"}
          borderColor={"gray.50"}
          borderWidth={"1.5px"}
          borderRadius={"lg"}
          px={4}
          py={3}
          mt={2}
        >
          <TokenNum
            amount={gasFee}
            decimals={nativeCurrency.decimals}
            symbol={nativeCurrency.symbol}
          />
        </Flex>
        <Flex fontSize={"small"} color={"gray.500"} flex={1}>
          {currFeeType === AleoFeeMethod.FEE_PRIVATE ? (
            <Flex onClick={onSelectFeeType} mt={2} flex={1}>
              {currFeeRecord ? (
                <Flex>
                  {t("Send:payPrivateRecord")}&nbsp; (
                  <TokenNum
                    amount={currFeeRecord.parsedContent?.microcredits || 0n}
                    decimals={nativeCurrency.decimals}
                    symbol={nativeCurrency.symbol}
                  />
                  )
                </Flex>
              ) : (
                <Text>{t("Send:noRecord")}</Text>
              )}
              <IconChevronRight w={4} h={4} />
            </Flex>
          ) : (
            <Flex
              onClick={onSelectFeeType}
              mt={2}
              justify={"space-between"}
              align={"center"}
              flex={1}
            >
              <Text>{t("Send:payPublicBalance")}</Text>
              <IconChevronRight w={4} h={4} />
            </Flex>
          )}
        </Flex>
      </Flex>
      {!!errorInfo && <WarningArea content={errorInfo} container={{ mt: 2 }} />}
      <Button
        position={"absolute"}
        left={"5"}
        right={"5"}
        bottom={10}
        onClick={onSubmit}
        isDisabled={selectedRecords.length < 2 || !gasFeeValid}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};

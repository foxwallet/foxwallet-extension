import { showErrorToast } from "@/components/Custom/ErrorToast";
import { IconChevronRight } from "@/components/Custom/Icon";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { WarningArea } from "@/components/Custom/WarningArea";
import { showSelectFeeTypeDialog } from "@/components/Send/SelectFeeType";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useRecords } from "@/hooks/useRecord";
import { Content } from "@/layouts/Content";
import { Button, Divider, Flex, Text } from "@chakra-ui/react";
import {
  NATIVE_TOKEN_PROGRAM_ID,
  NATIVE_TOKEN_TOKEN_ID,
} from "core/coins/ALEO/constants";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  AleoRecordMethod,
  AleoTransferMethod,
} from "core/coins/ALEO/types/TransferMethod";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AleoGasFee } from "core/types/GasFee";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBalance } from "@/hooks/useBalance";
import { type TokenV2 } from "core/types/Token";
import { type AleoService } from "core/coins/ALEO/service/AleoService";
import { type Balance } from "@/hooks/useAleoBalance";
import { type InnerProgramId } from "core/coins/ALEO/types/ProgramId";

interface GasFeeProps {
  receiverAddress: string;
  amountNum: bigint;
  transferMethod: AleoTransferMethod;
  transferRecord?: RecordDetailWithSpent;
  token: TokenV2;
  onConfirm: (params: {
    receiverAddress: string;
    amountNum: bigint;
    token: TokenV2;
    transferMethod: AleoTransferMethod;
    transferRecord?: RecordDetailWithSpent;
    feeType: AleoFeeMethod;
    feeRecord?: RecordDetailWithSpent;
    gasFee: AleoGasFee;
  }) => void;
}

export const GasFeeStep = (props: GasFeeProps) => {
  const {
    receiverAddress,
    amountNum,
    transferMethod,
    transferRecord,
    onConfirm,
    token,
  } = props;

  const recordAmount =
    token.tokenId === NATIVE_TOKEN_TOKEN_ID
      ? transferRecord?.parsedContent?.microcredits
      : transferRecord?.parsedContent?.amount;

  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  // TODO: get uniqueId from chain mode or page params
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;

  const { coinService, nativeCurrency, chainConfig } = useCoinService(uniqueId);

  const { balance: coinBalance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.account.address,
    refreshInterval: 10000,
  });

  const balance: Balance = useMemo(() => {
    return {
      total: coinBalance?.total ?? 0n,
      publicBalance: coinBalance?.publicBalance ?? 0n,
      privateBalance: coinBalance?.privateBalance ?? 0n,
    };
  }, [coinBalance]);

  const { balance: tokenBalance, loadingBalance: loadingTokenBalance } =
    useBalance({
      uniqueId,
      address: selectedAccount.account.address,
      refreshInterval: 10000,
      token,
    });

  const { records, loading: loadingRecords } = useRecords({
    uniqueId,
    address: selectedAccount.account.address,
  });
  const { t } = useTranslation();

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
    async (method: AleoTransferMethod) => {
      setLoadingGasFee(true);
      try {
        const { baseFee, priorityFee } = await (
          coinService as AleoService
        ).getGasFee(
          (token.programId ?? NATIVE_TOKEN_PROGRAM_ID) as InnerProgramId,
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
    [coinService, token],
  );
  useEffect(() => {
    void getGasFee(transferMethod);
  }, [getGasFee, transferMethod]);

  // fee record
  const defaultFeeRecord = useMemo(() => {
    if (loadingRecords) {
      return undefined;
    }
    switch (transferMethod) {
      case AleoTransferMethod.PRIVATE:
      case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
        if (!transferRecord) {
          return undefined;
        }
        for (const record of records) {
          if (record.commitment === transferRecord.commitment) {
            continue;
          }
          return record;
        }
        return undefined;
      }
      case AleoTransferMethod.PUBLIC:
      case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
        return records[0];
      }
    }
  }, [transferRecord, loadingRecords, records, transferMethod]);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<
    RecordDetailWithSpent | undefined
  >();
  const currFeeRecord = selectedFeeRecord ?? defaultFeeRecord;

  const isPrivateMethod: boolean = useMemo(() => {
    return transferMethod.startsWith("transfer_private");
  }, [transferMethod]);

  // fee type
  const defaultFeeType = useMemo(() => {
    if (!gasFeeEstimated) {
      return AleoFeeMethod.FEE_PUBLIC;
    }
    if (!loadingBalance && balance?.publicBalance) {
      // 如果 public 余额足够，那么默认用 public 余额
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
  }, [gasFeeEstimated, loadingBalance, balance, currFeeRecord, gasFee]);
  const [selectedFeeType, setSelectedFeeType] = useState<AleoFeeMethod | null>(
    null,
  );
  const currFeeType: AleoFeeMethod = selectedFeeType ?? defaultFeeType;
  const onSelectFeeType = useCallback(async () => {
    if (!balance) {
      return;
    }
    let recordList = [...records];
    if (isPrivateMethod && transferRecord) {
      recordList = recordList.filter(
        (item) => item.commitment !== transferRecord.commitment,
      );
    }
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
    isPrivateMethod,
    transferRecord,
    nativeCurrency,
  ]);

  const gasFeeValid = useMemo(() => {
    if (!gasFeeEstimated) {
      return true;
    }
    switch (currFeeType) {
      case AleoFeeMethod.FEE_PUBLIC: {
        if (!loadingBalance && balance?.publicBalance) {
          // 如果 public 余额足够，那么默认用 public 余额
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
  }, [
    gasFeeEstimated,
    currFeeType,
    loadingBalance,
    balance.publicBalance,
    gasFee,
    currFeeRecord,
  ]);

  const transferMethodMap = useMemo(() => {
    return {
      [AleoTransferMethod.PUBLIC]: {
        title: t("Send:publicTransfer"),
      },
      [AleoTransferMethod.PUBLIC_TO_PRIVATE]: {
        title: t("Send:publicToPrivate"),
      },
      [AleoTransferMethod.PRIVATE]: {
        title: t("Send:privateTransfer"),
      },
      [AleoTransferMethod.PRIVATE_TO_PUBLIC]: {
        title: t("Send:privateToPublic"),
      },
      [AleoRecordMethod.SPLIT]: {
        title: t("JoinSplit:split"),
      },
      [AleoRecordMethod.JOIN]: {
        title: t("JoinSplit:join"),
      },
    };
  }, [t]);

  const amountValid = useMemo(() => {
    if (loadingBalance || !balance) {
      return true;
    }
    if (loadingTokenBalance || !tokenBalance) {
      return true;
    }
    if (!gasFeeEstimated) {
      return true;
    }
    switch (transferMethod) {
      case AleoTransferMethod.PUBLIC:
      case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
        if (token.tokenId !== NATIVE_TOKEN_TOKEN_ID) {
          return (
            tokenBalance.publicBalance &&
            amountNum <= tokenBalance.publicBalance
          );
        } else {
          if (currFeeType === AleoFeeMethod.FEE_PUBLIC) {
            return amountNum + gasFee <= balance.publicBalance;
          } else {
            return amountNum <= balance.publicBalance;
          }
        }
      }
      case AleoTransferMethod.PRIVATE:
      case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
        if (!recordAmount) {
          return false;
        }
        return BigInt(recordAmount) >= amountNum;
      }
    }
  }, [
    loadingBalance,
    balance,
    loadingTokenBalance,
    tokenBalance,
    gasFeeEstimated,
    transferMethod,
    token.tokenId,
    amountNum,
    currFeeType,
    gasFee,
    recordAmount,
  ]);

  const canSubmit = useMemo(() => {
    if (loadingGasFee) {
      return false;
    }
    if (!amountValid) {
      return false;
    }
    if (!gasFeeEstimated || !gasFeeValid) {
      return false;
    }
    if (
      transferMethod === AleoTransferMethod.PRIVATE ||
      transferMethod === AleoTransferMethod.PRIVATE_TO_PUBLIC
    ) {
      if (!transferRecord) {
        return false;
      }
    }
    if (currFeeType === AleoFeeMethod.FEE_PRIVATE) {
      if (!currFeeRecord) {
        return false;
      }
    }
    return true;
  }, [
    loadingGasFee,
    amountValid,
    gasFeeEstimated,
    gasFeeValid,
    transferMethod,
    currFeeType,
    transferRecord,
    currFeeRecord,
  ]);

  const onSubmit = useCallback(() => {
    if (!feeInfo) {
      return;
    }

    onConfirm({
      receiverAddress,
      amountNum,
      token,
      transferMethod,
      transferRecord,
      feeType: currFeeType,
      feeRecord:
        currFeeType === AleoFeeMethod.FEE_PRIVATE ? currFeeRecord : undefined,
      gasFee: feeInfo,
    });
  }, [
    feeInfo,
    onConfirm,
    receiverAddress,
    amountNum,
    token,
    transferMethod,
    transferRecord,
    currFeeType,
    currFeeRecord,
  ]);

  const errorInfo = useMemo(() => {
    if (!amountValid) {
      return t("Send:insufficientBalance");
    }
    return "";
  }, [amountValid, t]);

  return (
    <Content>
      <Flex flexDir={"column"}>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{t("Send:from")}</Text>
          <MiddleEllipsisText
            text={selectedAccount.account.address}
            width={200}
          />
        </Flex>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{t("Send:to")}</Text>
          <MiddleEllipsisText text={receiverAddress} width={200} />
        </Flex>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{t("Send:transferMethod")}</Text>
          <Text>{transferMethodMap[transferMethod].title}</Text>
        </Flex>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{t("Send:amount")}</Text>
          <TokenNum
            amount={amountNum}
            decimals={token.decimals}
            symbol={token.symbol}
          />
        </Flex>
        <Divider h={"1px"} mt={3} mb={5} />
        <Flex mt={2} flexDir={"column"}>
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
        {!!errorInfo && (
          <WarningArea content={errorInfo} container={{ mt: 2 }} />
        )}
      </Flex>
      <Button
        position={"absolute"}
        left={"5"}
        right={"5"}
        bottom={10}
        onClick={onSubmit}
        isDisabled={!canSubmit}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};

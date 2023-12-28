import { H6 } from "@/common/theme/components/text";
import { ERROR_CODE } from "@/common/types/error";
import {
  IconAleo,
  IconChevronRight,
  IconQuestionCircle,
} from "@/components/Custom/Icon";
import { BaseInputGroup } from "@/components/Custom/Input";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showSelectFeeTypeDialog } from "@/components/Send/SelectFeeType";
import { showSelectRecordDialog } from "@/components/Send/SelectRecord";
import { showSelectTransferMethodDialog } from "@/components/Send/SelectTransferMethod";
import { showAleoTransferInfoDialog } from "@/components/Send/TransferInfo";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useClient } from "@/hooks/useClient";
import { useCoinBasic, useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useRecords } from "@/hooks/useRecord";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import {
  Box,
  Button,
  Divider,
  Flex,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Tranaction";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoGasFee } from "core/types/GasFee";
import { parseUnits } from "ethers/lib/utils";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";

interface GasFeeProps {
  receiverAddress: string;
  amountNum: bigint;
  transferMethod: AleoTransferMethod;
  transferRecord?: RecordDetailWithSpent;
  onConfirm: (params: {
    receiverAddress: string;
    amountNum: bigint;
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
  } = props;

  const { selectedAccount, uniqueId } = useCurrAccount();
  const coinBasic = useCoinBasic(uniqueId);
  const { coinService, chainConfig, nativeCurrency } = useCoinService(uniqueId);
  const [errorMsg, setErrorMsg] = useState("");

  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
    10000,
  );

  const { records, loading: loadingRecords } = useRecords(
    uniqueId,
    selectedAccount.address,
  );

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
        const { baseFee, priorityFee } = await coinService.getGasFee(method);
        setFeeInfo({ baseFee, priorityFee });
      } catch (err) {
        setFeeInfo(null);
        setErrorMsg((err as Error).message);
      } finally {
        setLoadingGasFee(false);
      }
    },
    [coinService],
  );
  useEffect(() => {
    getGasFee(transferMethod);
  }, [transferMethod]);

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
        for (let record of records) {
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
  const currFeeRecord = selectedFeeRecord || defaultFeeRecord;

  const isPrivateMethod: boolean = useMemo(() => {
    return transferMethod.startsWith("transfer_private");
  }, [transferMethod]);

  const onSelectFeeRecord = useCallback(async () => {
    const recordList = [...records];
    if (isPrivateMethod && transferRecord) {
      const index = recordList.findIndex(
        (item) => item.commitment === transferRecord.commitment,
      );
      if (index >= 0) {
        recordList.splice(index, 1);
      }
    }
    const { data } = await showSelectRecordDialog({
      recordList: recordList,
      nativeCurrency,
      selectedRecord: currFeeRecord,
    });
    if (data) {
      setSelectedFeeType(AleoFeeMethod.FEE_PRIVATE);
      setSelectedFeeRecord(data);
    } else {
      setSelectedFeeType(AleoFeeMethod.FEE_PUBLIC);
      setSelectedFeeRecord(undefined);
    }
  }, [isPrivateMethod, records, nativeCurrency, currFeeRecord, transferRecord]);

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
  }, [currFeeRecord, gasFeeEstimated, balance, loadingBalance]);
  const [selectedFeeType, setSelectedFeeType] = useState<AleoFeeMethod | null>(
    null,
  );
  const currFeeType: AleoFeeMethod = selectedFeeType || defaultFeeType;
  const onSelectFeeType = useCallback(async () => {
    const { data } = await showSelectFeeTypeDialog();
    if (data) {
      setSelectedFeeType(data);
    }
  }, []);

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
  }, [gasFeeEstimated, currFeeType, loadingBalance, balance, currFeeRecord]);

  const transferMethodMap = useMemo(() => {
    return {
      [AleoTransferMethod.PUBLIC]: {
        title: "Public transfer",
      },
      [AleoTransferMethod.PUBLIC_TO_PRIVATE]: {
        title: "Public balance to private record",
      },
      [AleoTransferMethod.PRIVATE]: {
        title: "Private transfer",
      },
      [AleoTransferMethod.PRIVATE_TO_PUBLIC]: {
        title: "Private record to public balance",
      },
    };
  }, []);

  const amountValid = useMemo(() => {
    if (loadingBalance || !balance) {
      return true;
    }
    if (!gasFeeEstimated) {
      return true;
    }
    switch (transferMethod) {
      case AleoTransferMethod.PUBLIC:
      case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
        if (currFeeType === AleoFeeMethod.FEE_PUBLIC) {
          return amountNum + gasFee <= balance.publicBalance;
        } else {
          return amountNum <= balance.publicBalance;
        }
      }
      case AleoTransferMethod.PRIVATE:
      case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
        if (!transferRecord?.parsedContent?.microcredits) {
          return false;
        }
        return BigInt(transferRecord.parsedContent.microcredits) >= amountNum;
      }
    }
  }, [
    amountNum,
    loadingBalance,
    balance,
    transferMethod,
    transferRecord,
    records,
    gasFee,
    gasFeeEstimated,
    currFeeType,
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
    receiverAddress,
    gasFeeEstimated,
    gasFeeValid,
    transferMethod,
    currFeeRecord,
    currFeeType,
    currFeeType,
    currFeeRecord,
    amountValid,
  ]);

  const onSubmit = useCallback(() => {
    if (!feeInfo) {
      return;
    }

    onConfirm({
      receiverAddress,
      amountNum,
      transferMethod,
      transferRecord,
      feeType: currFeeType,
      feeRecord: currFeeRecord,
      gasFee: feeInfo,
    });
  }, [
    receiverAddress,
    amountNum,
    transferMethod,
    transferRecord,
    currFeeType,
    currFeeRecord,
    feeInfo,
  ]);

  return (
    <Content>
      <Flex flexDir={"column"}>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{"From"}</Text>
          <MiddleEllipsisText text={selectedAccount.address} width={200} />
        </Flex>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{"To"}</Text>
          <MiddleEllipsisText text={receiverAddress} width={200} />
        </Flex>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{"Transfer Method"}</Text>
          <Text>{transferMethodMap[transferMethod].title}</Text>
        </Flex>
        <Flex
          direction={"row"}
          mb={"4"}
          justify={"space-between"}
          align={"center"}
        >
          <Text color={"gray.500"}>{"Amount"}</Text>
          <TokenNum
            amount={amountNum}
            decimals={nativeCurrency.decimals}
            symbol={nativeCurrency.symbol}
          />
        </Flex>
        <Divider bgColor={"gray.50"} h={"1px"} mt={3} mb={5} />
        {/* <Flex direction={"column"} mb={"4"}>
          <Text color={"gray.500"}>{"Fee Type"}</Text>
          <Text>{currFeeType}</Text>
        </Flex> */}
        <Flex mt={2} flexDir={"column"}>
          <Text>Gas Fee</Text>
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
              <Flex onClick={onSelectFeeRecord} mt={2} flex={1}>
                {!!currFeeRecord ? (
                  <Flex>
                    Pay with private record&nbsp; (
                    <TokenNum
                      amount={currFeeRecord.parsedContent?.microcredits || 0n}
                      decimals={nativeCurrency.decimals}
                      symbol={nativeCurrency.symbol}
                    />
                    )
                  </Flex>
                ) : (
                  <Text>No record to pay fee.</Text>
                )}
                <IconChevronRight w={4} h={4} />
              </Flex>
            ) : (
              <Flex
                onClick={onSelectFeeRecord}
                mt={2}
                justify={"space-between"}
                align={"center"}
                flex={1}
              >
                <Text>Pay with public balance.</Text>
                <IconChevronRight w={4} h={4} />
              </Flex>
            )}
          </Flex>
        </Flex>
        {/* <Button mt="2" onClick={onSelectFeeType}>
          {currFeeType}
        </Button> */}
      </Flex>
      <Button mt="4" onClick={onSubmit} isDisabled={!canSubmit}>
        {"Confirm"}
      </Button>
    </Content>
  );
};

import { H6 } from "@/common/theme/components/text";
import {
  IconAleo,
  IconChevronRight,
  IconQuestionCircle,
} from "@/components/Custom/Icon";
import { BaseInputGroup } from "@/components/Custom/Input";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showSelectRecordDialog } from "@/components/Send/SelectRecord";
import { showSelectTransferMethodDialog } from "@/components/Send/SelectTransferMethod";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useCoinBasic, useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useAleoGasFee } from "@/hooks/useGasFee";
import { useRecords } from "@/hooks/useRecord";
import { Content } from "@/layouts/Content";
import {
  Box,
  Button,
  Divider,
  Flex,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { parseUnits } from "ethers/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

interface TransferInfoStepProps {
  receiverAddress: string;
  setReceiverAddress: (address: string) => void;
  amountStr: string;
  setAmountStr: (amount: string) => void;
  transferMethod: AleoTransferMethod;
  setTransferMethod: (method: AleoTransferMethod) => void;
  selectedTransferRecord?: RecordDetailWithSpent;
  setSelectedTransferRecord: (record?: RecordDetailWithSpent) => void;
  onConfirm: (params: {
    receiverAddress: string;
    amountNum: bigint;
    transferMethod: AleoTransferMethod;
    transferRecord?: RecordDetailWithSpent;
  }) => void;
}

export const TransferInfoStep = (props: TransferInfoStepProps) => {
  const {
    receiverAddress,
    setReceiverAddress,
    amountStr,
    setAmountStr,
    transferMethod,
    setTransferMethod,
    selectedTransferRecord,
    setSelectedTransferRecord,
    onConfirm,
  } = props;
  console.log("===> TransferInfoStep props: ", props);

  const { selectedAccount, uniqueId } = useCurrAccount();
  const coinBasic = useCoinBasic(uniqueId);
  const { coinService, chainConfig, nativeCurrency } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
    10000,
  );

  const [errorMsg, setErrorMsg] = useState("");

  const { records, loading: loadingRecords } = useRecords(
    uniqueId,
    selectedAccount.address,
  );

  // Receiver
  const [debounceReceiverAddress] = useDebounce(receiverAddress, 500);
  const [addressValid, setAddressValid] = useState(false);
  const onReceiverAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddressValid(true);
      setReceiverAddress(event.target.value);
    },
    [],
  );
  useEffect(() => {
    if (debounceReceiverAddress) {
      // const valid = coinBasic.isValidAddress(debounceReceiverAddress);
      // setAddressValid(valid);
      setAddressValid(true);
    }
  }, [debounceReceiverAddress]);

  // Transfer method
  const isPrivateMethod = useMemo(() => {
    return transferMethod.startsWith("transfer_private");
  }, [transferMethod]);

  const onSelectTransferMethod = useCallback(async () => {
    const { data } = await showSelectTransferMethodDialog({
      uniqueId,
      address: selectedAccount.address,
      selectedMethod: transferMethod,
    });
    if (data) {
      setTransferMethod(data);
    }
  }, [transferMethod, selectedAccount, uniqueId]);
  useEffect(() => {
    if (
      !loadingBalance &&
      balance?.publicBalance === 0n &&
      balance?.privateBalance > 0n
    ) {
      if (transferMethod.startsWith("transfer_public")) {
        setTransferMethod(AleoTransferMethod.PRIVATE);
      }
    }
  }, [loadingBalance, balance, transferMethod]);

  // gas fee
  // const [feeInfo, setFeeInfo] = useState<AleoGasFee | null>(null);
  // const gasFee = useMemo(() => {
  //   if (!feeInfo) {
  //     return 0n;
  //   }
  //   return feeInfo.baseFee + feeInfo.priorityFee;
  // }, [feeInfo]);
  // const [loadingGasFee, setLoadingGasFee] = useState(false);
  // const gasFeeEstimated = !loadingGasFee && gasFee > 0n;
  // const getGasFee = useCallback(
  //   async (method: AleoTransferMethod) => {
  //     setLoadingGasFee(true);
  //     try {
  //       const { baseFee, priorityFee } = await coinService.getGasFee(method);
  //       setFeeInfo({ baseFee, priorityFee });
  //     } catch (err) {
  //       setFeeInfo(null);
  //       setErrorMsg((err as Error).message);
  //     } finally {
  //       setLoadingGasFee(false);
  //     }
  //   },
  //   [coinService],
  // );
  // useEffect(() => {
  //   getGasFee(transferMethod);
  // }, [transferMethod]);
  const {
    gasFee: feeInfo,
    loadingGasFee,
    error,
  } = useAleoGasFee(uniqueId, transferMethod);
  const gasFee = useMemo(() => {
    if (!feeInfo) {
      return 0n;
    }
    return feeInfo.baseFee + feeInfo.priorityFee;
  }, [feeInfo]);

  // Amount
  const [amountNum, amountNumLegal] = useMemo(() => {
    try {
      console.log(
        "===> amountNum: ",
        amountStr,
        parseUnits(amountStr, nativeCurrency.decimals).toBigInt(),
      );
      if (!amountStr) {
        return [null, false];
      }
      const amountNum = parseUnits(
        amountStr,
        nativeCurrency.decimals,
      ).toBigInt();
      return [amountNum, true];
    } catch (err) {
      return [null, false];
    }
  }, [amountStr, nativeCurrency.decimals]);

  const onAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("===> onAmountChange: ", event.target.value.trim());
      setAmountStr(event.target.value.trim());
    },
    [],
  );

  // transfer record
  const currTransferRecord = selectedTransferRecord || records[0];
  const onSelectTransferRecord = useCallback(async () => {
    const { data } = await showSelectRecordDialog({
      recordList: records,
      nativeCurrency,
      selectedRecord: currTransferRecord,
    });
    if (data) {
      setSelectedTransferRecord(data);
    }
  }, [records, nativeCurrency, currTransferRecord]);

  // amount valid
  const amountValid = useMemo(() => {
    console.log(
      "===> amountValid: ",
      amountStr,
      transferMethod,
      amountNum,
      currTransferRecord?.parsedContent?.microcredits,
    );
    if (!amountNumLegal || amountNum === null) {
      return false;
    }
    if (loadingBalance || !balance) {
      return true;
    }
    // if (!gasFeeEstimated) {
    //   return true;
    // }
    switch (transferMethod) {
      case AleoTransferMethod.PUBLIC:
      case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
        // if (currFeeType === AleoFeeMethod.FEE_PUBLIC) {
        //   return amountNum + gasFee <= balance.publicBalance;
        // } else {
        //   return amountNum <= balance.publicBalance;
        // }
        return amountNum <= balance.publicBalance;
      }
      case AleoTransferMethod.PRIVATE:
      case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
        if (!currTransferRecord?.parsedContent?.microcredits) {
          return false;
        }
        return (
          BigInt(currTransferRecord.parsedContent.microcredits) >= amountNum
        );
      }
    }
  }, [
    amountNumLegal,
    amountNum,
    loadingBalance,
    balance,
    transferMethod,
    currTransferRecord,
    records,
  ]);

  const canSubmit = useMemo(() => {
    console.log(
      "===> canSubmit: ",
      receiverAddress,
      addressValid,
      amountNumLegal,
      amountValid,
      transferMethod,
      currTransferRecord,
    );

    if (!receiverAddress || !addressValid) {
      return false;
    }
    if (!amountNumLegal || !amountValid) {
      return false;
    }
    if (
      transferMethod === AleoTransferMethod.PRIVATE ||
      transferMethod === AleoTransferMethod.PRIVATE_TO_PUBLIC
    ) {
      if (!currTransferRecord) {
        return false;
      }
    }
    return true;
  }, [
    receiverAddress,
    addressValid,
    amountNumLegal,
    amountValid,
    transferMethod,
    currTransferRecord,
  ]);

  const onNext = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    if (!amountNum) {
      return;
    }
    onConfirm({
      receiverAddress,
      amountNum,
      transferMethod,
      transferRecord: currTransferRecord,
    });
  }, [
    canSubmit,
    amountNum,
    receiverAddress,
    transferMethod,
    amountNum,
    currTransferRecord,
  ]);

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

  const [showPrivateHint, setShowPrivateHint] = useState(false);

  return (
    <Content>
      <Flex flexDir={"column"} fontSize={"small"}>
        <Flex justifyContent={"space-between"} align={"center"}>
          <Text>From</Text>
          <Box width={200}>
            <MiddleEllipsisText text={selectedAccount.address} />
          </Box>
        </Flex>
        <Flex justify={"space-between"} mt={2} align={"center"}>
          <Text>Transfer Token</Text>
          <Flex align={"center"}>
            <IconAleo />
            <Text ml={1} fontSize={"small"}>
              ALEO
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Divider bgColor={"gray.50"} h={"1px"} mt={3} mb={5} />
      <BaseInputGroup
        title={"To address"}
        inputProps={{
          placeholder: "Enter receiver address",
          defaultValue: receiverAddress,
          onChange: onReceiverAddressChange,
          isInvalid: !!debounceReceiverAddress && !addressValid,
        }}
      />

      <Flex flexDir={"column"} mt={5}>
        <Flex justify={"space-between"}>
          <Text fontWeight={"bold"}>Transfer Method</Text>
          <Flex fontSize={"small"} color={"gray.500"}>
            {isPrivateMethod ? "Private" : "Public"}&nbsp;Balance:&nbsp;
            <TokenNum
              amount={
                (isPrivateMethod
                  ? balance?.privateBalance
                  : balance?.publicBalance) || 0n
              }
              decimals={nativeCurrency.decimals}
              symbol={nativeCurrency.symbol}
            />
          </Flex>
        </Flex>
        <Flex
          flexDir={"row"}
          borderStyle={"solid"}
          borderColor={"gray.50"}
          borderWidth={"1.5px"}
          borderRadius={"lg"}
          px={4}
          py={3}
          mt={2}
          onClick={onSelectTransferMethod}
          justify={"space-between"}
          align={"center"}
        >
          <Text>{transferMethodMap[transferMethod].title}</Text>
          <IconChevronRight w={4} h={4} mr={-1} />
        </Flex>
      </Flex>

      <BaseInputGroup
        container={{ mt: 5 }}
        title={"Amount"}
        inputProps={{
          placeholder: "Enter amount",
          defaultValue: amountStr,
          onChange: onAmountChange,
          isInvalid: !!amountStr && !amountValid,
        }}
        headerRightElement={
          <Flex fontSize={"small"} color={"gray.500"}>
            Available:&nbsp;
            <TokenNum
              amount={
                (isPrivateMethod
                  ? currTransferRecord.parsedContent?.microcredits
                  : balance?.publicBalance) || 0n
              }
              decimals={nativeCurrency.decimals}
              symbol={nativeCurrency.symbol}
            />
          </Flex>
        }
        rightElement={
          <InputRightElement
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height="100%"
            pr={4}
          >
            <H6>{nativeCurrency.symbol}</H6>
          </InputRightElement>
        }
      />
      <Flex align={"center"} mt={2} position={"relative"}>
        {isPrivateMethod ? (
          !!currTransferRecord ? (
            <Flex flex={1}>
              {showPrivateHint && (
                <Flex
                  position={"absolute"}
                  top={6}
                  fontSize={"smaller"}
                  color={"white"}
                  px={3}
                  py={2}
                  bgColor={"black"}
                  borderRadius={"md"}
                >
                  <Box
                    position={"absolute"}
                    top={"-5px"}
                    left={"5px"}
                    borderLeft={"5px solid transparent"}
                    borderRight={"5px solid transparent"}
                    borderBottom={"8px solid black"}
                  />
                  Due to Aleo's implementation, the maximum amount of a single
                  transfer is limited by the vale of the record used.
                </Flex>
              )}
              <Box
                onMouseEnter={() => setShowPrivateHint(true)}
                onMouseLeave={() => setShowPrivateHint(false)}
              >
                <IconQuestionCircle mr={1} />
              </Box>
              <Flex
                onClick={onSelectTransferRecord}
                flex={1}
                justify={"space-between"}
                align={"center"}
              >
                <Flex fontSize={"smaller"} color={"gray.500"}>
                  Pay with private record&nbsp; (
                  <TokenNum
                    amount={
                      currTransferRecord.parsedContent?.microcredits || 0n
                    }
                    decimals={nativeCurrency.decimals}
                    symbol={nativeCurrency.symbol}
                  />
                  )
                </Flex>
                <IconChevronRight w={4} h={4} />
              </Flex>
            </Flex>
          ) : (
            <Text>No record to transfer.</Text>
          )
        ) : (
          <Text fontSize={"smaller"} color={"gray.500"}>
            Pay with public balance
          </Text>
        )}
      </Flex>
      <Button
        position={"absolute"}
        bottom={6}
        left={6}
        right={6}
        isDisabled={!canSubmit}
        onClick={onNext}
      >
        Next
      </Button>
    </Content>
  );
};

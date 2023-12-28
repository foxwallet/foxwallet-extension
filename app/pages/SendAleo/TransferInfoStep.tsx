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
import { set } from "lodash";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  // const [receiverAddress, setReceiverAddress] = useState(
  //   defaultReceiverAddress || "",
  // // );
  // useEffect(() => {
  //   setReceiverAddress(defaultReceiverAddress || "");
  // }, [defaultReceiverAddress]);
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
  // const [transferMethod, setTransferMethod] = useState(
  //   defaultTransferMethod || AleoTransferMethod.PUBLIC,
  // );
  // useEffect(() => {
  //   setTransferMethod(defaultTransferMethod || AleoTransferMethod.PUBLIC);
  // }, [defaultTransferMethod]);

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

  // Amount
  // const [amountStr, setAmountStr] = useState(defaultAmountStr);
  // useEffect(() => {
  //   setAmountStr(defaultAmountStr);
  // }, [defaultAmountStr]);
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
  // const [selectedTransferRecord, setSelectedTransferRecord] = useState<
  //   RecordDetailWithSpent | undefined
  // >(defaultTransferRecord);
  // useEffect(() => {
  //   setSelectedTransferRecord(defaultTransferRecord);
  // }, [defaultTransferRecord]);

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

  // // fee record
  // const defaultFeeRecord = useMemo(() => {
  //   if (loadingRecords) {
  //     return undefined;
  //   }
  //   switch (transferMethod) {
  //     case AleoTransferMethod.PRIVATE:
  //     case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
  //       if (!currTransferRecord) {
  //         return undefined;
  //       }
  //       for (let record of records) {
  //         if (record.commitment === currTransferRecord.commitment) {
  //           continue;
  //         }
  //         return record;
  //       }
  //       return undefined;
  //     }
  //     case AleoTransferMethod.PUBLIC:
  //     case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
  //       return records[0];
  //     }
  //   }
  // }, [currTransferRecord, loadingRecords, records, transferMethod]);
  // const [selectedFeeRecord, setSelectedFeeRecord] = useState<
  //   RecordDetailWithSpent | undefined
  // >();
  // const currFeeRecord = selectedFeeRecord || defaultFeeRecord;

  // const onSelectFeeRecord = useCallback(async () => {
  //   const recordList = [...records];
  //   if (isPrivateMethod && currTransferRecord) {
  //     const index = records.findIndex(
  //       (item) => item.commitment === currTransferRecord.commitment,
  //     );
  //     if (index >= 0) {
  //       recordList.splice(index, 1);
  //     }
  //   }
  //   const { data } = await showSelectRecordDialog({
  //     recordList: recordList,
  //     nativeCurrency,
  //     selectedRecord: currFeeRecord,
  //   });
  //   if (data) {
  //     setSelectedFeeRecord(data);
  //   }
  // }, [records, nativeCurrency, currFeeRecord]);

  // // fee type
  // const defaultFeeType = useMemo(() => {
  //   if (!gasFeeEstimated) {
  //     return AleoFeeMethod.FEE_PUBLIC;
  //   }
  //   if (!loadingBalance && balance?.publicBalance) {
  //     // 如果 public 余额足够，那么默认用 public 余额
  //     if (balance.publicBalance > gasFee) {
  //       return AleoFeeMethod.FEE_PUBLIC;
  //     }
  //   }
  //   if (!currFeeRecord) {
  //     return AleoFeeMethod.FEE_PUBLIC;
  //   }
  //   try {
  //     const amount = BigInt(currFeeRecord.parsedContent?.microcredits);
  //     const valid = amount > gasFee;
  //     return valid ? AleoFeeMethod.FEE_PRIVATE : AleoFeeMethod.FEE_PUBLIC;
  //   } catch (err) {
  //     console.log(err);
  //     return AleoFeeMethod.FEE_PRIVATE;
  //   }
  // }, [currFeeRecord, gasFeeEstimated, balance, loadingBalance]);
  // const [selectedFeeType, setSelectedFeeType] = useState<AleoFeeMethod | null>(
  //   null,
  // );
  // const currFeeType: AleoFeeMethod = selectedFeeType || defaultFeeType;
  // const onSelectFeeType = useCallback(async () => {
  //   const { data } = await showSelectFeeTypeDialog();
  //   if (data) {
  //     setSelectedFeeType(data);
  //   }
  // }, []);

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
    // gasFeeEstimated,
    // currFeeType,
  ]);

  // gasfee valid
  // const gasFeeValid = useMemo(() => {
  //   if (!gasFeeEstimated) {
  //     return true;
  //   }
  //   switch (currFeeType) {
  //     case AleoFeeMethod.FEE_PUBLIC: {
  //       if (!loadingBalance && balance?.publicBalance) {
  //         // 如果 public 余额足够，那么默认用 public 余额
  //         return balance.publicBalance > gasFee;
  //       }
  //       return false;
  //     }
  //     case AleoFeeMethod.FEE_PRIVATE: {
  //       if (!currFeeRecord) {
  //         return false;
  //       }
  //       try {
  //         const amount = currFeeRecord.parsedContent?.microcredits;
  //         if (amount) {
  //           const valid = BigInt(amount) > gasFee;
  //           return valid;
  //         }
  //         return false;
  //       } catch (err) {
  //         console.log(err);
  //         return false;
  //       }
  //     }
  //   }
  // }, [gasFeeEstimated, currFeeType, loadingBalance, balance, currFeeRecord]);

  // submit
  // const [submitting, setSubmitting] = useState(false);
  // const canSubmit = useMemo(() => {
  //   if (loadingGasFee || submitting) {
  //     return false;
  //   }
  //   if (!receiverAddress || !addressValid) {
  //     return false;
  //   }
  //   if (!amountNumLegal || !amountValid) {
  //     return false;
  //   }
  //   if (!gasFeeEstimated || !gasFeeValid) {
  //     return false;
  //   }
  //   if (
  //     transferMethod === AleoTransferMethod.PRIVATE ||
  //     transferMethod === AleoTransferMethod.PRIVATE_TO_PUBLIC
  //   ) {
  //     if (!currTransferRecord) {
  //       return false;
  //     }
  //   }
  //   if (currFeeType === AleoFeeMethod.FEE_PRIVATE) {
  //     if (!currFeeRecord) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }, [
  //   loadingGasFee,
  //   submitting,
  //   receiverAddress,
  //   addressValid,
  //   amountNumLegal,
  //   amountValid,
  //   gasFeeEstimated,
  //   gasFeeValid,
  //   transferMethod,
  //   currTransferRecord,
  //   currFeeRecord,
  //   currFeeType,
  //   currFeeType,
  //   currFeeRecord,
  // ]);

  // const submitTx = useCallback(
  //   async ({
  //     to,
  //     transferMethod,
  //     amount,
  //     transferRecord,
  //     feeRecord,
  //     gasFee,
  //   }: {
  //     to: string;
  //     transferMethod: AleoTransferMethod;
  //     amount: bigint;
  //     transferRecord?: string;
  //     feeRecord: string | null;
  //     gasFee: AleoGasFee;
  //   }) => {
  //     setSubmitting(true);
  //     try {
  //       const address = selectedAccount.address;
  //       let inputs: string[];
  //       switch (transferMethod) {
  //         case AleoTransferMethod.PRIVATE:
  //         case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
  //           if (!transferRecord) {
  //             throw new Error(ERROR_CODE.INVALID_ARGUMENT);
  //           }
  //           inputs = [transferRecord, to, `${amount}u64`];
  //           break;
  //         }
  //         case AleoTransferMethod.PUBLIC:
  //         case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
  //           inputs = [to, `${amount}u64`];
  //           break;
  //         }
  //       }
  //       const localId = nanoid();
  //       const timestamp = Date.now();
  //       const pendingTx: AleoLocalTxInfo = {
  //         localId,
  //         programId: nativeCurrency.address,
  //         functionName: transferMethod,
  //         inputs,
  //         baseFee: gasFee.baseFee.toString(),
  //         priorityFee: gasFee.priorityFee.toString(),
  //         feeRecord,
  //         status: AleoTxStatus.QUEUED,
  //         timestamp,
  //         amount: amount.toString(),
  //       };
  //       await coinService.setAddressLocalTx(address, pendingTx);
  //       popupServerClient
  //         .sendAleoTransaction({
  //           uniqueId: chainConfig.uniqueId,
  //           walletId: selectedAccount.walletId,
  //           accountId: selectedAccount.accountId,
  //           coinType: chainConfig.coinType,
  //           address: address,
  //           localId,
  //           chainId: chainConfig.chainId,
  //           programId: nativeCurrency.address,
  //           functionName: transferMethod,
  //           inputs,
  //           feeRecord: feeRecord || null,
  //           baseFee: gasFee.baseFee.toString(),
  //           priorityFee: gasFee.priorityFee.toString(),
  //           timestamp,
  //           amount: amount.toString(),
  //         })
  //         .catch(async (err) => {
  //           pendingTx.error = (err as Error).message;
  //           pendingTx.status = AleoTxStatus.FAILED;
  //           await coinService.setAddressLocalTx(address, pendingTx);
  //         });
  //       navigate(-1);
  //     } catch (err) {
  //       setErrorMsg((err as Error).message);
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   },
  //   [],
  // );

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
    // if (!feeInfo) {
    //   return;
    // }
    // const { confirmed } = await showAleoTransferInfoDialog({
    //   transferInfo: {
    //     from: selectedAccount.address,
    //     to: receiverAddress,
    //     nativeCurrency,
    //     transferToken: nativeCurrency,
    //     amount: amountNum,
    //     gasFee,
    //     transferMethod,
    //     feeType: currFeeType,
    //   },
    // });
    // if (confirmed) {
    //   await submitTx({
    //     to: receiverAddress,
    //     transferMethod,
    //     amount: amountNum,
    //     transferRecord: currTransferRecord?.plaintext,
    //     feeRecord: currFeeRecord?.plaintext || null,
    //     gasFee: feeInfo,
    //   });
    // }
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
      {/*
  <Flex mt={2}>
    gasFee:&nbsp;
    <TokenNum
      amount={gasFee}
      decimals={nativeCurrency.decimals}
      symbol={nativeCurrency.symbol}
    />
  </Flex> */}
      {/* <Button mt="2" onClick={onSelectFeeType}>
    {currFeeType}
  </Button> */}
      {/* {currFeeType === AleoFeeMethod.FEE_PRIVATE &&
    (!!currFeeRecord ? (
      <Flex textDecoration={"black"} onClick={onSelectFeeRecord} mt={2}>
        Using&nbsp;
        <TokenNum
          amount={currFeeRecord.parsedContent?.microcredits || 0n}
          decimals={nativeCurrency.decimals}
          symbol={nativeCurrency.symbol}
        />
        &nbsp;record to transfer.
      </Flex>
    ) : (
      <Text>No record to pay fee.</Text>
    ))} */}
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

import { H6 } from "@/common/theme/components/text";
import { serializeToken } from "@/common/utils/string";
import {
  IconAleo,
  IconChevronRight,
  IconQuestionCircle,
} from "@/components/Custom/Icon";
import { BaseInputGroup } from "@/components/Custom/Input";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showSelectRecordDialog } from "@/components/Send/SelectRecord";
import { showSelectTransferMethodDialog } from "@/components/Send/SelectTransferMethod";
import { TokenItem } from "@/components/Wallet/TokenItem";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useAssetList } from "@/hooks/useAssetList";
import { useAleoBalance } from "@/hooks/useAleoBalance";
import { useCoinBasic, useCoinService } from "@/hooks/useCoinService";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useLocationParams } from "@/hooks/useLocationParams";
import { useRecords } from "@/hooks/useRecord";
import { Content } from "@/layouts/Content";
import { RecordFilter } from "@/scripts/background/servers/IWalletServer";
import {
  Box,
  Button,
  Divider,
  Flex,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { type Token } from "core/coins/ALEO/types/Token";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { parseUnits } from "ethers/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useBalance } from "@/hooks/useBalance";
import { AssetType } from "core/types/Token";

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
    token: Token;
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

  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  // TODO: get uniqueId from chain mode or page params
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;

  const coinBasic = useCoinBasic(uniqueId);
  const { coinService } = useCoinService(uniqueId);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const token = useLocationParams("token");

  const { nativeToken } = useAssetList(
    uniqueId,
    selectedAccount.account.address,
  );

  const tokenInfo = useMemo(() => {
    try {
      if (!token) {
        return nativeToken;
      }
      return JSON.parse(token) as Token;
    } catch (err) {
      return nativeToken;
    }
  }, [token, nativeToken]);

  const { records, loading: loadingRecords } = useRecords({
    uniqueId,
    address: selectedAccount.account.address,
    recordFilter: RecordFilter.UNSPENT,
    programId: tokenInfo.programId,
  });

  const tokenRecords = useMemo(() => {
    switch (tokenInfo.programId) {
      case NATIVE_TOKEN_PROGRAM_ID: {
        return records;
      }
      case ALPHA_TOKEN_PROGRAM_ID: {
        return records
          .filter((record) => {
            return record.parsedContent?.token === tokenInfo.tokenId;
          })
          .sort(
            (record1, record2) =>
              record2.parsedContent?.amount - record1.parsedContent?.amount,
          );
      }
      case BETA_STAKING_PROGRAM_ID: {
        return records;
      }
      default: {
        console.error(`Unsupport programId ${tokenInfo.programId}`);
        return [];
      }
    }
  }, [records, tokenInfo]);

  // const { balance, loadingBalance } = useAleoBalance({
  //   uniqueId,
  //   programId: tokenInfo.programId,
  //   address: selectedAccount.account.address,
  //   tokenId: tokenInfo.tokenId,
  //   refreshInterval: 10000,
  // });

  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.account.address,
    refreshInterval: 10000,
    token: {
      type: AssetType.TOKEN,
      contractAddress: "",
      uniqueId,
      programId: tokenInfo.programId,
      tokenId: tokenInfo.tokenId,
      symbol: "",
      decimals: 0,
      ownerAddress: selectedAccount.account.address,
    },
  });

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
      const valid = coinService.validateAddress(debounceReceiverAddress);
      setAddressValid(valid);
    }
  }, [debounceReceiverAddress, coinService]);

  // Transfer method
  const isPrivateMethod = useMemo(() => {
    return transferMethod.startsWith("transfer_private");
  }, [transferMethod]);

  const onSelectTransferMethod = useCallback(async () => {
    const { data } = await showSelectTransferMethodDialog({
      uniqueId,
      address: selectedAccount.account.address,
      selectedMethod: transferMethod,
      token: tokenInfo,
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

  // Amount
  const [amountNum, amountNumLegal] = useMemo(() => {
    try {
      if (!amountStr) {
        return [null, false];
      }
      const amountNum = parseUnits(amountStr, tokenInfo.decimals).toBigInt();
      return [amountNum, true];
    } catch (err) {
      return [null, false];
    }
  }, [amountStr, tokenInfo.decimals]);

  const onAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmountStr(event.target.value.trim());
    },
    [],
  );

  // transfer record
  const currTransferRecord: RecordDetailWithSpent | undefined =
    selectedTransferRecord ?? tokenRecords[0];

  const recordAmount = useMemo(() => {
    switch (tokenInfo.programId) {
      case NATIVE_TOKEN_PROGRAM_ID: {
        return currTransferRecord?.parsedContent?.microcredits;
      }
      case ALPHA_TOKEN_PROGRAM_ID: {
        return currTransferRecord?.parsedContent?.amount;
      }
      case BETA_STAKING_PROGRAM_ID: {
        return currTransferRecord?.parsedContent?.amount;
      }
      default: {
        console.error(`Unsupport programId ${tokenInfo.programId}`);
      }
    }
  }, [tokenInfo, currTransferRecord]);

  const onSelectTransferRecord = useCallback(async () => {
    const { data } = await showSelectRecordDialog({
      recordList: tokenRecords,
      token: tokenInfo,
      selectedRecord: currTransferRecord,
    });
    if (data) {
      setSelectedTransferRecord(data);
    }
  }, [tokenRecords, tokenInfo, currTransferRecord]);

  // amount valid
  const amountValid = useMemo(() => {
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
        if (!recordAmount) {
          return false;
        }
        return BigInt(recordAmount) >= amountNum;
      }
    }
  }, [
    amountNumLegal,
    amountNum,
    loadingBalance,
    balance,
    transferMethod,
    currTransferRecord,
    tokenRecords,
    recordAmount,
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

    if (loadingBalance || !balance) {
      return false;
    }

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
      token: tokenInfo,
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
    tokenInfo,
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
    };
  }, [t]);

  const [showPrivateHint, setShowPrivateHint] = useState(false);

  return (
    <Content>
      <Flex flexDir={"column"} fontSize={"small"}>
        <Flex justifyContent={"space-between"} align={"center"}>
          <Text>{t("Send:from")}</Text>
          <Box width={200}>
            <MiddleEllipsisText text={selectedAccount.account.address} />
          </Box>
        </Flex>
        <Flex justify={"space-between"} mt={2} align={"center"}>
          <Text>{t("Send:transferToken")}</Text>
          <Flex align={"center"}>
            <TokenItem
              token={tokenInfo}
              onClick={() => {
                navigate(
                  `/select_token/${uniqueId}/${
                    selectedAccount.account.address
                  }?page=send_aleo&currToken=${serializeToken(tokenInfo)}`,
                  {
                    replace: true,
                  },
                );
              }}
              hideId
              style={{ pr: 1 }}
            />
            <IconChevronRight w={4} h={4} />
          </Flex>
        </Flex>
      </Flex>
      <Divider h={"1px"} mt={3} mb={5} />
      <BaseInputGroup
        title={t("Send:to")}
        inputProps={{
          placeholder: t("Send:toPlaceholder"),
          defaultValue: receiverAddress,
          onChange: onReceiverAddressChange,
          isInvalid: !!debounceReceiverAddress && !addressValid,
        }}
      />

      <Flex flexDir={"column"} mt={5}>
        <Flex justify={"space-between"}>
          <Text fontWeight={"bold"}>{t("Send:transferMethod")}</Text>
          <Flex fontSize={"small"} color={"gray.500"}>
            {isPrivateMethod
              ? t("Send:privateRecord")
              : t("Send:publicBalance")}
            :&nbsp;
            <TokenNum
              amount={
                (isPrivateMethod
                  ? balance?.privateBalance
                  : balance?.publicBalance) || 0n
              }
              decimals={tokenInfo.decimals}
              symbol={tokenInfo.symbol}
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
        title={t("Send:amount")}
        inputProps={{
          placeholder: t("Send:amountPlaceholder"),
          defaultValue: amountStr,
          onChange: onAmountChange,
          isInvalid: !!amountStr && !amountValid,
        }}
        headerRightElement={
          <Flex fontSize={"small"} color={"gray.500"}>
            {t("Send:available")}:&nbsp;
            <TokenNum
              amount={
                (isPrivateMethod
                  ? BigInt(recordAmount || 0n)
                  : balance?.publicBalance) || 0n
              }
              decimals={tokenInfo.decimals}
              symbol={tokenInfo.symbol}
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
            <H6>{tokenInfo.symbol}</H6>
          </InputRightElement>
        }
      />
      <Flex align={"center"} mt={2} position={"relative"}>
        {isPrivateMethod ? (
          currTransferRecord ? (
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
                  {t("Send:privateRecordExplain")}
                </Flex>
              )}
              <Box
                onMouseEnter={() => {
                  setShowPrivateHint(true);
                }}
                onMouseLeave={() => {
                  setShowPrivateHint(false);
                }}
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
                  {t("Send:payPrivateRecord")}&nbsp; (
                  <TokenNum
                    amount={BigInt(recordAmount || 0n)}
                    decimals={tokenInfo.decimals}
                    symbol={tokenInfo.symbol}
                  />
                  )
                </Flex>
                <IconChevronRight w={4} h={4} />
              </Flex>
            </Flex>
          ) : (
            <Text>{t("Send:noRecord")}</Text>
          )
        ) : (
          <Text fontSize={"smaller"} color={"gray.500"}>
            {t("Send:payPublicBalance")}
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
        {t("Common:next")}
      </Button>
    </Content>
  );
};

import { H6 } from "@/common/theme/components/text";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { IconChevronRight } from "@/components/Custom/Icon";
import { BaseInputGroup } from "@/components/Custom/Input";
import { WarningArea } from "@/components/Custom/WarningArea";
import { showSelectFeeTypeDialog } from "@/components/Send/SelectFeeType";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { Content } from "@/layouts/Content";
import {
  Button,
  Flex,
  InputRightElement,
  Text,
  border,
} from "@chakra-ui/react";
import {
  NATIVE_TOKEN_PROGRAM_ID,
  SPLIT_RECORD_FEE,
} from "core/coins/ALEO/constants";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  AleoRecordMethod,
  AleoTransferMethod,
} from "core/coins/ALEO/types/TransferMethod";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoGasFee } from "core/types/GasFee";
import { parseUnits } from "ethers/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export interface SplitStepProps {
  selectedRecords: RecordDetailWithSpent[];
  onConfirm: (params: { amount: bigint }) => void;
}

export const SplitStep = (props: SplitStepProps) => {
  const { selectedRecords, onConfirm } = props;
  const splitRecord = selectedRecords[0];
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency, coinService } = useCoinService(uniqueId);
  const { t } = useTranslation();
  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.address,
    programId: NATIVE_TOKEN_PROGRAM_ID,
  });

  const [amountStr, setAmountStr] = useState<string>("");
  const [amountNum, amountNumLegal] = useMemo(() => {
    try {
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
  const amountValid = useMemo(() => {
    if (!amountNumLegal || amountNum === null) {
      return false;
    }
    if (!splitRecord) {
      return false;
    }
    if (loadingBalance || !balance) {
      return true;
    }
    return (
      amountNum +
        parseUnits(SPLIT_RECORD_FEE, nativeCurrency.decimals).toBigInt() <=
      splitRecord?.parsedContent?.microcredits
    );
  }, [
    amountNumLegal,
    amountNum,
    loadingBalance,
    balance,
    splitRecord,
    nativeCurrency,
  ]);

  const newRecordValue = useMemo(() => {
    if (!splitRecord) {
      return undefined;
    }
    if (amountNum === null) {
      return undefined;
    }
    return (
      splitRecord?.parsedContent?.microcredits -
      amountNum -
      parseUnits(SPLIT_RECORD_FEE, nativeCurrency.decimals).toBigInt()
    );
  }, [splitRecord, amountNum]);

  const onAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmountStr(event.target.value.trim());
    },
    [],
  );

  const errorInfo = useMemo(() => {
    if (amountStr && !amountValid) {
      return t("Send:insufficientBalance");
    }
    return "";
  }, [amountValid, t]);

  const onSubmit = useCallback(() => {
    if (!amountNum) {
      return;
    }
    onConfirm({ amount: amountNum });
  }, [amountNum]);

  const { borderColor } = useThemeStyle();

  return (
    <Content>
      <Flex flexDir={"column"}>
        <Text fontWeight={"bold"}>{t("JoinSplit:recordValue")}</Text>
        <Flex
          justify={"space-between"}
          borderColor={borderColor}
          borderStyle={"solid"}
          borderWidth={"1px"}
          px={4}
          py={3}
          mt={2}
          borderRadius={"lg"}
        >
          <TokenNum
            amount={selectedRecords[0]?.parsedContent?.microcredits}
            decimals={nativeCurrency.decimals}
            precision={nativeCurrency.decimals}
          />
          <Text fontWeight={"bold"}>{nativeCurrency.symbol}</Text>
        </Flex>
      </Flex>
      <BaseInputGroup
        container={{ mt: 5 }}
        title={t("JoinSplit:splitRecord1Remind")}
        inputProps={{
          placeholder: t("Send:amountPlaceholder"),
          defaultValue: amountStr,
          onChange: onAmountChange,
          isInvalid: !!amountStr && !amountValid,
        }}
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
      {!!errorInfo && <WarningArea content={errorInfo} container={{ mt: 2 }} />}
      <Flex flexDir={"column"} mt={6}>
        <Text fontWeight={"bold"}>
          {t("JoinSplit:splitRecord2Remind", { VALUE: SPLIT_RECORD_FEE })}
        </Text>
        <Flex
          justify={"space-between"}
          borderColor={borderColor}
          borderStyle={"solid"}
          borderWidth={"1px"}
          px={4}
          py={3}
          mt={2}
          borderRadius={"lg"}
        >
          <TokenNum
            amount={newRecordValue}
            decimals={nativeCurrency.decimals}
            precision={nativeCurrency.decimals}
          />
          <Text fontWeight={"bold"}>{nativeCurrency.symbol}</Text>
        </Flex>
      </Flex>
      <WarningArea
        container={{ mt: 4 }}
        content={t("JoinSplit:splitWarning")}
      />
      <Button
        position={"absolute"}
        left={"5"}
        right={"5"}
        bottom={10}
        onClick={onSubmit}
        isDisabled={selectedRecords.length !== 1 || !amountValid}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};

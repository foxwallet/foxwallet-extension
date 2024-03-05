import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecords } from "@/hooks/useRecord";
import { useCoinService } from "@/hooks/useCoinService";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { SplitStep } from "./SplitStep";
import { useDataRef } from "@/hooks/useDataRef";
import { AleoGasFee } from "core/types/GasFee";
import { nanoid } from "nanoid";
import {
  AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Transaction";
import { useClient } from "@/hooks/useClient";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { SelectRecordsStep } from "@/components/Send/SelectRecordsStep";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import {
  NATIVE_TOKEN_TOKEN_ID,
  SPLIT_RECORD_FEE,
} from "core/coins/ALEO/constants";
import { AleoTxType } from "core/coins/ALEO/types/History";

function SplitScreen() {
  const { t } = useTranslation();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency, coinService, chainConfig } = useCoinService(uniqueId);
  const { popupServerClient } = useClient();
  const navigate = useNavigate();
  const { records } = useRecords({
    uniqueId,
    address: selectedAccount.address,
  });
  const [step, setStep] = useState(0);
  const selectedRecordsRef = useRef<RecordDetailWithSpent[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useDataRef(submitting);

  const onSubmit = useCallback(
    async ({ amount }: { amount: bigint }) => {
      if (submittingRef.current || selectedRecordsRef.current.length < 1) {
        return;
      }
      setSubmitting(true);
      try {
        const address = selectedAccount.address;
        const inputs = [
          selectedRecordsRef.current[0].plaintext,
          `${amount}u64`,
        ];
        const localId = nanoid();
        const timestamp = Date.now();
        const baseFee = parseUnits(
          SPLIT_RECORD_FEE,
          nativeCurrency.decimals,
        ).toString();
        const pendingTx: AleoLocalTxInfo = {
          localId,
          address,
          programId: nativeCurrency.address,
          functionName: "split",
          inputs,
          baseFee,
          priorityFee: "0",
          feeRecord: null,
          status: AleoTxStatus.QUEUED,
          timestamp,
          amount:
            selectedRecordsRef.current[0]?.parsedContent?.microcredits?.toString(),
          txType: AleoTxType.EXECUTION,
          notification: false,
          tokenId: NATIVE_TOKEN_TOKEN_ID,
        };
        await coinService.setAddressLocalTx(address, pendingTx);
        popupServerClient
          .sendAleoTransaction({
            uniqueId: chainConfig.uniqueId,
            walletId: selectedAccount.walletId,
            accountId: selectedAccount.accountId,
            coinType: chainConfig.coinType,
            address: address,
            localId,
            chainId: chainConfig.chainId,
            programId: nativeCurrency.address,
            functionName: "split",
            inputs,
            feeRecord: null,
            baseFee,
            priorityFee: "0",
            timestamp,
            amount:
              selectedRecordsRef.current[0]?.parsedContent?.microcredits?.toString(),
            tokenId: NATIVE_TOKEN_TOKEN_ID,
          })
          .catch(async (err) => {
            pendingTx.error = (err as Error).message;
            pendingTx.status = AleoTxStatus.FAILED;
            await coinService.setAddressLocalTx(address, pendingTx);
          });
        navigate(-1);
      } catch (err) {
        showErrorToast({ message: (err as Error).message });
      } finally {
        setSubmitting(false);
      }
    },
    [selectedAccount, nativeCurrency, chainConfig, coinService, navigate],
  );

  const content = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <SelectRecordsStep
            records={records}
            limit={1}
            nativeCurrency={nativeCurrency}
            onConfirm={(selectedRecords) => {
              setStep(1);
              selectedRecordsRef.current = selectedRecords;
            }}
          />
        );
      case 1:
        return (
          <SplitStep
            selectedRecords={selectedRecordsRef.current}
            onConfirm={onSubmit}
          />
        );
    }
  }, [records, nativeCurrency, step, onSubmit]);

  return (
    <PageWithHeader
      enableBack
      title={t("JoinSplit:split")}
      onBack={() => {
        if (step >= 1) {
          setStep(0);
          return false;
        } else {
          return true;
        }
      }}
    >
      {content}
    </PageWithHeader>
  );
}

export default SplitScreen;

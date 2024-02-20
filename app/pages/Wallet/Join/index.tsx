import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecords } from "@/hooks/useRecord";
import { useCoinService } from "@/hooks/useCoinService";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { JoinStep } from "./JoinStep";
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
import { AleoTxType } from "core/coins/ALEO/types/History";

function JoinScreen() {
  const { t } = useTranslation();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency, coinService, chainConfig } = useCoinService(uniqueId);
  const { popupServerClient } = useClient();
  const navigate = useNavigate();
  const { records } = useRecords(uniqueId, selectedAccount.address);
  const [step, setStep] = useState(0);
  const selectedRecordsRef = useRef<RecordDetailWithSpent[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useDataRef(submitting);

  const onSubmit = useCallback(
    async ({
      feeRecord,
      gasFee,
    }: {
      feeRecord?: RecordDetailWithSpent;
      gasFee: AleoGasFee;
    }) => {
      if (submittingRef.current || selectedRecordsRef.current.length < 2) {
        return;
      }
      setSubmitting(true);
      try {
        const address = selectedAccount.address;
        const inputs = [
          selectedRecordsRef.current[0].plaintext,
          selectedRecordsRef.current[1].plaintext,
        ];
        const localId = nanoid();
        const timestamp = Date.now();
        const amount =
          (selectedRecordsRef.current[0]?.parsedContent?.microcredits ?? 0n) +
          (selectedRecordsRef.current[1]?.parsedContent?.microcredits ?? 0n);
        const pendingTx: AleoLocalTxInfo = {
          localId,
          address,
          programId: nativeCurrency.address,
          functionName: "join",
          inputs,
          baseFee: gasFee.baseFee.toString(),
          priorityFee: gasFee.priorityFee.toString(),
          feeRecord: feeRecord?.plaintext || null,
          status: AleoTxStatus.QUEUED,
          timestamp,
          amount: amount.toString(),
          txType: AleoTxType.EXECUTION,
          notification: false,
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
            functionName: "join",
            inputs,
            feeRecord: feeRecord?.plaintext || null,
            baseFee: gasFee.baseFee.toString(),
            priorityFee: gasFee.priorityFee.toString(),
            timestamp,
            amount: amount.toString(),
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
            limit={2}
            nativeCurrency={nativeCurrency}
            onConfirm={(selectedRecords) => {
              setStep(1);
              selectedRecordsRef.current = selectedRecords;
            }}
          />
        );
      case 1:
        return (
          <JoinStep
            records={records}
            selectedRecords={selectedRecordsRef.current}
            onConfirm={onSubmit}
          />
        );
    }
  }, [records, nativeCurrency, step, onSubmit]);

  return (
    <PageWithHeader
      enableBack
      title={t("JoinSplit:join")}
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

export default JoinScreen;

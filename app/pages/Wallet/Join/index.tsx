import { PageWithHeader } from "@/layouts/Page";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecords } from "@/hooks/useRecord";
import { useCoinService } from "@/hooks/useCoinService";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { JoinStep } from "./JoinStep";
import { useDataRef } from "@/hooks/useDataRef";
import { type AleoGasFee } from "core/types/GasFee";
import { nanoid } from "nanoid";
import {
  type AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Transaction";
import { useClient } from "@/hooks/useClient";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { SelectRecordsStep } from "@/components/Send/SelectRecordsStep";
import { AleoTxType } from "core/coins/ALEO/types/History";
import { NATIVE_TOKEN_TOKEN_ID } from "core/coins/ALEO/constants";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AleoService } from "core/coins/ALEO/service/AleoService";

function JoinScreen() {
  const { t } = useTranslation();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();

  // TODO: get uniqueId from chain mode or page params
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;

  const { nativeCurrency, coinService, chainConfig } = useCoinService(uniqueId);
  const { popupServerClient } = useClient();
  const navigate = useNavigate();
  const { records } = useRecords({
    uniqueId,
    address: selectedAccount.account.address,
  });
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
        const address = selectedAccount.account.address;
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
          programId: nativeCurrency.address!,
          functionName: "join",
          inputs,
          baseFee: gasFee.baseFee.toString(),
          priorityFee: gasFee.priorityFee.toString(),
          feeRecord: feeRecord?.plaintext ?? null,
          status: AleoTxStatus.QUEUED,
          timestamp,
          amount: amount.toString(),
          txType: AleoTxType.EXECUTION,
          notification: false,
          tokenId: NATIVE_TOKEN_TOKEN_ID,
        };
        await (coinService as AleoService).setAddressLocalTx(
          address,
          pendingTx,
        );
        popupServerClient
          .sendAleoTransaction({
            uniqueId: chainConfig.uniqueId,
            walletId: selectedAccount.wallet.walletId,
            accountId: selectedAccount.account.accountId,
            coinType: chainConfig.coinType,
            address,
            localId,
            chainId: chainConfig.chainId,
            programId: nativeCurrency.address!,
            functionName: "join",
            inputs,
            feeRecord: feeRecord?.plaintext || null,
            baseFee: gasFee.baseFee.toString(),
            priorityFee: gasFee.priorityFee.toString(),
            timestamp,
            amount: amount.toString(),
            tokenId: NATIVE_TOKEN_TOKEN_ID,
          })
          .catch(async (err) => {
            pendingTx.error = (err as Error).message;
            pendingTx.status = AleoTxStatus.FAILED;
            await (coinService as AleoService).setAddressLocalTx(
              address,
              pendingTx,
            );
          });
        navigate(-1);
      } catch (err) {
        void showErrorToast({ message: (err as Error).message });
      } finally {
        setSubmitting(false);
      }
    },
    [
      submittingRef,
      selectedAccount,
      nativeCurrency.address,
      coinService,
      popupServerClient,
      chainConfig,
      navigate,
    ],
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

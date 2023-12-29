import { ERROR_CODE } from "@/common/types/error";
import { useClient } from "@/hooks/useClient";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Tranaction";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { AleoGasFee } from "core/types/GasFee";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransferInfoStep } from "./TransferInfoStep";
import { GasFeeStep } from "./GasFeeStep";
import { useDataRef } from "@/hooks/useDataRef";

function SendScreen() {
  const navigate = useNavigate();
  const { popupServerClient } = useClient();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { coinService, chainConfig, nativeCurrency } = useCoinService(uniqueId);

  const [step, setStep] = useState(1);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<bigint | undefined>();
  const [transferMethod, setTransferMethod] = useState<AleoTransferMethod>(
    AleoTransferMethod.PUBLIC,
  );
  const [transferRecord, setTransferRecord] = useState<
    RecordDetailWithSpent | undefined
  >();

  const onStep1Submit = useCallback(
    ({
      receiverAddress: submitReceiverAddress,
      amountNum: submitAmountNum,
      transferMethod: submitTransferMethod,
      transferRecord: finalTransferRecord,
    }: {
      receiverAddress: string;
      amountNum: bigint;
      transferMethod: AleoTransferMethod;
      transferRecord?: RecordDetailWithSpent;
    }) => {
      setReceiverAddress(submitReceiverAddress);
      setTransferAmount(submitAmountNum);
      setTransferMethod(submitTransferMethod);
      setTransferRecord(finalTransferRecord);
      setStep(2);
    },
    [],
  );

  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useDataRef(submitting);

  const onStep2Submit = useCallback(
    async ({
      receiverAddress: to,
      amountNum: amount,
      transferMethod: finalTransferMethod,
      transferRecord: finalTransferRecord,
      feeRecord,
      gasFee,
    }: {
      receiverAddress: string;
      amountNum: bigint;
      transferMethod: AleoTransferMethod;
      transferRecord?: RecordDetailWithSpent;
      feeType: AleoFeeMethod;
      feeRecord?: RecordDetailWithSpent;
      gasFee: AleoGasFee;
    }) => {
      if (submittingRef.current) {
        return;
      }
      setSubmitting(true);
      try {
        const address = selectedAccount.address;
        let inputs: string[];
        switch (finalTransferMethod) {
          case AleoTransferMethod.PRIVATE:
          case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
            if (!finalTransferRecord || !finalTransferRecord.plaintext) {
              throw new Error(ERROR_CODE.INVALID_ARGUMENT);
            }
            inputs = [finalTransferRecord.plaintext, to, `${amount}u64`];
            break;
          }
          case AleoTransferMethod.PUBLIC:
          case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
            inputs = [to, `${amount}u64`];
            break;
          }
        }
        const localId = nanoid();
        const timestamp = Date.now();
        const pendingTx: AleoLocalTxInfo = {
          localId,
          programId: nativeCurrency.address,
          functionName: finalTransferMethod,
          inputs,
          baseFee: gasFee.baseFee.toString(),
          priorityFee: gasFee.priorityFee.toString(),
          feeRecord: feeRecord?.plaintext || null,
          status: AleoTxStatus.QUEUED,
          timestamp,
          amount: amount.toString(),
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
            functionName: finalTransferMethod,
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
        setErrorMsg((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
    [selectedAccount, nativeCurrency, chainConfig, coinService, navigate],
  );

  const content = useMemo(() => {
    switch (step) {
      case 1: {
        return (
          <TransferInfoStep
            receiverAddress={receiverAddress}
            setReceiverAddress={(str: string) => setReceiverAddress(str)}
            amountStr={amountStr}
            setAmountStr={setAmountStr}
            transferMethod={transferMethod}
            setTransferMethod={(method: AleoTransferMethod) =>
              setTransferMethod(method)
            }
            selectedTransferRecord={transferRecord}
            setSelectedTransferRecord={(record?: RecordDetailWithSpent) =>
              setTransferRecord(record)
            }
            onConfirm={onStep1Submit}
          />
        );
      }
      case 2: {
        return (
          <GasFeeStep
            receiverAddress={receiverAddress!}
            amountNum={transferAmount!}
            transferMethod={transferMethod}
            transferRecord={transferRecord}
            onConfirm={onStep2Submit}
          />
        );
      }
    }
  }, [
    step,
    receiverAddress,
    setReceiverAddress,
    transferAmount,
    setTransferAmount,
    amountStr,
    setAmountStr,
    transferMethod,
    setTransferMethod,
    transferRecord,
    setTransferRecord,
    onStep1Submit,
    onStep2Submit,
  ]);

  return (
    <PageWithHeader
      enableBack
      title={"Send"}
      onBack={() => {
        if (step > 1) {
          setStep(1);
          return false;
        }
        return true;
      }}
    >
      {content}
    </PageWithHeader>
  );
}

export default SendScreen;

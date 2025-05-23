import { ERROR_CODE } from "@/common/types/error";
import { useClient } from "@/hooks/useClient";
import { useCoinService } from "@/hooks/useCoinService";
import { PageWithHeader } from "@/layouts/Page";
import { type AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  type AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Transaction";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { type AleoGasFee } from "core/types/GasFee";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransferInfoStep } from "./TransferInfoStep";
import { GasFeeStep } from "./GasFeeStep";
import { useDataRef } from "@/hooks/useDataRef";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { useTranslation } from "react-i18next";
import { AleoTxType } from "core/coins/ALEO/types/History";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  ARCANE_PROGRAM_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { type AleoService } from "core/coins/ALEO/service/AleoService";
import { type TokenV2 } from "core/types/Token";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";

function SendScreen() {
  const navigate = useNavigate();
  const { popupServerClient } = useClient();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  // Only use in Aleo
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, [getMatchAccountsWithUniqueId]);
  const { coinService, chainConfig, nativeCurrency } = useCoinService(uniqueId);
  const { t } = useTranslation();

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

  const { tokenInfo } = useSafeTokenInfo(
    uniqueId,
    selectedAccount.account.address,
  );
  const [transferToken, setTransferToken] = useState<TokenV2>(tokenInfo);

  const onStep1Submit = useCallback(
    ({
      receiverAddress: submitReceiverAddress,
      amountNum: submitAmountNum,
      transferMethod: submitTransferMethod,
      transferRecord: finalTransferRecord,
      token,
    }: {
      receiverAddress: string;
      amountNum: bigint;
      transferMethod: AleoTransferMethod;
      transferRecord?: RecordDetailWithSpent;
      token: TokenV2;
    }) => {
      setReceiverAddress(submitReceiverAddress);
      setTransferAmount(submitAmountNum);
      setTransferMethod(submitTransferMethod);
      setTransferRecord(finalTransferRecord);
      setTransferToken(token);
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
      token,
      transferMethod: finalTransferMethod,
      transferRecord: finalTransferRecord,
      feeRecord,
      gasFee,
    }: {
      receiverAddress: string;
      amountNum: bigint;
      token: TokenV2;
      transferMethod: AleoTransferMethod;
      transferRecord?: RecordDetailWithSpent;
      feeType: AleoFeeMethod;
      feeRecord?: RecordDetailWithSpent;
      gasFee: AleoGasFee;
    }) => {
      if (submittingRef.current) {
        return;
      }
      if (!transferToken) {
        return;
      }
      setSubmitting(true);

      const { programId: _programId, tokenId: _tokenId } = (
        coinService as AleoService
      ).parseContractAddress(token.contractAddress);

      const tokenId = token.tokenId ?? _tokenId;
      const programId = token.programId ?? _programId;

      try {
        const address = selectedAccount.account.address;
        let inputs: string[] = [];
        switch (finalTransferMethod) {
          case AleoTransferMethod.PRIVATE:
          case AleoTransferMethod.PRIVATE_TO_PUBLIC: {
            if (!finalTransferRecord || !finalTransferRecord.plaintext) {
              throw new Error(ERROR_CODE.INVALID_ARGUMENT);
            }
            switch (programId) {
              case NATIVE_TOKEN_PROGRAM_ID: {
                inputs = [finalTransferRecord.plaintext, to, `${amount}u64`];
                break;
              }
              case BETA_STAKING_PROGRAM_ID: {
                inputs = [finalTransferRecord.plaintext, to, `${amount}u64`];
                break;
              }
              case ALPHA_TOKEN_PROGRAM_ID: {
                inputs = [finalTransferRecord.plaintext, to, `${amount}u128`];
                break;
              }
              case ARCANE_PROGRAM_ID: {
                inputs = [to, `${amount}u128`, finalTransferRecord.plaintext];
                break;
              }
            }
            break;
          }
          case AleoTransferMethod.PUBLIC: {
            switch (token.programId) {
              case NATIVE_TOKEN_PROGRAM_ID: {
                inputs = [to, `${amount}u64`];
                break;
              }
              case BETA_STAKING_PROGRAM_ID: {
                inputs = [to, `${amount}u64`];
                break;
              }
              case ALPHA_TOKEN_PROGRAM_ID: {
                // todo  token.tokenId ?? ""
                inputs = [token.tokenId ?? "", to, `${amount}u128`];
                break;
              }
              case ARCANE_PROGRAM_ID: {
                inputs = [token.tokenId ?? "", to, `${amount}u128`];
                break;
              }
            }
            break;
          }
          case AleoTransferMethod.PUBLIC_TO_PRIVATE: {
            switch (programId) {
              case NATIVE_TOKEN_PROGRAM_ID: {
                inputs = [to, `${amount}u64`];
                break;
              }
              case BETA_STAKING_PROGRAM_ID: {
                inputs = [to, `${amount}u64`];
                break;
              }
              case ALPHA_TOKEN_PROGRAM_ID: {
                inputs = [token?.tokenId ?? "", to, `${amount}u128`];
                break;
              }
              case ARCANE_PROGRAM_ID: {
                inputs = [token.tokenId ?? "", to, `${amount}u128`, "false"];
                break;
              }
            }
            break;
          }
        }
        const localId = nanoid();
        const timestamp = Date.now();
        const pendingTx: AleoLocalTxInfo = {
          localId,
          address,
          programId: programId ?? "",
          functionName: finalTransferMethod,
          inputs,
          baseFee: gasFee.baseFee.toString(),
          priorityFee: gasFee.priorityFee.toString(),
          feeRecord: feeRecord?.plaintext || null,
          status: AleoTxStatus.QUEUED,
          timestamp,
          amount: amount.toString(),
          txType: AleoTxType.EXECUTION,
          tokenId: token?.tokenId ?? "",
          notification: false,
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
            programId: programId ?? "",
            functionName: finalTransferMethod,
            inputs,
            feeRecord: feeRecord?.plaintext || null,
            baseFee: gasFee.baseFee.toString(),
            priorityFee: gasFee.priorityFee.toString(),
            timestamp,
            amount: amount.toString(),
            tokenId: token?.tokenId ?? "",
          })
          .catch(async (err) => {
            pendingTx.error = (err as Error).message;
            pendingTx.status = AleoTxStatus.FAILED;
            await (coinService as AleoService).setAddressLocalTx(
              address,
              pendingTx,
            );
          });
        navigate("/");
      } catch (err) {
        void showErrorToast({ message: (err as Error).message });
      } finally {
        setSubmitting(false);
      }
    },
    [
      submittingRef,
      transferToken,
      selectedAccount,
      coinService,
      popupServerClient,
      chainConfig,
      navigate,
    ],
  );

  const content = useMemo(() => {
    switch (step) {
      case 1: {
        return (
          <TransferInfoStep
            transferToken={transferToken}
            receiverAddress={receiverAddress}
            setReceiverAddress={(str: string) => {
              setReceiverAddress(str);
            }}
            amountStr={amountStr}
            setAmountStr={setAmountStr}
            transferMethod={transferMethod}
            setTransferMethod={(method: AleoTransferMethod) => {
              setTransferMethod(method);
            }}
            selectedTransferRecord={transferRecord}
            setSelectedTransferRecord={(record?: RecordDetailWithSpent) => {
              setTransferRecord(record);
            }}
            onConfirm={onStep1Submit}
          />
        );
      }
      case 2: {
        return (
          <GasFeeStep
            receiverAddress={receiverAddress}
            amountNum={transferAmount!}
            transferMethod={transferMethod}
            transferRecord={transferRecord}
            token={transferToken}
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
    amountStr,
    setAmountStr,
    transferMethod,
    setTransferMethod,
    transferRecord,
    setTransferRecord,
    transferToken,
    onStep1Submit,
    onStep2Submit,
  ]);

  return (
    <PageWithHeader
      enableBack
      title={t("Send:title")}
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

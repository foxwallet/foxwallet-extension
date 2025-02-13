import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { InputAddressStep } from "@/pages/Wallet/Send/InputAddressStep";
import { SendDataStep, type Step2Data } from "@/pages/Wallet/Send/SendDataStep";
import type { GasFee } from "core/types/GasFee";
import { CoinType } from "core/types";
import { useCoinService } from "@/hooks/useCoinService";
import { useNonce } from "@/hooks/useNonce";
import { usePrivateKey } from "@/hooks/usePrivateKey";
import { LoadingOverlay } from "@/components/Custom/Loading";
import { AssetType } from "core/types/Token";
import {
  GasSettingStep,
  type Step3Data,
} from "@/pages/Wallet/Send/GasSettingStep";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";

export enum AmountType {
  FIAT,
  TOKEN,
}

const SendScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId, address: fromAddress } = useSafeParams();
  const { tokenInfo } = useSafeTokenInfo(uniqueId, fromAddress);

  const [step, setStep] = useState(1);
  // step1 data
  const [toAddress, setToAddress] = useState("");
  // step2 data
  const [step2Data, setStep2Data] = useState<Step2Data>({});
  // step3 data
  const [step3Data, setStep3Data] = useState<Step3Data>({});

  const { coinService } = useCoinService(uniqueId);

  const { nonce } = useNonce(uniqueId, fromAddress);
  const { privateKey } = usePrivateKey(uniqueId, CoinType.ETH);
  const [isSending, setIsSending] = useState(false);

  const onSend = useCallback(
    async (gasFee: GasFee<CoinType> | undefined, value: bigint | undefined) => {
      if (!gasFee || !value || !privateKey) {
        return;
      }

      setIsSending(true);

      const sendCoin = async () => {
        try {
          const res = await coinService.sendNativeCoin({
            tx: {
              from: fromAddress,
              to: toAddress,
              value,
              gasFee,
              nonce,
            },
            signer: { privateKey },
          });
          console.log("====> send NativeCoin");
          console.log(res);
        } catch (e) {
          console.log(e);
        }
      };

      const sendToken = async () => {
        try {
          const res = await coinService.sendToken({
            tx: {
              from: fromAddress,
              to: toAddress,
              value,
              token: tokenInfo,
              gasFee,
              nonce,
            },
            signer: { privateKey },
          });
          console.log("====> send token");
          console.log(res);
        } catch (e) {
          console.log(e);
        }
      };

      Promise.all([
        tokenInfo.type === AssetType.TOKEN ? sendToken() : sendCoin(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ])
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsSending(false);
          navigate("/");
        });
    },
    [
      coinService,
      fromAddress,
      navigate,
      nonce,
      privateKey,
      toAddress,
      tokenInfo,
    ],
  );

  const sendContent = useMemo(() => {
    switch (step) {
      case 1: {
        return (
          <InputAddressStep
            uniqueId={uniqueId}
            onStep2={(toAddr) => {
              setToAddress(toAddr);
              setStep(2);
            }}
            toAddr={toAddress}
            key={"inputAddressStep"}
          />
        );
      }
      case 2: {
        return (
          <SendDataStep
            key={"sendDataStep"}
            initData={step2Data}
            fromAddress={fromAddress}
            toAddress={toAddress}
            uniqueId={uniqueId}
            onStep3={(data) => {
              setStep2Data(data);
              setStep(3);
            }}
            onSend={onSend}
            token={tokenInfo}
          />
        );
      }
      case 3: {
        return (
          <GasSettingStep
            uniqueId={uniqueId}
            onConfirm={(data) => {
              console.log("      step3Data", data);
              setStep3Data(data);
              setStep2Data((prevState) => {
                return { ...prevState, currGasFee: data.gasFee };
              });
              setStep(2);
            }}
            step3Data={{ ...step3Data, gasFee: step2Data.currGasFee }}
            token={tokenInfo}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [
    step,
    uniqueId,
    toAddress,
    step2Data,
    fromAddress,
    onSend,
    tokenInfo,
    step3Data,
  ]);

  return (
    <PageWithHeader
      title={`${t("Send:title")} ${tokenInfo.symbol}`}
      onBack={() => {
        switch (step) {
          case 1: {
            return true;
          }
          case 2: {
            setStep2Data({});
            setStep(1);
            return false;
          }
          case 3: {
            setStep(2);
            return false;
          }
        }
        return true;
      }}
    >
      {sendContent}
      <LoadingOverlay isLoading={isSending} hint={t("Send:processing")} />
    </PageWithHeader>
  );
};

export default SendScreen;

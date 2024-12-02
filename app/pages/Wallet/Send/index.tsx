import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import React, { useCallback, useMemo, useState } from "react";
import { InputAddressStep } from "@/pages/Wallet/Send/InputAddressStep";
import { SendDataStep } from "@/pages/Wallet/Send/SendDataStep";
import { AssetType } from "@/common/types/asset";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import type { GasFee } from "core/types/GasFee";
import { CoinType } from "core/types";
import { useCoinService } from "@/hooks/useCoinService";
import { useNonce } from "@/hooks/useNonce";
import { usePrivateKey } from "@/hooks/usePrivateKey";
import { LoadingOverlay, LoadingScreen } from "@/components/Custom/Loading";

export enum AmountType {
  FIAT,
  TOKEN,
}

const SendScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [toAddress, setToAddress] = useState("");

  const myAddress = "0x180325d018A5ED8144e78eEfdc9Ea893E8BEd50E";
  const uniqueId = InnerChainUniqueId.ETHEREUM; // for test
  const { coinService } = useCoinService(uniqueId);

  const { nonce } = useNonce(uniqueId, myAddress);
  const { privateKey } = usePrivateKey(uniqueId, CoinType.ETH);
  // console.log("      privateKey " + privateKey);
  const [isSending, setIsSending] = useState(false);

  // for test
  const LoadingDelay = useCallback(async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }, []);

  const onSend = useCallback(
    async (
      gasFee: GasFee<CoinType.ETH> | undefined,
      value: bigint | undefined,
    ) => {
      if (!gasFee || !value || !privateKey) {
        return;
      }
      setIsSending(true);

      const sendCoin = async () => {
        try {
          const res = await coinService.sendNativeCoin({
            tx: {
              from: myAddress,
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

      Promise.all([
        sendCoin(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]).then(() => {
        setIsSending(false);
        navigate("/");
      });
    },
    [coinService, navigate, nonce, privateKey, toAddress],
  );

  const sendTokenContent = useMemo(() => {
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
          />
        );
      }
      case 2: {
        return (
          <SendDataStep
            toAddress={toAddress}
            uniqueId={uniqueId}
            onSend={(gasFee, value) => {
              onSend(gasFee, value);
            }}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [onSend, step, toAddress, uniqueId]);

  return (
    <PageWithHeader
      title={t("Send:title")}
      onBack={() => {
        if (step > 1) {
          setStep(1);
          return false;
        }
        return true;
      }}
    >
      {sendTokenContent}
      <LoadingOverlay isLoading={isSending} hint={t("Send:processing")} />
    </PageWithHeader>
  );
};

export default SendScreen;

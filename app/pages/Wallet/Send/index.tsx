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
  console.log("      privateKey " + privateKey);

  const onSend = useCallback(
    async (
      gasFee: GasFee<CoinType.ETH> | undefined,
      value: bigint | undefined,
    ) => {
      if (!gasFee || !value || !privateKey) {
        return;
      }
      try {
        console.log("     send xxx ");
        console.log(myAddress);
        console.log(toAddress);
        console.log(value);
        console.log(gasFee);
        console.log(nonce);
        console.log(privateKey);

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
        console.log("     66666666 ");
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    },
    [coinService, nonce, privateKey, toAddress],
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
      <LoadingOverlay isLoading={isSending} />
    </PageWithHeader>
  );
};

export default SendScreen;

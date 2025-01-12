import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import React, { useCallback, useMemo, useState } from "react";
import { InputAddressStep } from "@/pages/Wallet/Send/InputAddressStep";
import { SendDataStep, type Step2Data } from "@/pages/Wallet/Send/SendDataStep";
import type { GasFee } from "core/types/GasFee";
import { CoinType } from "core/types";
import { useCoinService } from "@/hooks/useCoinService";
import { useNonce } from "@/hooks/useNonce";
import { usePrivateKey } from "@/hooks/usePrivateKey";
import { LoadingOverlay } from "@/components/Custom/Loading";
import { AssetType } from "core/types/Token";
import { GasSettingStep } from "@/pages/Wallet/Send/GasSettingStep";
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

  const { coinService } = useCoinService(uniqueId);

  const { nonce } = useNonce(uniqueId, fromAddress);
  const { privateKey } = usePrivateKey(uniqueId, CoinType.ETH);
  const [isSending, setIsSending] = useState(false);

  // for test
  // const testToken: TokenV2 = useMemo(() => {
  //   return {
  //     symbol: "ZKB",
  //     decimals: 18,
  //     name: "ZKBase",
  //     type: AssetType.TOKEN,
  //     contractAddress: "0xBBBbbBBB46A1dA0F0C3F64522c275BAA4C332636",
  //     uniqueId: InnerChainUniqueId.ETHEREUM,
  //     ownerAddress: "0x180325d018A5ED8144e78eEfdc9Ea893E8BEd50E",
  //   };
  // }, []);

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
      ]).then(() => {
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
            onSend={(gasFee, value) => {
              // onSend(gasFee, value); //todo
            }}
            token={tokenInfo}
          />
        );
      }
      case 3: {
        return (
          <GasSettingStep
            uniqueId={uniqueId}
            onConfirm={() => {}}
            currGasGFee={step2Data.gasFee}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [step, uniqueId, toAddress, step2Data, fromAddress, tokenInfo]);

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

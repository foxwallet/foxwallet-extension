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
import { LoadingOverlay } from "@/components/Custom/Loading";
import type { TokenV2 } from "core/types/Token";

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
  const testToken: TokenV2 = useMemo(() => {
    return {
      symbol: "ZKB",
      decimals: 18,
      name: "ZKBase",
      type: AssetType.TOKEN,
      contractAddress: "0xBBBbbBBB46A1dA0F0C3F64522c275BAA4C332636",
      uniqueId: InnerChainUniqueId.ETHEREUM,
      ownerAddress: "0x180325d018A5ED8144e78eEfdc9Ea893E8BEd50E",
    };
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

      const sendToken = async () => {
        try {
          const res = await coinService.sendToken({
            tx: {
              from: myAddress,
              to: toAddress,
              value,
              token: testToken,
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
        testToken ? sendToken() : sendCoin(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]).then(() => {
        setIsSending(false);
        navigate("/");
      });
    },
    [coinService, navigate, nonce, privateKey, toAddress, testToken],
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
            token={testToken}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [onSend, step, testToken, toAddress, uniqueId]);

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
      {sendContent}
      <LoadingOverlay isLoading={isSending} hint={t("Send:processing")} />
    </PageWithHeader>
  );
};

export default SendScreen;

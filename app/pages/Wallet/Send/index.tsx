import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useMemo, useState } from "react";
import { InputAddressStep } from "@/pages/Wallet/Send/InputAddressStep";
import { SendDataStep } from "@/pages/Wallet/Send/SendDataStep";
import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import type { GasFee } from "core/types/GasFee";
import { CoinType } from "core/types";
import { useCoinService } from "@/hooks/useCoinService";
import { useNonce } from "@/hooks/useNonce";
import { usePrivateKey } from "@/hooks/usePrivateKey";
import { LoadingOverlay } from "@/components/Custom/Loading";
import { AssetType, type TokenV2 } from "core/types/Token";
import { useLocationParams } from "@/hooks/useLocationParams";
import { useChainMode } from "@/hooks/useChainMode";
import { useAssetList } from "@/hooks/useAssetList";

export enum AmountType {
  FIAT,
  TOKEN,
}

const SendScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [toAddress, setToAddress] = useState("");

  const { uniqueId: paramUniqueId, address: paramAddress } = useParams<{
    uniqueId: InnerChainUniqueId;
    address: string;
  }>();
  const { availableChainUniqueIds, availableAccounts } = useChainMode();

  const uniqueId = useMemo(() => {
    return paramUniqueId ?? availableChainUniqueIds[0];
  }, [availableChainUniqueIds, paramUniqueId]);
  const fromAddress = useMemo(() => {
    return paramAddress ?? availableAccounts[0].account.address;
  }, [availableAccounts, paramAddress]);

  const token = useLocationParams("token");
  const { nativeToken } = useAssetList(uniqueId, fromAddress);
  const tokenInfo = useMemo(() => {
    try {
      if (!token) {
        return nativeToken;
      }
      return JSON.parse(token) as TokenV2;
    } catch (err) {
      return nativeToken;
    }
  }, [nativeToken, token]);

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
          />
        );
      }
      case 2: {
        return (
          <SendDataStep
            fromAddress={fromAddress}
            toAddress={toAddress}
            uniqueId={uniqueId}
            onSend={(gasFee, value) => {
              onSend(gasFee, value);
            }}
            token={tokenInfo}
          />
        );
      }
      default: {
        return null;
      }
    }
  }, [fromAddress, onSend, step, tokenInfo, toAddress, uniqueId]);

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

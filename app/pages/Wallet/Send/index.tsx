import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { InputAddressStep } from "@/pages/Wallet/Send/InputAddressStep";
import { SendDataStep } from "@/pages/Wallet/Send/SendDataStep";
import { AssetType } from "@/common/types/asset";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export enum AmountType {
  FIAT,
  TOKEN,
}

const SendScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [toAddress, setToAddress] = useState("");

  const sendTokenContent = useMemo(() => {
    switch (step) {
      case 1: {
        return (
          <InputAddressStep
            uniqueId={InnerChainUniqueId.ETHEREUM} // for test
            onStep2={(toAddr) => {
              setToAddress(toAddr);
              setStep(2);
            }}
            toAddr={toAddress}
          />
        );
      }
      case 2: {
        return <SendDataStep toAddress={toAddress} />;
      }
      default: {
        return null;
      }
    }
  }, [step, toAddress]);

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
    </PageWithHeader>
  );
};

export default SendScreen;

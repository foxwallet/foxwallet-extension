import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { InputAddressStep } from "@/pages/Wallet/Send/InputAddressStep";

const SendScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [toAddress, setToAddress] = useState("");

  const content = useMemo(() => {
    switch (step) {
      case 1: {
        return (
          <InputAddressStep
            onStep2={(toAddr) => {
              setToAddress(toAddr);
              setStep(2);
            }}
            toAddr={toAddress}
          />
        );
      }
      case 2: {
        return <Text>222</Text>;
      }
      default: {
        return null;
      }
    }
  }, [step]);

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
      {content}
    </PageWithHeader>
  );
};

export default SendScreen;

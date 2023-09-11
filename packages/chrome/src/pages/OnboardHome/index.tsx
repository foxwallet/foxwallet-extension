import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import React, { useState, useRef } from "react";
import { B3, H4, L1 } from "../../common/theme/components/text";
import { useNavigate } from "react-router-dom";
import BaseCheckbox from "../../components/Checkbox";
import browser from "webextension-polyfill";
import { keyframes } from "@chakra-ui/react";
import { OnboardLogo } from "../../components/Icon";

const shakeAnimation = keyframes`
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
`;
function OnboardHomeScreen() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [showShakeAnimation, setShowShakeAnimation] = useState(false);

  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      <Flex alignItems={"center"} justifyContent={"center"} w={"full"} flex={1}>
        <OnboardLogo />
      </Flex>
      <Flex direction={"column"} alignItems={"center"} px="8" mb="8">
        <H4>{"The best Web3 wallet entrance to crypto world"}</H4>
      </Flex>
      {/* Open new tab will dismiss the popup window, so check the policy advance */}
      {/* Make onboard progress in a new tab further(Need new design) */}
      <BaseCheckbox
        onStatusChange={(status) => setChecked(status)}
        container={{
          ml: 4,
          mb: 4,
          animation: showShakeAnimation
            ? `${shakeAnimation} 0.82s cubic-bezier(.36,.07,.19,.97) both`
            : "none",
        }}
      >
        <B3>
          {"I agree to FoxWallet's "}
          <B3
            textDecorationLine={"underline"}
            textDecorationColor={"orange.500"}
            color="orange.500"
            onClick={() => {
              browser.tabs.create({
                url: "https://hc.foxwallet.com/terms-of-service",
              });
            }}
          >
            {"User Notice "}
          </B3>
          {"and "}
          <B3
            textDecorationLine={"underline"}
            textDecorationColor={"orange.500"}
            color="orange.500"
            onClick={() => {
              browser.tabs.create({
                url: "https://hc.foxwallet.com/privacy-policy",
              });
            }}
          >
            {"Privacy Policy"}
          </B3>
        </B3>
      </BaseCheckbox>
      <Button
        mx="8"
        mb="4"
        onClick={() => {
          if (!checked) {
            setShowShakeAnimation(true);
            setTimeout(() => setShowShakeAnimation(false), 820);
          } else {
            navigate("/onboard/create");
          }
        }}
      >
        Create Wallet
      </Button>
      <Button mx="8" mb="4">
        Import Wallet
      </Button>
    </Flex>
  );
}

export default OnboardHomeScreen;

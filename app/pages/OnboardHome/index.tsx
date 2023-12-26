import {
  Box,
  Button,
  Flex,
  Image,
  Select,
  Text,
  keyframes,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
} from "@chakra-ui/react";
import React, { useState, useRef } from "react";
import { B3, H4, L1 } from "../../common/theme/components/text";
import { useNavigate } from "react-router-dom";
import BaseCheckbox from "../../components/Custom/Checkbox";
import browser from "webextension-polyfill";
import {
  IconChevronDown,
  IconChevronRight,
  IconFoxWallet,
  IconLogo,
  OnboardLogo,
} from "../../components/Custom/Icon";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { LanguageLabels, SupportLanguages } from "@/locales/i18";

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
  const { selectedAccount } = useCurrAccount();
  const [language, setLanguage] = useState(SupportLanguages.EN);

  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      <Flex pl="6" pr="4" mt="4" justify={"space-between"}>
        <Flex justify={"start"} align={"center"}>
          <IconLogo w="6" h="6" />
          <IconFoxWallet ml="2" />
        </Flex>
        <Menu>
          {({ isOpen }) => (
            <>
              <MenuButton
                as={Button}
                colorScheme="menu"
                px={2}
                py={0}
                rightIcon={
                  isOpen ? (
                    <IconChevronDown w={4} h={4} />
                  ) : (
                    <IconChevronRight w={4} h={4} />
                  )
                }
              >
                <L1>{LanguageLabels[language]}</L1>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setLanguage(SupportLanguages.EN)}>
                  {LanguageLabels[SupportLanguages.EN]}
                </MenuItem>
                <MenuItem onClick={() => setLanguage(SupportLanguages.ZH)}>
                  {LanguageLabels[SupportLanguages.ZH]}
                </MenuItem>
              </MenuList>
            </>
          )}
        </Menu>
      </Flex>
      <Flex
        alignItems={"center"}
        justifyContent={"center"}
        w={"full"}
        flexDir={"column"}
        flex={1}
      >
        <OnboardLogo w={"full"} />
        <Flex direction={"column"} alignItems={"center"} px="6" mb="8">
          <H4>{"The best Web3 wallet"}</H4>
          <H4>{"Entrance to crypto world"}</H4>
        </Flex>
      </Flex>
      {/* Open new tab will dismiss the popup window, so check the policy advance */}
      {/* Make onboard progress in a new tab further(Need new design) */}
      <BaseCheckbox
        onStatusChange={(status) => {
          setChecked(status);
        }}
        container={{
          ml: 6,
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
            textDecorationColor={"green.500"}
            color="green.500"
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
            textDecorationColor={"green.500"}
            color="green.500"
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
        mx="6"
        mb="4"
        onClick={() => {
          if (!checked) {
            setShowShakeAnimation(true);
            setTimeout(() => {
              setShowShakeAnimation(false);
            }, 820);
          } else {
            navigate("/onboard/create");
          }
        }}
      >
        Create Wallet
      </Button>
      <Button
        mx="6"
        mb="14"
        colorScheme="secondary"
        onClick={() => {
          if (!checked) {
            setShowShakeAnimation(true);
            setTimeout(() => {
              setShowShakeAnimation(false);
            }, 820);
          } else {
            navigate("/onboard/import");
          }
        }}
      >
        Import Wallet
      </Button>
    </Flex>
  );
}

export default OnboardHomeScreen;

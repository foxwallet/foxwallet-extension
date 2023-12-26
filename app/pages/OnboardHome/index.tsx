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
import React, { useState, useRef, useCallback } from "react";
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
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useTranslation } from "react-i18next";

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
  const language = usePopupSelector((state) => state.setting.language);
  const dispatch = usePopupDispatch();
  const changeLanguage = useCallback((newLanguage: SupportLanguages) => {
    dispatch.setting.changeLanguage({ language: newLanguage });
  }, []);
  const { t } = useTranslation();

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
                minHeight={8}
                iconSpacing={0}
                rightIcon={
                  isOpen ? (
                    <IconChevronDown w={4} h={4} />
                  ) : (
                    <IconChevronRight w={4} h={4} />
                  )
                }
              >
                <L1 ml={2}>{LanguageLabels[language]}</L1>
              </MenuButton>
              <MenuList
                borderStyle={"solid"}
                borderWidth={1}
                borderRadius={4}
                borderColor={"black"}
                paddingX={"3"}
                paddingY={"2"}
              >
                <MenuItem
                  onClick={() => changeLanguage(SupportLanguages.EN)}
                  fontSize={"xs"}
                  fontWeight={"semibold"}
                >
                  {LanguageLabels[SupportLanguages.EN]}
                </MenuItem>
                <MenuItem
                  onClick={() => changeLanguage(SupportLanguages.ZH)}
                  fontSize={"xs"}
                  fontWeight={"normal"}
                  marginTop={"1"}
                >
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
          <H4>{t("Onboard:Home:slogan1")}</H4>
          <H4>{t("Onboard:Home:slogan2")}</H4>
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
          {t("Agreement:content1")}
          <B3
            textDecorationLine={"underline"}
            textDecorationColor={"green.500"}
            color="green.400"
            onClick={() => {
              browser.tabs.create({
                url: "https://hc.foxwallet.com/terms-of-service",
              });
            }}
          >
            {t("Agreement:content2")}
          </B3>
          {t("Agreement:and")}
          <B3
            textDecorationLine={"underline"}
            textDecorationColor={"green.500"}
            color="green.400"
            onClick={() => {
              browser.tabs.create({
                url: "https://hc.foxwallet.com/privacy-policy",
              });
            }}
          >
            {t("Agreement:content3")}
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
        {t("Wallet:Create:title")}
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
        {t("Wallet:Import:title")}
      </Button>
    </Flex>
  );
}

export default OnboardHomeScreen;

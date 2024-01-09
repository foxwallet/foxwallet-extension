import { HELP_CENTER_URL } from "@/common/constants";
import {
  IconChevronRight,
  IconCommunity,
  IconGuide,
  IconLogo,
  IconSecurityTips,
  IconSettings,
  IconWallet,
} from "@/components/Custom/Icon";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import SettingItem from "@/components/Setting/SettingItem";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useCurrWallet } from "@/hooks/useWallets";
import { Content } from "@/layouts/Content";
import { Box, Divider, Flex, TabPanel, Text } from "@chakra-ui/react";
import i18next from "i18next";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

export const MeTab = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedAccount } = useCurrAccount();
  const { selectedWallet } = useCurrWallet();

  const onSwitchWallet = useCallback(() => {
    navigate("/manage_wallet");
  }, [navigate]);

  const onWalletDetail = useCallback(() => {
    navigate(`/wallet_detail/${selectedWallet?.walletId}`);
  }, [navigate, selectedWallet?.walletId]);

  const onGuide = useCallback(() => {
    const url =
      i18next.resolvedLanguage === "zh"
        ? `${HELP_CENTER_URL}/zh/docs/`
        : `${HELP_CENTER_URL}/docs/`;
    browser.tabs.create({ url });
  }, []);

  const onCummunity = useCallback(() => {
    navigate("/community");
  }, [navigate]);

  const onSecurityTips = useCallback(() => {
    const url =
      i18next.resolvedLanguage === "zh"
        ? `${HELP_CENTER_URL}/zh/docs/security-tips`
        : `${HELP_CENTER_URL}/docs/security-tips`;
    browser.tabs.create({ url });
  }, []);

  const onSettings = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  const { borderColor } = useThemeStyle();

  return (
    <TabPanel>
      <Flex
        p={5}
        pb={2.5}
        as={"button"}
        direction={"row"}
        align={"center"}
        justify={"space-between"}
        borderBottomWidth={"1px"}
        borderColor={borderColor}
        w={"100%"}
        onClick={onSwitchWallet}
      >
        <Flex align={"center"}>
          <IconLogo w={8} h={8} mr={2} />
          <Flex direction={"column"} align={"flex-start"}>
            <Text fontSize={14} fontWeight={"bold"}>
              {selectedWallet?.walletName}
            </Text>
            <Box
              fontSize={11}
              color={"gray.500"}
              fontWeight={500}
              noOfLines={1}
            >
              <MiddleEllipsisText text={selectedAccount.address} width={150} />
            </Box>
          </Flex>
        </Flex>
        <IconChevronRight w={18} h={18} />
      </Flex>
      <Content>
        <SettingItem
          title={t("Setting:account")}
          icon={<IconWallet w={4} h={4} />}
          onPress={onWalletDetail}
        />
        <SettingItem
          title={t("Setting:guide")}
          icon={<IconGuide w={4} h={4} />}
          onPress={onGuide}
        />
        <SettingItem
          title={t("Setting:community")}
          icon={<IconCommunity w={4} h={4} />}
          onPress={onCummunity}
        />
        <Divider h={"1px"} mb={2.5} />
        <SettingItem
          title={t("Setting:securityTips")}
          icon={<IconSecurityTips w={4} h={4} />}
          onPress={onSecurityTips}
        />
        <Divider h={"1px"} mb={2.5} />
        <SettingItem
          title={t("Setting:settings")}
          icon={<IconSettings w={4} h={4} />}
          onPress={onSettings}
        />
      </Content>
    </TabPanel>
  );
};

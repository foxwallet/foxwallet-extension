import { HELP_CENTER_URL } from "@/common/constants";
import {
  IconChevronRight,
  IconCommunity,
  IconConnect,
  IconContact,
  IconGuide,
  IconLogo,
  IconNetwork,
  IconSecurityTips,
  IconSettings,
  IconWallet,
} from "@/components/Custom/Icon";
import SettingItem from "@/components/Setting/SettingItem";
import { useGroupAccount } from "@/hooks/useGroupAccount";
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
  const { groupAccount } = useGroupAccount();
  const { selectedWallet } = useCurrWallet();

  const onSwitchWallet = useCallback(() => {
    navigate("/manage_wallet");
  }, [navigate]);

  const onWalletDetail = useCallback(() => {
    if (selectedWallet) {
      navigate(`/wallet_detail/${selectedWallet.walletId}`);
    }
  }, [navigate, selectedWallet]);

  const onGuide = useCallback(() => {
    const url =
      i18next.resolvedLanguage === "zh"
        ? `${HELP_CENTER_URL}/zh/blog/aleo-extension-tutorial`
        : `${HELP_CENTER_URL}/blog/aleo-extension-tutorial`;
    void browser.tabs.create({ url });
  }, []);

  const onCummunity = useCallback(() => {
    navigate("/community");
  }, [navigate]);

  const onSecurityTips = useCallback(() => {
    const url =
      i18next.resolvedLanguage === "zh"
        ? `${HELP_CENTER_URL}/zh/docs/security-tips`
        : `${HELP_CENTER_URL}/docs/security-tips`;
    void browser.tabs.create({ url });
  }, []);

  const onSettings = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  const onNetworks = useCallback(() => {
    navigate("/networks");
  }, [navigate]);

  const onContact = useCallback(() => {
    navigate(`/contacts/manage?uniqueId=`);
  }, [navigate]);

  const onConnectedSites = useCallback(() => {
    navigate("/connected_sites");
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
              <Text maxW={270}>{groupAccount?.group.groupName}</Text>
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
          title={t("Setting:networks")}
          icon={<IconNetwork w={4} h={4} />}
          onPress={onNetworks}
        />
        <SettingItem
          title={t("Setting:contacts")}
          icon={<IconContact w={4} h={4} />}
          onPress={onContact}
        />
        {/* <SettingItem */}
        {/*  title={t("Setting:connectedSites")} */}
        {/*  icon={<IconConnect w={4} h={4} />} */}
        {/*  onPress={onConnectedSites} */}
        {/* /> */}
        <Divider h={"1px"} mb={2.5} />
        <SettingItem
          title={t("Setting:tutorial")}
          icon={<IconGuide w={4} h={4} />}
          onPress={onGuide}
        />
        <SettingItem
          title={t("Setting:community")}
          icon={<IconCommunity w={4} h={4} />}
          onPress={onCummunity}
        />
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

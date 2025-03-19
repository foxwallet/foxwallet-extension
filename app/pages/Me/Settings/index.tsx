import {
  IconChevronDown,
  IconCurrency,
  IconEdit,
  IconAbout,
  IconLanguage,
  IconReset,
} from "@/components/Custom/Icon";
import { showConfirmResyncDialog } from "@/components/Setting/ConfirmResyncDialog";
import SettingItem from "@/components/Setting/SettingItem";
import { useClient } from "@/hooks/useClient";
import { usePopupSelector } from "@/hooks/useStore";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { LanguageLabels } from "@/locales/i18";
import { isEqual } from "lodash";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Text } from "@chakra-ui/react";
import { showResetApplicationDialog } from "@/components/Wallet/ResetApplicationDialog";
import { useWallets } from "@/hooks/useWallets";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currLanguage } = usePopupSelector(
    (state) => ({
      currLanguage: state.setting.language,
      currCurrency: state.setting.currency,
    }),
    isEqual,
  );
  const { popupServerClient } = useClient();
  const { resetWallet } = useWallets();

  const onModifyPassword = useCallback(() => {
    navigate("/change_password");
  }, [navigate]);

  const onLanguage = useCallback(() => {
    navigate("/manage_language");
  }, [navigate]);

  const onCurrency = useCallback(() => {
    navigate("/manage_currency");
  }, [navigate]);

  const onResetAleoStatus = useCallback(async () => {
    try {
      const { confirmed } = await showConfirmResyncDialog();
      if (confirmed) {
        return await popupServerClient.rescanAleo();
        // return await popupServerClient.resetChain();
      }
    } catch (err) {
      console.error(err);
    }
  }, [popupServerClient]);

  const onReset = useCallback(async () => {
    try {
      const { confirmed } = await showResetApplicationDialog();
      if (confirmed) {
        const res = await resetWallet();
        if (res) {
          navigate("/onboard/home");
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [navigate, resetWallet]);

  const onAbout = useCallback(() => {
    navigate("/about");
  }, [navigate]);

  return (
    <PageWithHeader title={t("Setting:settings")}>
      <Content>
        {/* <SettingItem
          title={t("Password:title")}
          icon={<IconEdit w={4} h={4} />}
          onPress={onModifyPassword}
        /> */}
        <SettingItem
          title={t("Language:title")}
          subtitle={LanguageLabels[currLanguage]}
          icon={<IconLanguage w={4} h={4} />}
          onPress={onLanguage}
        />
        {/* <SettingItem
          title={t("Currency:title")}
          subtitle={CURRENCY[currCurrency].symbol}
          icon={<IconCurrency w={4} h={4} />}
          onPress={onCurrency}
        /> */}
        {/* <SettingItem */}
        {/*  title={t("Reset:account")} */}
        {/*  icon={<IconReset w={"16px"} h={"16px"} />} */}
        {/*  noNext */}
        {/*  onPress={onResetAleoStatus} */}
        {/* /> */}
        <SettingItem
          title={t("About:title")}
          icon={<IconAbout w={4} h={4} />}
          onPress={onAbout}
        />
        <Button
          onClick={() => {
            navigate("/manage_wallet");
          }}
        >
          {t("Setting:switchWallet")}
        </Button>
        <Flex
          w={"full"}
          h={10}
          alignItems={"center"}
          justifyContent={"center"}
          mt={4}
        >
          <Text
            onClick={onReset}
            cursor={"pointer"}
            textDecoration={"underline"}
            textColor={"#EF466F"}
          >
            {t("Setting:resetApplication")}
          </Text>
        </Flex>
      </Content>
    </PageWithHeader>
  );
};

export default SettingsScreen;

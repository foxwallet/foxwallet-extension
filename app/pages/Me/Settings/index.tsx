import {
  IconChevronDown,
  IconCurrency,
  IconEdit,
  IconInfo,
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
import { CoinType } from "core/types";
import { isEqual } from "lodash";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

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
      }
    } catch (err) {
      console.error(err);
    }
  }, [popupServerClient]);

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
        <SettingItem
          title={t("Reset:account")}
          icon={<IconReset w={"16px"} h={"16px"} />}
          noNext
          onPress={onResetAleoStatus}
        />
        <SettingItem
          title={t("About:title")}
          icon={<IconInfo w={4} h={4} />}
          onPress={onAbout}
        />
        <Button onClick={() => navigate("/manage_wallet")}>
          {t("Setting:switchWallet")}
        </Button>
      </Content>
    </PageWithHeader>
  );
};

export default SettingsScreen;

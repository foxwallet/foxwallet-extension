import {
  IconCurrency,
  IconEdit,
  IconInfo,
  IconLanguage,
} from "@/components/Custom/Icon";
import SettingItem from "@/components/Setting/SettingItem";
import { usePopupSelector } from "@/hooks/useStore";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { LanguageLabels } from "@/locales/i18";
import { CURRENCY } from "core/constants";
import { isEqual } from "lodash";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

  const onModifyPassword = useCallback(() => {
    navigate("/change_password");
  }, [navigate]);

  const onLanguage = useCallback(() => {
    navigate("/manage_language");
  }, [navigate]);

  const onCurrency = useCallback(() => {
    navigate("/manage_currency");
  }, [navigate]);

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
          title={t("About:title")}
          icon={<IconInfo w={4} h={4} />}
          onPress={onAbout}
        />
      </Content>
    </PageWithHeader>
  );
};

export default SettingsScreen;

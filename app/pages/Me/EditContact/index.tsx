import { useClient } from "@/hooks/useClient";
import { usePopupSelector } from "@/hooks/useStore";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

const EditContactScreen = () => {
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

  return (
    <PageWithHeader title={t("Contacts:editContact")}>
      <Content></Content>
    </PageWithHeader>
  );
};

export default EditContactScreen;

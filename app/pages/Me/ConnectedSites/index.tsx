import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

const ConnectedSitesScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageWithHeader title={t("Setting:connectedSites")}>
      <Content></Content>
    </PageWithHeader>
  );
};

export default ConnectedSitesScreen;

import { H1, H3 } from "@/common/theme/components/text";
import { Content } from "@/layouts/Content";
import { TabPanel } from "@chakra-ui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const SettingTab = () => {
  const navigate = useNavigate();

  const onManageWallet = useCallback(() => {
    navigate("/manage_wallet");
  }, []);

  const onLanguage = useCallback(() => {
    navigate("/manage_language");
  }, []);

  const onResync = useCallback(() => {}, []);

  const onReset = useCallback(() => {}, []);

  return (
    <TabPanel>
      <Content>
        <H1>Setting</H1>
        <H3>Manage Wallet</H3>
        <H3>Languase</H3>
        <H3>Resync current account</H3>
        <H3>Reset</H3>
      </Content>
    </TabPanel>
  );
};

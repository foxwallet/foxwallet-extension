import { H1, H3, H6 } from "@/common/theme/components/text";
import { useClient } from "@/hooks/useClient";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Content } from "@/layouts/Content";
import { TabPanel } from "@chakra-ui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const SettingTab = () => {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { popupServerClient } = useClient();

  const onManageWallet = useCallback(() => {
    navigate("/manage_wallet");
  }, [navigate]);

  const onLanguage = useCallback(() => {
    navigate("/manage_language");
  }, [navigate]);

  const onResync = useCallback(async () => {
    await popupServerClient.rescanAleo({ uniqueId, account: selectedAccount });
  }, [popupServerClient, selectedAccount, uniqueId]);

  const onReset = useCallback(() => {}, []);

  return (
    <TabPanel>
      <Content>
        <H3>Setting</H3>
        <H6 onClick={() => onManageWallet()}>Manage Wallet</H6>
        <H6 onClick={() => onLanguage()}>Language</H6>
        <H6 onClick={() => onResync()}>Resync current account</H6>
        <H6>Reset</H6>
      </Content>
    </TabPanel>
  );
};

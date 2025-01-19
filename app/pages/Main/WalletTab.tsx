import { TabPanel } from "@chakra-ui/react";
import { AccountInfoHeader } from "@/components/Wallet/AccountInfoHeader";
import { BackupReminderView } from "@/components/Wallet/BackupReminderView";
import { HomeTabList } from "@/components/Wallet/HomeTabList";
import { useEffect } from "react";
import { usePopupDispatch } from "@/hooks/useStore";
import { useGroupAccountAssets } from "@/hooks/useGroupAccountAssets";

export const WalletTab = () => {
  const dispatch = usePopupDispatch();
  useEffect(() => {
    void dispatch.accountV2.resyncAllWalletsToStore();
  }, [dispatch.accountV2]);

  const { assets, totalUsdValue } = useGroupAccountAssets();

  return (
    <TabPanel h={"100vh"} display={"flex"} flexDir={"column"}>
      <AccountInfoHeader totalUsdValue={totalUsdValue} />
      <BackupReminderView />
      <HomeTabList assets={assets} />
    </TabPanel>
  );
};

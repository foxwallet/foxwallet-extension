import { TabPanel } from "@chakra-ui/react";
import { AccountInfoHeader } from "@/components/Wallet/AccountInfoHeader";
import { BackupReminderView } from "@/components/Wallet/BackupReminderView";
import { HomeTabList } from "@/components/Wallet/HomeTabList";
import { useEffect } from "react";
import { usePopupDispatch } from "@/hooks/useStore";

export const WalletTab = () => {
  const dispatch = usePopupDispatch();
  useEffect(() => {
    dispatch.account.resyncAllWalletsToStore();
  }, [dispatch.account]);

  return (
    <TabPanel h={"100vh"} display={"flex"} flexDir={"column"}>
      <AccountInfoHeader />
      <BackupReminderView />
      <HomeTabList />
    </TabPanel>
  );
};

import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useTxHistory } from "@/hooks/useTxHistory";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import {
  AleoHistoryItem,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { AleoTxStatus } from "core/coins/ALEO/types/Tranaction";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabIndicator,
} from "@chakra-ui/react";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { WalletTab } from "./WalletTab";
import { SettingTab } from "./SettingTab";

function OnboardHomeScreen() {
  return (
    <Flex flexDirection={"column"} flex={1} alignItems={"stretch"}>
      <Tabs variant={"unstyled"} flex={1}>
        <TabPanels>
          <WalletTab />
          <SettingTab />
        </TabPanels>
        <TabList
          position={"absolute"}
          bottom={0}
          left={0}
          right={0}
          height={50}
        >
          <Tab flex={1} justifyContent={"center"} alignItems={"center"}>
            Wallet
          </Tab>
          <Tab flex={1} justifyContent={"center"} alignItems={"center"}>
            Settings
          </Tab>
        </TabList>
      </Tabs>
    </Flex>
  );
}

export default OnboardHomeScreen;

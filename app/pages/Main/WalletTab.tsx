import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useTxHistory } from "@/hooks/useTxHistory";
import { Content } from "@/layouts/Content";
import { Button, Flex } from "@chakra-ui/react";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import {
  AleoHistoryItem,
  AleoLocalHistoryItem,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { AleoTxStatus } from "core/coins/ALEO/types/Tranaction";
import { useNavigate } from "react-router-dom";
import { TabPanel } from "@chakra-ui/react";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { NativeToken } from "core/types/Token";
import { AccountInfoHeader } from "@/components/Wallet/AccountInfoHeader";
import { BackupReminderView } from "@/components/Wallet/BackupReminderView";
import { HomeTabList } from "@/components/Wallet/HomeTabList";
import { useEffect } from "react";
import { usePopupDispatch } from "@/hooks/useStore";

const HistoryItem = (props: {
  item: AleoHistoryItem;
  nativeCurrency: NativeToken;
}) => {
  const { item, nativeCurrency } = props;

  const { status, programId, functionName, addressType, amount, txId } = item;

  const statusPrefix = status === AleoTxStatus.FINALIZD ? "" : status;

  if (programId === NATIVE_TOKEN_PROGRAM_ID) {
    return (
      <Flex key={txId} mt={2}>
        {statusPrefix}&nbsp;
        {functionName.startsWith("transfer")
          ? functionName.slice(9)
          : functionName}
        &nbsp;
        {addressType}&nbsp;
        {amount && (
          <TokenNum
            amount={BigInt(amount)}
            decimals={nativeCurrency.decimals}
            symbol={nativeCurrency.symbol}
          />
        )}
      </Flex>
    );
  }
  if (addressType === AleoTxAddressType.SEND) {
    return (
      <Flex key={txId} mt={2}>
        {statusPrefix}&nbsp;Call&nbsp;{programId}&nbsp;
        {functionName}
      </Flex>
    );
  }
  return (
    <Flex key={txId} mt={2}>
      {statusPrefix}&nbsp;Received from&nbsp;{programId}&nbsp;
      {functionName}
    </Flex>
  );
};

export const WalletTab = () => {
  const dispatch = usePopupDispatch();
  useEffect(() => {
    dispatch.account.resyncAllWalletsToStore();
  }, [dispatch.account]);

  return (
    <TabPanel>
      <AccountInfoHeader />
      {/* todo */}
      <BackupReminderView />
      <HomeTabList />
    </TabPanel>
  );
};

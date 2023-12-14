import { useBalance } from "@/hooks/useBalance";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { Button, Flex, Text, chakra } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { L1 } from "@/common/theme/components/text";
import { Content } from "@/layouts/Content";
import { useWallets } from "@/hooks/useWallets";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";

function ManageWalletScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { wallets } = useWallets();

  const allWallets = useMemo(() => {
    if (!wallets) {
      return [];
    }
    const hdWallets = wallets[WalletType.HD] ?? [];
    const simpleWallets = wallets[WalletType.SIMPLE] ?? [];
    return [...hdWallets, ...simpleWallets];
  }, [wallets]);

  return (
    <PageWithHeader enableBack title="Receive">
      <Content>{}</Content>
    </PageWithHeader>
  );
}

export default ManageWalletScreen;

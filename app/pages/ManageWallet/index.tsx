import { useBalance } from "@/hooks/useBalance";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { Button, Flex, Text, chakra } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { H6, L1 } from "@/common/theme/components/text";
import { Content } from "@/layouts/Content";
import { useWallets } from "@/hooks/useWallets";
import { WalletType } from "@/scripts/background/store/vault/types/keyring";
import { useTranslation } from "react-i18next";

function ManageWalletScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    <PageWithHeader enableBack title={t("Setting:ManageWallet:title")}>
      <Content>
        {allWallets.map((wallet) => {
          return <H6 key={wallet.walletId}>{wallet.walletName}</H6>;
        })}
        <Button onClick={() => navigate("/create_wallet")}>
          {t("Setting:ManageWallet:create")}
        </Button>
      </Content>
    </PageWithHeader>
  );
}

export default ManageWalletScreen;

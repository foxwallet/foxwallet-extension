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

function LanguageScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();

  return (
    <PageWithHeader enableBack title="Receive">
      <Content>{}</Content>
    </PageWithHeader>
  );
}

export default LanguageScreen;

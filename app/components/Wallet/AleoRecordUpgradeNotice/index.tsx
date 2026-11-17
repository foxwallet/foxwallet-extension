import { Button, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useAleoRecordUpgrades } from "@/hooks/useAleoRecordUpgrades";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export function AleoRecordUpgradeNotice({ count }: { count: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!count) return null;
  return (
    <Flex
      direction="column"
      gap={2}
      bg="green.50"
      borderRadius="lg"
      p={3}
      my={2}
    >
      <Text fontSize="sm">{t("RecordUpgrade:notice", { count })}</Text>
      <Button
        type="button"
        size="sm"
        onClick={() => navigate("/aleo_record_upgrade")}
      >
        {t("RecordUpgrade:title")}
      </Button>
    </Flex>
  );
}

function AccountReminder({ address }: { address: string }) {
  const { legacyRecords } = useAleoRecordUpgrades(address);
  return <AleoRecordUpgradeNotice count={legacyRecords.length} />;
}

export function AleoRecordUpgradeReminder() {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const account = getMatchAccountsWithUniqueId(
    InnerChainUniqueId.ALEO_MAINNET,
  )[0];
  return account ? (
    <AccountReminder
      key={account.account.address}
      address={account.account.address}
    />
  ) : null;
}

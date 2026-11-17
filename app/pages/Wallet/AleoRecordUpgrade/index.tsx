import { useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useCoinService } from "@/hooks/useCoinService";
import { useAleoRecordUpgrades } from "@/hooks/useAleoRecordUpgrades";
import { useClient } from "@/hooks/useClient";
import { PageWithHeader } from "@/layouts/Page";
import { Content } from "@/layouts/Content";
import { LoadingView } from "@/components/Custom/Loading";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoTxStatus } from "core/coins/ALEO/types/Transaction";
import { type RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { getRecordUpgradeTransaction } from "core/coins/ALEO/utils/recordUpgrade";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";

function UpgradeAccount({ account }: { account: OneMatchAccount }) {
  const { t } = useTranslation();
  const address = account.account.address;
  const { chainConfig, nativeCurrency } = useCoinService(
    InnerChainUniqueId.ALEO_MAINNET,
  );
  const { popupServerClient } = useClient();
  const {
    upgradeableRecords,
    unsupportedRecords,
    readyRecords,
    transactions,
    loading,
    error,
    fetchRecords,
    refreshTransactions,
    upgradeBusy,
  } = useAleoRecordUpgrades(address);
  const [batch, setBatch] = useState<RecordDetailWithSpent[] | null>(null);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const rows = useMemo(
    () =>
      (batch ?? upgradeableRecords).map((record) => ({
        record,
        tx: getRecordUpgradeTransaction(record, transactions),
      })),
    [batch, upgradeableRecords, transactions],
  );
  const running = rows.some(
    ({ tx }) =>
      tx &&
      [
        AleoTxStatus.QUEUED,
        AleoTxStatus.GENERATING_PROVER_FILES,
        AleoTxStatus.GENERATING_TRANSACTION,
        AleoTxStatus.BROADCASTING,
      ].includes(tx.status),
  );
  const processed = rows.filter(
    ({ tx }) =>
      tx &&
      ![
        AleoTxStatus.QUEUED,
        AleoTxStatus.GENERATING_PROVER_FILES,
        AleoTxStatus.GENERATING_TRANSACTION,
        AleoTxStatus.BROADCASTING,
      ].includes(tx.status),
  ).length;
  const statusLabels = {
    [AleoTxStatus.QUEUED]: t("RecordUpgrade:queued"),
    [AleoTxStatus.GENERATING_PROVER_FILES]: t("RecordUpgrade:proving"),
    [AleoTxStatus.GENERATING_TRANSACTION]: t("RecordUpgrade:proving"),
    [AleoTxStatus.BROADCASTING]: t("RecordUpgrade:broadcasting"),
    [AleoTxStatus.COMPLETED]: t("RecordUpgrade:submitted"),
    [AleoTxStatus.FINALIZD]: t("RecordUpgrade:confirmed"),
    [AleoTxStatus.FAILED]: t("RecordUpgrade:failed"),
    [AleoTxStatus.REJECTED]: t("RecordUpgrade:failed"),
    [AleoTxStatus.UNACCEPTED]: t("RecordUpgrade:failed"),
  };
  const submit = async () => {
    if (startingRef.current || upgradeBusy || !readyRecords.length) return;
    startingRef.current = true;
    setStarting(true);
    setSubmitError("");
    try {
      await popupServerClient.upgradeAleoRecords({
        uniqueId: chainConfig.uniqueId,
        chainId: chainConfig.chainId,
        coinType: chainConfig.coinType,
        walletId: account.wallet.walletId,
        accountId: account.account.accountId,
        address,
        commitments: readyRecords.map((record) => record.commitment),
      });
      setBatch(readyRecords);
      await refreshTransactions();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };
  const refresh = async () => {
    setSubmitError("");
    try {
      await fetchRecords();
      await refreshTransactions();
      setBatch(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };
  return (
    <Content gap={3} overflowY="auto">
      <Text fontSize="sm">{t("RecordUpgrade:hint")}</Text>
      <Text fontSize="sm" color="gray.500">
        {t("RecordUpgrade:waitHint")}
      </Text>
      <Box p={3} bg="gray.50" borderRadius="lg">
        <MiddleEllipsisText text={address} />
        <Flex justify="space-between" mt={2} fontSize="sm">
          <Text>{t("RecordUpgrade:fee")}</Text>
          <Text>0 ALEO</Text>
        </Flex>
      </Box>
      {loading ? (
        <LoadingView />
      ) : (
        <>
          {!rows.length && !unsupportedRecords.length && !error && (
            <Text role="status">{t("RecordUpgrade:empty")}</Text>
          )}
          {!!rows.length && (
            <>
              <Text role="status">
                {t("RecordUpgrade:progress", {
                  done: processed,
                  total: rows.length,
                })}
              </Text>
              <Box
                as="progress"
                value={processed}
                max={rows.length}
                aria-label={t("RecordUpgrade:title")}
                w="full"
                sx={{ accentColor: "green.500" }}
              />
              {rows.map(({ record, tx }) => (
                <Box
                  key={record.commitment}
                  py={3}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Flex justify="space-between" gap={2}>
                    <MiddleEllipsisText text={record.commitment} width={150} />
                    <TokenNum
                      amount={record.parsedContent?.microcredits ?? 0n}
                      decimals={nativeCurrency.decimals}
                      symbol={nativeCurrency.symbol}
                    />
                  </Flex>
                  <Text
                    fontSize="sm"
                    color={tx?.error ? "red.500" : "gray.500"}
                    mt={1}
                  >
                    {tx ? statusLabels[tx.status] : t("RecordUpgrade:ready")}
                  </Text>
                  {tx?.error && (
                    <Text fontSize="sm" color="red.500" overflowWrap="anywhere">
                      {tx.error.slice(0, 240)}
                    </Text>
                  )}
                </Box>
              ))}
            </>
          )}
          {unsupportedRecords.map(({ record, error: recordError }) => (
            <Box
              key={record.commitment}
              py={3}
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <Flex justify="space-between" gap={2}>
                <MiddleEllipsisText text={record.commitment} width={150} />
                <TokenNum
                  amount={record.parsedContent?.microcredits ?? 0n}
                  decimals={nativeCurrency.decimals}
                  symbol={nativeCurrency.symbol}
                />
              </Flex>
              <Text
                role="status"
                fontSize="sm"
                color="red.500"
                overflowWrap="anywhere"
                mt={1}
              >
                {recordError}
              </Text>
            </Box>
          ))}
        </>
      )}
      {(submitError || error) && (
        <Text role="alert" color="red.500" overflowWrap="anywhere">
          {submitError ||
            (error instanceof Error ? error.message : String(error))}
        </Text>
      )}
      <Button
        type="button"
        onClick={submit}
        isLoading={starting || upgradeBusy}
        isDisabled={loading || !!error || !readyRecords.length}
        mt="auto"
        flexShrink={0}
      >
        {t("RecordUpgrade:upgradeCount", { count: readyRecords.length })}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={refresh}
        isDisabled={starting || running}
      >
        {t("RecordUpgrade:refresh")}
      </Button>
    </Content>
  );
}

export default function AleoRecordUpgrade() {
  const { t } = useTranslation();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const account = getMatchAccountsWithUniqueId(
    InnerChainUniqueId.ALEO_MAINNET,
  )[0];
  return (
    <PageWithHeader title={t("RecordUpgrade:title")}>
      {account && (
        <UpgradeAccount key={account.account.address} account={account} />
      )}
    </PageWithHeader>
  );
}

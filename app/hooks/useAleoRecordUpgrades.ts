import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { liveQuery } from "dexie";
import { AleoTxStatus } from "core/coins/ALEO/types/Transaction";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { AleoStorage } from "@/scripts/background/store/aleo/AleoStorage";
import {
  getCreditsRecordUpgradeCandidates,
  getRecordUpgradeTransaction,
  isRecordUpgradeInProgress,
} from "core/coins/ALEO/utils/recordUpgrade";
import { useCoinService } from "./useCoinService";
import { useRecords } from "./useRecord";

export function useAleoRecordUpgrades(address: string) {
  const uniqueId = InnerChainUniqueId.ALEO_MAINNET;
  const { chainConfig } = useCoinService(uniqueId);
  const result = useRecords({ uniqueId, address });
  const fetchTransactions = useMemo(
    () => async () => {
      const db = await AleoStorage.getInstance().getBlockDBInstance(
        chainConfig.chainId,
      );
      return await db.txs
        .where({ address })
        .filter(
          (tx) =>
            tx.programId === "credits.aleo" && tx.functionName === "upgrade",
        )
        .toArray();
    },
    [address, chainConfig.chainId],
  );
  const {
    data: transactions = [],
    mutate: refreshTransactions,
    isLoading: loadingTransactions,
    error: transactionError,
  } = useSWR(
    address ? ["aleo-record-upgrades", chainConfig.chainId, address] : null,
    fetchTransactions,
  );
  useEffect(() => {
    if (!address) return;
    const subscription = liveQuery(fetchTransactions).subscribe({
      next: (txs) => {
        void refreshTransactions(txs, { revalidate: false });
      },
      error: () => {
        void refreshTransactions().catch(() => {
          // SWR exposes the query error to the page.
        });
      },
    });
    return () => subscription.unsubscribe();
  }, [address, fetchTransactions, refreshTransactions]);
  const { legacyRecords, upgradeableRecords, unsupportedRecords } = useMemo(
    () => getCreditsRecordUpgradeCandidates(result.records),
    [result.records],
  );
  const readyRecords = useMemo(
    () =>
      upgradeableRecords.filter(
        (record) =>
          !isRecordUpgradeInProgress(
            getRecordUpgradeTransaction(record, transactions),
          ),
      ),
    [upgradeableRecords, transactions],
  );
  const upgradeBusy = transactions.some((tx) =>
    [
      AleoTxStatus.QUEUED,
      AleoTxStatus.GENERATING_PROVER_FILES,
      AleoTxStatus.GENERATING_TRANSACTION,
      AleoTxStatus.BROADCASTING,
    ].includes(tx.status),
  );
  return {
    ...result,
    loading: result.loading || loadingTransactions,
    error: result.error ?? transactionError,
    legacyRecords,
    upgradeableRecords,
    unsupportedRecords,
    readyRecords,
    transactions,
    refreshTransactions,
    upgradeBusy,
  };
}

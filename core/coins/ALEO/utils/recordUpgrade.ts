import { NATIVE_TOKEN_PROGRAM_ID } from "../constants";
import { parseRecordContent } from "../service/scanner/recordAdapter";
import { type RecordDetailWithSpent } from "../types/SyncTask";
import { type AleoLocalTxInfo, AleoTxStatus } from "../types/Transaction";

// Records created before the inclusion upgrade can omit _version entirely.
export function getCreditsRecordVersion(plaintext: string): number | undefined {
  const version = parseRecordContent(plaintext)._version;
  if (version === undefined) return 0;
  const match = /^(\d+)u8\.public$/.exec(version);
  return match ? Number(match[1]) : undefined;
}

export function needsCreditsRecordUpgrade(record: RecordDetailWithSpent) {
  return (
    record.programId === NATIVE_TOKEN_PROGRAM_ID &&
    !record.spent &&
    getCreditsRecordVersion(record.plaintext) === 0
  );
}

export function getLegacyCreditsRecords(records: RecordDetailWithSpent[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (!needsCreditsRecordUpgrade(record) || seen.has(record.commitment)) {
      return false;
    }
    seen.add(record.commitment);
    return true;
  });
}

function recordNonce(plaintext: string) {
  return parseRecordContent(plaintext)._nonce;
}

export function getRecordUpgradeTransaction(
  record: RecordDetailWithSpent,
  transactions: AleoLocalTxInfo[],
) {
  const nonce = recordNonce(record.plaintext);
  if (!nonce) return undefined;
  return transactions
    .filter(
      (tx) =>
        tx.programId === NATIVE_TOKEN_PROGRAM_ID &&
        tx.functionName === "upgrade" &&
        tx.inputs.length === 1 &&
        recordNonce(tx.inputs[0]) === nonce,
    )
    .sort((a, b) => b.timestamp - a.timestamp)[0];
}

export function isRecordUpgradeInProgress(tx?: AleoLocalTxInfo) {
  return (
    !!tx &&
    ![
      AleoTxStatus.FAILED,
      AleoTxStatus.REJECTED,
      AleoTxStatus.UNACCEPTED,
    ].includes(tx.status)
  );
}

export function validateCreditsRecordUpgrade(plaintext: string) {
  const content = parseRecordContent(plaintext);
  if (getCreditsRecordVersion(plaintext) !== 0 || !content._nonce) {
    throw new Error("Only legacy Aleo credits records can be upgraded");
  }
  const amount = /^(\d+)u64\.private$/.exec(content.microcredits ?? "");
  if (!amount || BigInt(amount[1]) > 1_000_000_000_000n) {
    throw new Error(
      "Aleo record upgrade supports at most 1,000,000 ALEO per record",
    );
  }
  return BigInt(amount[1]).toString();
}

export function assertCreditsRecordsUpgraded(
  programId: string,
  functionName: string,
  inputs: string[],
  feeRecord: string | null,
) {
  const records =
    programId === NATIVE_TOKEN_PROGRAM_ID && functionName !== "upgrade"
      ? [...inputs, ...(feeRecord ? [feeRecord] : [])]
      : feeRecord
      ? [feeRecord]
      : [];
  for (const input of records) {
    const content = parseRecordContent(input);
    if (
      content.owner &&
      content._nonce &&
      content.microcredits &&
      getCreditsRecordVersion(input) === 0
    ) {
      throw new Error(
        "Legacy Aleo credits records must be upgraded first. Open Upgrade records in the wallet.",
      );
    }
  }
}

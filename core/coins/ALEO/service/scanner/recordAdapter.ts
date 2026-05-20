import { RecordPlaintext } from "aleo_wasm_mainnet";
import {
  ALPHA_TOKEN_PROGRAM_ID,
  ARCANE_PROGRAM_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import type { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { parseU128, parseU64 } from "core/coins/ALEO/utils/num";
import type { OwnedRecord } from "./ScannerTypes";

type AleoRecordContent = Record<string, string>;

export function ownedToRecordDetail(
  record: OwnedRecord,
): RecordDetailWithSpent {
  // Parse the plaintext once. We need both the JSON-shaped content (for
  // downstream filters / parsedContent) and the WASM RecordPlaintext
  // instance so we can pull `.nonce()` — RSS does not include nonce in
  // the response payload.
  const recordPlaintext = RecordPlaintext.fromString(record.recordPlaintext);
  const content = JSON.parse(recordPlaintext.toJSON()) as AleoRecordContent;
  const nonce = recordPlaintext.nonce();

  // commitment is the canonical map key downstream (recordsMap is keyed
  // by commitment). ProvableScannerService requests it by default; a
  // missing commitment is a server bug and we'd rather crash loudly than
  // collide records on the tag.
  if (!record.commitment) {
    throw new Error(
      `OwnedRecord missing commitment (tag=${record.tag}, program=${record.programName})`,
    );
  }

  return {
    commitment: record.commitment,
    programId: record.programName,
    functionName: record.functionName ?? "",
    plaintext: record.recordPlaintext,
    ciphertext: record.recordCiphertext ?? "",
    content,
    nonce,
    tag: record.tag,
    transactionId: record.transactionId ?? "",
    transitionId: record.transitionId ?? "",
    height: record.blockHeight ? Number(record.blockHeight) : 0,
    timestamp: 0,
    recordName: record.recordName,
    spent: record.spent ?? false,
    parsedContent: parseRecordParsedContent(record.programName, content),
  };
}

export function parseRecordContent(plaintext: string): AleoRecordContent {
  return JSON.parse(RecordPlaintext.fromString(plaintext).toJSON());
}

export function parseRecordParsedContent(
  programId: string,
  content: AleoRecordContent,
): Record<string, bigint | string> | undefined {
  if (programId === NATIVE_TOKEN_PROGRAM_ID && content.microcredits) {
    return {
      microcredits: parseU64(content.microcredits),
    };
  }

  if (programId === ALPHA_TOKEN_PROGRAM_ID && content.token && content.amount) {
    return {
      token: stripVisibilitySuffix(content.token),
      amount: parseU128(content.amount),
    };
  }

  if (programId === BETA_STAKING_PROGRAM_ID && content.amount) {
    return {
      amount: parseU64(content.amount),
    };
  }

  if (programId === ARCANE_PROGRAM_ID && content.token_id && content.amount) {
    return {
      token: stripVisibilitySuffix(content.token_id),
      amount: parseU128(content.amount),
    };
  }

  if (content.token_id && content.amount) {
    return {
      token: stripVisibilitySuffix(content.token_id),
      amount: parseAleoInteger(content.amount),
    };
  }

  if (content.amount) {
    return {
      amount: parseAleoInteger(content.amount),
    };
  }

  return undefined;
}

export function stripVisibilitySuffix(value: string): string {
  return value.split(".")[0];
}

function parseAleoInteger(value: string): bigint {
  const base = stripVisibilitySuffix(value);
  if (base.endsWith("u128")) {
    return parseU128(value);
  }
  if (base.endsWith("u64")) {
    return parseU64(value);
  }
  return 0n;
}

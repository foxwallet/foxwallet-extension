import {
  ALPHA_TOKEN_PROGRAM_ID,
  ARCANE_PROGRAM_ID,
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import type { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import type { OwnedRecord } from "./ScannerTypes";

type AleoRecordContent = Record<string, string>;

export function parseRecordCiphertext(input: string): AleoRecordContent {
  const body = input.trim().replace(/^\{|\}$/g, "");
  const entries: string[] = [];

  let depth = 0;
  let buf = "";
  for (const ch of body) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if ((ch === "," || ch === "\n") && depth === 0) {
      const line = buf.trim();
      if (line) entries.push(line);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) entries.push(buf.trim());

  const result: AleoRecordContent = {};
  for (const line of entries) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line
      .slice(colonIndex + 1)
      .trim()
      .replace(/,$/, "");
    if (key) result[key] = value;
  }
  return result;
}

export function ownedToRecordDetail(
  record: OwnedRecord,
): RecordDetailWithSpent {
  const content = parseRecordCiphertext(record.recordPlaintext);
  const nonce = stripVisibilitySuffix(content._nonce ?? "");

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
    timestamp: record.blockTimestamp ? Number(record.blockTimestamp) : 0,
    recordName: record.recordName,
    spent: record.spent ?? false,
    parsedContent: parseRecordParsedContent(record.programName, content),
    outputIndex: record.outputIndex,
  };
}

export function parseRecordContent(plaintext: string): AleoRecordContent {
  return parseRecordCiphertext(plaintext);
}

export function parseRecordParsedContent(
  programId: string,
  content: AleoRecordContent,
): Record<string, bigint | string> | undefined {
  if (programId === NATIVE_TOKEN_PROGRAM_ID && content.microcredits) {
    return {
      microcredits: parseAleoInteger(content.microcredits),
    };
  }

  if (programId === ALPHA_TOKEN_PROGRAM_ID && content.token && content.amount) {
    return {
      token: stripVisibilitySuffix(content.token),
      amount: parseAleoInteger(content.amount),
    };
  }

  if (programId === BETA_STAKING_PROGRAM_ID && content.amount) {
    return {
      amount: parseAleoInteger(content.amount),
    };
  }

  if (programId === ARCANE_PROGRAM_ID && content.token_id && content.amount) {
    return {
      token: stripVisibilitySuffix(content.token_id),
      amount: parseAleoInteger(content.amount),
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
  // Accept any Aleo integer literal (u8/u16/u32/u64/u128/i*), with optional
  // visibility suffix. e.g. "1234u64.private", "9u128", "42u32".
  const base = stripVisibilitySuffix(value);
  const match = /^(\d+)[iu](?:8|16|32|64|128)$/.exec(base);
  if (!match) return 0n;
  try {
    return BigInt(match[1]);
  } catch {
    return 0n;
  }
}

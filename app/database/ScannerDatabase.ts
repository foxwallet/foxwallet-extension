import Dexie from "dexie";
import {
  type ScannerDecryptedRecord,
  type ScannerDecryptedRecordMap,
} from "core/coins/ALEO/types/ScannerDecryptedRecord";

// On-disk row shape. The composite primary key `[chainId+address+tag]`
// requires those fields on the value object; `plaintext` is the only payload
// callers actually consume after read. See ScannerDecryptedRecord docstring
// for why we deliberately do not persist `spent` / `parsedContent` /
// `RecordDetailWithSpent` here.
interface ScannerDecryptedRecordRow {
  chainId: string;
  address: string;
  tag: string;
  plaintext: string;
}

const uniqueTags = (tags: string[]): string[] => {
  return [...new Set(tags.filter(Boolean))];
};

export class ScannerDatabase extends Dexie {
  scanner_decrypted_records: Dexie.Table<
    ScannerDecryptedRecordRow,
    [string, string, string]
  >;

  constructor() {
    super("scanner");

    this.version(1).stores({
      scanner_decrypted_records:
        "[chainId+address+tag], [chainId+address], chainId",
    });

    this.scanner_decrypted_records = this.table("scanner_decrypted_records");
  }

  async getDecryptedRecords(
    chainId: string,
    address: string,
    tags: string[],
  ): Promise<ScannerDecryptedRecordMap> {
    const keys = uniqueTags(tags).map((tag): [string, string, string] => [
      chainId,
      address,
      tag,
    ]);
    if (keys.length === 0) {
      return {};
    }

    const rows = await this.scanner_decrypted_records.bulkGet(keys);
    return rows.reduce<ScannerDecryptedRecordMap>((acc, row) => {
      if (row?.tag) {
        acc[row.tag] = { tag: row.tag, plaintext: row.plaintext };
      }
      return acc;
    }, {});
  }

  async putDecryptedRecords(
    chainId: string,
    address: string,
    records: ScannerDecryptedRecord[],
  ): Promise<void> {
    const rows: ScannerDecryptedRecordRow[] = records
      .filter((record) => Boolean(record.tag))
      .map((record) => ({
        chainId,
        address,
        tag: record.tag,
        plaintext: record.plaintext,
      }));
    if (rows.length === 0) {
      return;
    }
    await this.scanner_decrypted_records.bulkPut(rows);
  }

  async deleteAddressData(chainId: string, address: string): Promise<void> {
    await this.scanner_decrypted_records
      .where("[chainId+address]")
      .equals([chainId, address])
      .delete();
  }

  async deleteChainData(chainId: string): Promise<void> {
    await this.scanner_decrypted_records.where({ chainId }).delete();
  }
}

export const scannerDB = new ScannerDatabase();

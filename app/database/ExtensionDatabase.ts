import Dexie from "dexie";
import { type ExtensionVersion } from "./types/version";

export class ExtensionInfoDatabase extends Dexie {
  info: Dexie.Table<ExtensionVersion, string>;

  constructor() {
    super("extension");

    this.version(1).stores({
      info: "version",
    });

    this.info = this.table("info");
  }

  async getVersion(): Promise<string> {
    const info = await this.info.limit(1).toArray();
    return info[0]?.version ?? "";
  }

  async setVersion(version: string): Promise<string> {
    await this.info.clear();
    await this.info.add({ version });
    return version;
  }
}

export const extensionInfoDB = new ExtensionInfoDatabase();

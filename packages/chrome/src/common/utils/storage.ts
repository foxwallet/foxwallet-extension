import { Storage } from "redux-persist";
import browser from "webextension-polyfill";

export class WebStorage implements Storage {
  async getItem(key: string) {
    const results = await browser.storage.local.get(key);
    return results[key] ?? null;
  }

  async removeItem(key: string): Promise<void> {
    return await browser.storage.local.remove(key);
  }

  async setItem(key: string, item: string | null): Promise<void> {
    return await browser.storage.local.set({ [key]: item });
  }

  async clear() {
    return await browser.storage.local.clear();
  }
}

export const storageInstance = new WebStorage();

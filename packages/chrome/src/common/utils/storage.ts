import { Storage } from "redux-persist";

export class ChromeStorage implements Storage {
  async getItem(key: string) {
    const results = await chrome.storage.local.get(key);
    return results[key] ?? null;
  }

  async removeItem(key: string): Promise<void> {
    return await chrome.storage.local.remove(key);
  }

  async setItem(key: string, item: string | null): Promise<void> {
    return await chrome.storage.local.set({ [key]: item });
  }

  async clear() {
    return await chrome.storage.local.clear();
  }
}

export const storageInstance = new ChromeStorage();

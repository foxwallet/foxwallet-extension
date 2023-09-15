import {
  generateToken,
  getToken,
  validateToken,
} from "../../../../common/utils/auth";
import { logger } from "../../../../common/utils/logger";
import { vaultStorage, type VaultStorage } from "../../storage/VaultStorage";

export class AuthManager {
  #storage: VaultStorage;
  #token?: string;
  #loginTimestamp?: number;

  constructor() {
    this.#storage = vaultStorage;
  }

  async hasSetPassword() {
    return !!(await this.#storage.getCipher());
  }

  async initPassword(password: string) {
    const { token, cipher } = await generateToken(password);
    this.#token = token;
    this.#loginTimestamp = Date.now();
    this.#storage.initCipher(cipher);
  }

  async updatePassword(password: string) {}

  async login(password: string) {
    const cipher = await this.#storage.getCipher();
    if (!cipher) {
      logger.error("cipher not found");
      return false;
    }
    const salt = Buffer.from(cipher.salt, "hex");
    const token = await getToken(password, salt);
    const valid = await validateToken(token, cipher);
    if (valid) {
      this.#token = token.toString("hex");
      this.#loginTimestamp = Date.now();
    }
    return valid;
  }

  getToken() {
    return this.#token;
  }

  getLoginTime() {
    return this.#loginTimestamp;
  }

  async logout() {
    this.#token = undefined;
    this.#loginTimestamp = undefined;
  }
}

export const authManager = new AuthManager();

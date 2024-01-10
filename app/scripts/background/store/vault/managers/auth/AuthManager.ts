import {
  generateToken,
  getToken,
  validateToken,
} from "../../../../../../common/utils/auth";
import { logger } from "../../../../../../common/utils/logger";
import { vaultStorage, type VaultStorage } from "../../VaultStorage";

const EXPIRE_TIME = 1000 * 60 * 60 * 4;
const LOCK_TIME = 1000 * 60 * 60 * 3;
export class AuthManager {
  #storage: VaultStorage;
  #token?: string;
  #loginTimestamp?: number;
  #timerId?: number;

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
    await this.#storage.initCipher(cipher);
  }

  async updatePassword(password: string) {}

  hasAuth() {
    if (!this.#token || !this.#loginTimestamp) {
      return false;
    }
    if (this.#timerId !== undefined) {
      console.log("===> hasAuth clearTimeout: ", this.#timerId, Date.now());
      this.#timerId = undefined;
      clearTimeout(this.#timerId);
    }
    console.log("===> AuthManager hasAuth: ", this.#loginTimestamp);
    return true;
  }

  lock = () => {
    console.log("===> AuthManager lock ", Date.now());
    this.#token = undefined;
    this.#loginTimestamp = undefined;
    this.#timerId = undefined;
  };

  timeoutLock = () => {
    if (this.#timerId !== undefined) {
      console.log("===> AuthManager timeoutLock clearTimeout: ", this.#timerId);
      clearTimeout(this.#timerId);
      this.#timerId = undefined;
    }
    this.#loginTimestamp = Date.now();
    // @ts-expect-error setTimeout
    this.#timerId = setTimeout(this.lock, LOCK_TIME);
    console.log("===> AuthManager timeoutLock: ", this.#loginTimestamp);
  };

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

  async checkPassword(password: string): Promise<boolean> {
    const cipher = await this.#storage.getCipher();
    if (!cipher) {
      logger.error("cipher not found");
      return false;
    }
    const salt = Buffer.from(cipher.salt, "hex");
    const token = await getToken(password, salt);
    return await validateToken(token, cipher);
  }
}

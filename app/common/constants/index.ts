export const routes = {
  TOKEN: "/api/v1/coin",
  TOKENS_PRICE: "/api/v1/coin/price",
  TOKENS_PRICE_V2: "/api/v2/coin/price",
  EXCHANGE_RATE: "/api/v1/currency",
  FIAT_RATE: "/api/v1/deposit/fiat",
  FIAT_TOKENS: "/api/v1/deposit/token",
  FIAT_TOKENS2: "/api/v2/deposit/token",
  FIAT_PRICE: "/api/v1/deposit/price",
};

export const KEEP_ALIVE_INTERVAL = 30000;

export const PASSWORD_MINIMUL_LENGTH = 6;

export const PBKDF2_NUM_OF_ITERATIONS = 10000;

export const PBKDF2_KEY_LENGTH = 256;

export const WALLET_MASTER_SECRET = "fox_wallet_extension";

/**
 * @deprecated
 */
export const ALEO_SYNC_RECORD_SIZE = 5000;

export const ALEO_SYNC_HEIGHT_SIZE = 5000;

export const ALEO_WORKER_TASK_SIZE = 5000;

export const ALEO_BLOCK_RANGE = 50;

export const FOX_DAPP_REQUEST = "fox_dapp_request";

export const FOX_DAPP_RESP = "fox_dapp_response";

export const FOX_DAPP_EMIT = "fox_dapp_emit";

export const DAPP_CONNECTION_EXPIRE_TIME = 1000 * 60 * 60 * 12;

export const HELP_CENTER_URL = "https://hc.foxwallet.com";
export const PRIVACY_POLICY_URL = "https://hc.foxwallet.com/privacy-policy";
export const TERMS_OF_SERVICE_URL = "https://hc.foxwallet.com/terms-of-service";
export const EXTENSION_PAGE_URL = "chrome://extensions/?id=";
export const EXTENSION_STORE_URL =
  "https://chromewebstore.google.com/detail/foxwallet/";

export const CHROME_MIN_VERSION = "120";

export const SEARCH_ITEM_NUM = 10;

export const POLL_ALL_TOKEN_PRICE_INTERVAL = 5 * 60 * 1000;
export const HTTP_REQUEST_TIMEOUT = 5000;

export const NON_TOKEN_POLL_ALL_TOKEN_INTERVAL = 60 * 1000;

// todo: POLL_ALL_TOKEN_INTERVAL prod is 3600000
export const POLL_ALL_TOKEN_INTERVAL = 300000;

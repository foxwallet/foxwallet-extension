import axios, {
  type Axios,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosAdapter,
} from "axios";
// @ts-expect-error not documented
import buildFullPath from "axios/lib/core/buildFullPath";
// @ts-expect-error not documented
import settle from "axios/lib/core/settle";
import { AxiosError as AxiosErrorClass } from "axios";

export async function get(url: URL | string) {
  try {
    const response = await fetch(url);
    return response;
  } catch (err) {
    throw new Error("network error: " + (err as Error).message);
  }
}

export async function post(url: URL | string, options: RequestInit) {
  try {
    options.method = "POST";
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    throw new Error("network error: " + (err as Error).message);
  }
}

// Custom fetch adapter for axios to work in service worker environment
const fetchAdapter: AxiosAdapter = async (config) => {
  const url = buildFullPath(config.baseURL, config.url);
  const headers = new Headers(config.headers as any);

  const fetchOptions: RequestInit = {
    method: config.method?.toUpperCase(),
    headers,
    body: config.data,
  };

  // Handle timeout
  const controller = new AbortController();
  const timeoutId = config.timeout
    ? setTimeout(() => controller.abort(), config.timeout)
    : undefined;
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(url, fetchOptions);

    if (timeoutId) clearTimeout(timeoutId);

    const responseData = await response.text();
    let data = responseData;
    try {
      data = JSON.parse(responseData);
    } catch {
      // Keep as text if not JSON
    }

    const axiosResponse: AxiosResponse = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config,
      request: {},
    };

    return new Promise((resolve, reject) => {
      settle(resolve, reject, axiosResponse);
    });
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new AxiosErrorClass(
        "timeout of " + config.timeout + "ms exceeded",
        "ECONNABORTED",
        config,
      );
    }
    throw new AxiosErrorClass(error.message, "ERR_NETWORK", config);
  }
};

export const createRequestInstance = (
  baseURL: string,
  timeout = 5000,
  headers = {},
) => {
  // Only use fetchAdapter in service worker environment
  const isServiceWorker =
    typeof self !== "undefined" && "ServiceWorkerGlobalScope" in self;

  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      ...headers,
    },
    ...(isServiceWorker ? { adapter: fetchAdapter } : {}),
  });
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      return config;
    },
    async (err) => {
      console.error("interceptors.request", err);
      return Promise.reject(err);
    },
  );
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    async (err: AxiosError) => {
      console.warn(
        err.message,
        buildFullPath(err.config?.baseURL, err.config?.url ?? ""),
        err.config?.params,
        err.config?.data,
        err.response?.data,
      );
      return Promise.reject(err);
    },
  );
  return instance;
};

export const createWalletReqInstance = (
  baseURL = import.meta.env.VITE_WALLET_API,
  timeout = 15000,
  headers = {},
) => {
  return createRequestInstance(baseURL, timeout, {
    // [AppConstants.REQUEST_HEADER_ACTIVE_TOKEN]: currentActiveToken,
    // "User-Agent": AppConstants.USER_AGENT_FOX,
    ...headers,
  });
};

const walletApiRequest = createWalletReqInstance();

type PickedAxios = Pick<Axios, "get" | "post" | "delete" | "put">;
// use walletApiRequest to handle all requests when other businesses call the specific method
const wrappedRequestIns: PickedAxios = {
  get: async (url: string, config?: AxiosRequestConfig) =>
    walletApiRequest.get(url, config),
  post: async (url: string, data?: any, config?: AxiosRequestConfig) =>
    walletApiRequest.post(url, data, config),
  delete: async (url: string, config?: AxiosRequestConfig) =>
    walletApiRequest.delete(url, config),
  put: async (url: string, data?: any, config?: AxiosRequestConfig) =>
    walletApiRequest.put(url, data, config),
};

export { wrappedRequestIns as walletApiRequest };

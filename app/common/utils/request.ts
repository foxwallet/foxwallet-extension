import axios, {
  type Axios,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import buildFullPath from "axios/lib/core/buildFullPath";

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

export const createRequestInstance = (
  baseURL: string,
  timeout = 5000,
  headers = {},
) => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      ...headers,
    },
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

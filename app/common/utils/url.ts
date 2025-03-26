import validUrl from "valid-url";

export const DSN_CONFIG = [
  {
    start: "ipfs://",
    gateway: "https://ipfs.foxnb.net/ipfs/",
  },
  {
    start: "ipns://",
    gateway: "https://ipfs.io/ipns/",
  },
  {
    start: "ar://",
    gateway: "https://arweave.net/",
  },
  {
    start: "https://ipfs.io/ipfs/",
    gateway: "https://ipfs.foxnb.net/ipfs/",
  },
];

// Examples:
// ipfs://bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m
// ipns://olivida.eth/

export function convertDSNUrl(rawUrl: string): string {
  if (!rawUrl) {
    return "";
  }
  const matched = DSN_CONFIG.find((item) => {
    return rawUrl.startsWith(item.start);
  });
  if (matched) {
    return rawUrl.replace(matched.start, matched.gateway);
  }
  return rawUrl;
}

export function getUrlTLD(domain: string): string | undefined {
  const valid = domain.includes(".");
  if (!valid) {
    return undefined;
  }
  const strings = domain.split(".");
  if (strings.length <= 1) {
    return undefined;
  }
  const tld = strings[strings.length - 1];
  if (!tld) {
    return undefined;
  }
  return tld;
}

export function parseSchemeURL(url: string): any {
  const r = /^(bitcoin:)([a-zA-Z0-9]{27,34})(?:\?(.*))?$/;
  const match = r.exec(url);
  if (!match) return null;

  const parsed: {
    url: string;
    [key: string]: string;
  } = { url };

  if (match[2]) {
    const queries = match[3].split("&");
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i].split("=");
      if (query.length === 2) {
        parsed[query[0]] = decodeURIComponent(query[1].replace(/\+/g, "%20"));
      }
    }
  }
  parsed.prefix = match[1];
  parsed.target_address = match[2];
  return parsed;
}

export const simpleConcatUrl = (url: string, path: string): string => {
  const formatUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  const formatPath = path.startsWith("/") ? path.slice(1) : path;
  return `${formatUrl}/${formatPath}`;
};

export function sanitizeURL(
  input: string,
  defaultProtocol: string = "https://",
): string {
  let url = convertDSNUrl(input.trim());
  // Check if it's an url or a keyword
  const regEx = new RegExp(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!&',;=.+]+$/g,
  );
  if (!validUrl.isWebUri(url) && !regEx.test(url)) {
    // Add exception for localhost
    if (!url.startsWith("http://localhost") && !url.startsWith("localhost")) {
      return "https://www.google.com/search?q=" + escape(input);
    }
  }
  const hasProtocol = /^[a-z]*:\/\//.test(url);
  // change http to https
  if (hasProtocol && url.startsWith("http://")) {
    // Add exception for ip url
    const pattern = new RegExp(
      /^http:\/\/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/,
    );
    if (!pattern.test(url)) {
      url = url.replace("http://", "https://");
    }
  }
  return hasProtocol ? url : `${defaultProtocol}${url}`;
}

export function isValidHttpUrl(path: string) {
  let url;
  try {
    url = new URL(path);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function safeURL(url?: string) {
  if (!url) {
    return;
  }
  const hasProtocol = /^[a-zA-Z]+:\/\//.test(url);
  try {
    return new URL(hasProtocol ? url : `https://${url}`);
  } catch (e) {}
}

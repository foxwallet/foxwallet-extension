export enum Env {
  background = "background",
  offscreen = "offscreen",
  worker = "worker",
  popup = "popup",
  sidepanel = "sidepanel",
  notification = "notification",
  content = "content",
  standaloneTab = "standaloneTab",
  document = "document",
  unknown = "unknown",
}

const dictionary: Record<Env, { color: string; background: string }> = {
  background: {
    color: "#00FF00",
    background: "transparent",
  },
  offscreen: {
    color: "#0000FF",
    background: "transparent",
  },
  worker: {
    color: "#FF0000",
    background: "transparent",
  },
  popup: {
    color: "#FFFF00",
    background: "transparent",
  },
  sidepanel: {
    color: "#FF00FF",
    background: "transparent",
  },
  content: {
    color: "#00FFFF",
    background: "transparent",
  },
  notification: {
    color: "#A5A500",
    background: "transparent",
  },
  standaloneTab: {
    color: "#FFA500",
    background: "transparent",
  },
  document: {
    color: "#800080",
    background: "transparent",
  },
  unknown: {
    color: "#000000",
    background: "transparent",
  },
};

// TODO check other envs

export function getEnv() {
  let env: Env | undefined;
  let pathname = "";
  const isWorker =
    // @ts-expect-error importScripts
    typeof importScripts === "function" && typeof self !== "undefined";

  try {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Likely a document-based context (content script, popup, options)
      const url = window.location.href;
      pathname = window.location.pathname;

      if (url.startsWith("http") || url.startsWith("https")) {
        env = Env.content;
      } else if (url.startsWith("chrome-extension://")) {
        if (pathname.includes("popup")) {
          env = Env.popup;
        } else if (pathname.includes("sidepanel")) {
          env = Env.sidepanel;
        } else if (pathname.includes("notification")) {
          env = Env.notification;
        } else if (pathname.includes("offscreen")) {
          env = Env.offscreen;
        } else {
          env = Env.standaloneTab;
        }
      } else {
        env = Env.document;
      }
    } else if (isWorker) {
      // Likely service worker or shared worker
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unknown env
      pathname = self.location?.pathname || "";
      if (pathname.includes("background")) {
        env = Env.background;
      } else if (pathname.includes("worker")) {
        env = Env.worker;
      } else if (pathname.includes("offscreen")) {
        env = Env.offscreen;
      }
    } else {
      env = Env.unknown;
    }
  } catch (err) {
    env = Env.unknown;
    console.debug(err);
  }
  return env ?? Env.unknown;
}

export const wrapLoggerArgs = (...args: unknown[]): unknown[] => {
  const env = getEnv();
  const colorConfig = dictionary[env];
  if (
    args.length > 1 &&
    typeof args[0] === "string" &&
    args[0].startsWith("%")
  ) {
    return args;
  }
  return [
    `%c[${env}]`,
    `color: ${colorConfig.color}; font-weight: bold; background-color: ${colorConfig.background};`,
    ...args,
  ];
};

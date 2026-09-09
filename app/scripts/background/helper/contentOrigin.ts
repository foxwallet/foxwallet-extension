import type { Runtime } from "webextension-polyfill";
import type { SiteMetadata } from "../servers/IWalletServer";

export function bindSiteMetadataToSender(
  metadata: SiteMetadata,
  sender: (Runtime.MessageSender & { origin?: string }) | undefined,
  extensionId: string,
): SiteMetadata {
  if (sender?.id !== extensionId || sender.tab?.id == null) {
    throw new Error("Invalid content script sender");
  }
  // sender.url is the sending frame's URL. tab.url would authenticate an
  // iframe as its top-level page. An opaque sender.origin must not fall back.
  const source = sender.origin ?? sender.url;
  if (!source || source === "null") {
    throw new Error("Unknown dApp origin");
  }
  const url = new URL(source);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Unsupported dApp origin");
  }
  return {
    siteInfo: {
      origin: url.origin,
      name:
        typeof metadata?.siteInfo?.name === "string"
          ? metadata.siteInfo.name
          : url.host,
      icon:
        typeof metadata?.siteInfo?.icon === "string"
          ? metadata.siteInfo.icon
          : null,
    },
    address: typeof metadata?.address === "string" ? metadata.address : null,
    network: typeof metadata?.network === "string" ? metadata.network : null,
  };
}

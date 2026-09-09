import { CoinType } from "core/types";
import { CONTENT_METHODS } from "@/messaging/contentMethods";
import { getWebsiteMessenger } from "@/messaging/injectorToContent";
import type { ContentClient } from "./ContentClient";
import type { EmitData } from "./type";
import { getSiteInfo } from "./host";

export class ContentBridge {
  constructor(client: ContentClient) {
    for (const coinType of Object.values(CoinType)) {
      const messenger = getWebsiteMessenger(coinType);
      for (const method of CONTENT_METHODS[coinType]) {
        messenger.onMessage(method, async ({ data }) => {
          if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new Error("Invalid dApp request");
          }
          const { payload, metadata } = data;
          // The page owns the request. Identity comes only from the isolated
          // content script; only provider state is copied from metadata.
          const siteMetadata = {
            siteInfo: getSiteInfo(),
            network:
              typeof metadata?.network === "string" ? metadata.network : null,
            address:
              typeof metadata?.address === "string" ? metadata.address : null,
          };
          return await client.send(method, payload, coinType, siteMetadata);
        });
      }
    }
  }

  emit(data: EmitData) {
    if (!Object.prototype.hasOwnProperty.call(CONTENT_METHODS, data.coinType)) {
      return;
    }
    void getWebsiteMessenger(data.coinType)
      .sendMessage("emit", data)
      .catch((error) => console.warn("Failed to notify dApp", error));
  }
}

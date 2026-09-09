import { defineCustomEventMessaging } from "@webext-core/messaging/page";
import type { CoinType } from "core/types";
import type { ServerPayload } from "@/common/types/message";
import type { ContentServerMethod } from "@/scripts/background/servers/IWalletServer";
import type { EmitData, ProviderMetadata } from "@/scripts/content/type";

export interface PageRequest {
  payload: any;
  metadata?: ProviderMetadata;
}

type WebsiteProtocol = {
  [M in ContentServerMethod<CoinType>]: (data: PageRequest) => ServerPayload;
} & {
  emit: (data: EmitData) => void;
};

function createWebsiteMessenger(coinType: CoinType) {
  return defineCustomEventMessaging<WebsiteProtocol>({
    // Public routing namespace, never an authentication credential.
    namespace: `foxwallet:injector-to-content:v1:${coinType}`,
  });
}

const messengers = new Map<
  CoinType,
  ReturnType<typeof createWebsiteMessenger>
>();

// Each JS world has its own instances; each chain has one emit listener.
export function getWebsiteMessenger(coinType: CoinType) {
  let messenger = messengers.get(coinType);
  if (!messenger) {
    messenger = createWebsiteMessenger(coinType);
    messengers.set(coinType, messenger);
  }
  return messenger;
}

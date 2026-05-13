import { AleoProvider } from "./AleoProvider";
import { FoxWeb3Provider } from "@/scripts/content/EthProvider";
import Constants from "@/scripts/content/Constants";
import { QtumProvider } from "@/scripts/content/QtumProvider";

const aleoProvider = new AleoProvider();
const ethereumProvider = new FoxWeb3Provider();
const qtumProvider = new QtumProvider();

type InjectedWindow = Window & {
  aleo?: AleoProvider;
  ethereum?: FoxWeb3Provider;
  qtum?: QtumProvider;
  foxwallet?: {
    aleo: AleoProvider;
    ethereum: FoxWeb3Provider;
    qtum: QtumProvider;
  };
};

const injectedWindow = window as InjectedWindow;

const getPropertyDescriptor = (
  object: object,
  property: PropertyKey,
): PropertyDescriptor | undefined => {
  let target: object | null = object;
  while (target) {
    const descriptor = Object.getOwnPropertyDescriptor(target, property);
    if (descriptor) {
      return descriptor;
    }
    target = Object.getPrototypeOf(target);
  }
  return undefined;
};

const setLegacyProvider = <K extends "ethereum" | "qtum">(
  property: K,
  provider: NonNullable<InjectedWindow[K]>,
) => {
  try {
    const descriptor = getPropertyDescriptor(injectedWindow, property);
    if (descriptor && "value" in descriptor && descriptor.value) {
      return;
    }
    if (descriptor?.get && descriptor.get.call(injectedWindow)) {
      return;
    }
    if (descriptor && !descriptor.writable && !descriptor.set) {
      return;
    }
    if (!descriptor || descriptor.writable) {
      injectedWindow[property] = provider;
      return;
    }
    descriptor.set?.call(injectedWindow, provider);
  } catch {
  }
};

injectedWindow.foxwallet = {
  aleo: aleoProvider,
  ethereum: ethereumProvider,
  qtum: qtumProvider,
};

try {
  injectedWindow.aleo = aleoProvider;
} catch (e){}

setLegacyProvider("ethereum", ethereumProvider);

setLegacyProvider("qtum", qtumProvider);

try {
  Object.freeze(injectedWindow.foxwallet);
  Object.seal(injectedWindow.aleo);
} catch (e){}

const info = {
  uuid: Constants.EIP6963_UUID,
  name: "FoxWallet",
  icon: Constants.SVG_ICON,
  rdns: "com.foxwallet",
};
const detail = Object.freeze({ info, provider: ethereumProvider });

function announceProvider() {
  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: detail,
    }),
  );
}
window.addEventListener("eip6963:requestProvider", (event) => {
  announceProvider();
});
announceProvider();

// eslint-disable-next-line no-void
void 0;

import { AleoProvider } from "./AleoProvider";
import { FoxWeb3Provider } from "@/scripts/content/EthProvider";
import Constants from "@/scripts/content/Constants";

const aleoProvider = new AleoProvider();
const ethereumProvider = new FoxWeb3Provider();

// @ts-expect-error window
window.foxwallet = {
  aleo: aleoProvider,
  ethereum: ethereumProvider,
};

// @ts-expect-error window
window.aleo = aleoProvider;

// @ts-expect-error window
window.ethereum = ethereumProvider;

// @ts-expect-error window
Object.freeze(window.foxwallet);

// @ts-expect-error window
Object.seal(window.aleo);

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

import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";
import { injectProviders } from "../app/scripts/content/injector";

export default defineUnlistedScript(injectProviders);

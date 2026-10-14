import { defineBackground } from "wxt/utils/define-background";
import { startBackground } from "../app/scripts/background";

export default defineBackground({ type: "module", main: startBackground });

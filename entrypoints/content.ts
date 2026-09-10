import { defineContentScript } from "wxt/utils/define-content-script";
import { startContent } from "../app/scripts/content";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  runAt: "document_start",
  main: startContent,
});

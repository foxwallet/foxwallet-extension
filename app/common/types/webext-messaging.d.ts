// This project uses TypeScript's legacy Node resolution, which does not read
// the package's exports map for the /page subpath. Keep its real library types.
declare module "@webext-core/messaging/page" {
  export * from "@webext-core/messaging/dist/page.mjs";
}

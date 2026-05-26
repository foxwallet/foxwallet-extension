declare module "@provablehq/sdk/mainnet.js" {
  export const ViewKey: {
    from_string(viewKey: string): unknown;
  };

  export function encryptRegistrationRequest(
    publicKey: string,
    viewKey: unknown,
    start: number,
  ): string;
}

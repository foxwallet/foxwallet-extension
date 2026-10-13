declare module "axios/lib/core/buildFullPath" {
  export default function buildFullPath(
    baseURL?: string,
    requestedURL: string,
  ): string;
}

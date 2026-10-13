declare module "crypto-browserify" {
  export { createHmac } from "crypto";
  import crypto from "crypto";
  export default crypto;
}

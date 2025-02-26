"use strict";

export class Utils {
  static resemblesAddress(address:any) {
    if (typeof address !== "string") {
      return false;
    }
    return address.length === 2 + 20 * 2;
  }
}

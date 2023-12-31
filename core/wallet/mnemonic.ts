import {
  entropyToMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
  wordlists,
} from "bip39";
import { getRandomBytes } from "../utils/random";
import { logger } from "@/common/utils/logger";

const MnemonicLengthSeedBytesPair = {
  12: 16, // 128 bits
  24: 32, // 256 bits
};

export class Mnemonic {
  public static async generate(words: 12 | 24 = 12): Promise<string> {
    const randomBytesNr = MnemonicLengthSeedBytesPair[words];

    try {
      const bytes = getRandomBytes(randomBytesNr);
      return entropyToMnemonic(bytes, wordlists.EN);
    } catch (e) {
      logger.log("===> Mnemonic.generate error:", e);
      // @ts-expect-error Mnemonic throw error
      throw new Error(e);
    }
  }

  public static async generateUnique(words: 12 | 24 = 12): Promise<string> {
    let mnemonic = "";
    while (!mnemonic) {
      const newMnemonic = await this.generate(words);
      const newMnemonicArr = newMnemonic.split(" ");
      const map: { [key in string]: number } = {};
      let dupFlag = false;
      for (const word of newMnemonicArr) {
        if (map[word] && map[word] > 0) {
          logger.warn("mnemonic have dup words");
          dupFlag = true;
          break;
        }
        map[word] = 1;
      }
      if (!dupFlag) {
        mnemonic = newMnemonic;
        break;
      }
    }
    return mnemonic;
  }

  public static verify(mnemonic: string): boolean {
    return validateMnemonic(mnemonic, wordlists.EN);
  }

  public static toSeed(mnemonic: string): Buffer {
    return mnemonicToSeedSync(mnemonic);
  }
}

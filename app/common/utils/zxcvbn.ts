import { zxcvbnOptions, zxcvbn } from "@zxcvbn-ts/core";
import { logger } from "./logger";

const loadOptions = async () => {
  logger.log("zxcvbn loadOptions");
  const zxcvbnCommonPackage = await import("@zxcvbn-ts/language-common");
  const zxcvbnEnPackage = await import("@zxcvbn-ts/language-en");

  return {
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    translations: zxcvbnEnPackage.translations,
  };
};

let loaded = false;

export const getPasswordStrength = async (password: string) => {
  if (!loaded) {
    const options = await loadOptions();
    zxcvbnOptions.setOptions(options);
    loaded = true;
  }
  const result = zxcvbn(password);
  return result.score;
};

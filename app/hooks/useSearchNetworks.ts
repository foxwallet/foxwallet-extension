import { useMemo } from "react";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import type { ChainBaseConfig } from "core/types/ChainBaseConfig";

const CustomSearchKeyRemark = "remark";

export const useSearchNetworks = <T extends ChainBaseConfig>(
  searchText: string,
  targetChainList: T[],
) => {
  const language = getCurrLanguage();

  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: "chainName", weight: 1 },
        { name: CustomSearchKeyRemark, weight: 0.5 },
      ],
      threshold: 0.34,
    }),
    [],
  );

  const chainConfigWithRemark = useMemo(() => {
    return targetChainList.map((config) => ({
      ...config,
      [CustomSearchKeyRemark]:
        config.chainRemark?.[language] ??
        config.chainRemark?.[SupportLanguages.EN],
    }));
  }, [targetChainList, language]);

  const { searchRes, searching, delaySearchStr } = useFuseSearch<T>(
    searchText,
    chainConfigWithRemark,
    fuseOptions,
  );

  return {
    searchRes,
    searching,
    delaySearchStr,
  };
};

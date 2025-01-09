import { useMemo } from "react";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import {
  type ChainDisplayData,
  type SingleChainDisplayData,
} from "@/components/Wallet/ChangeNetworkDrawer";
import { ChainAssembleMode } from "core/types/ChainUniqueId";

const CustomSearchKeyRemark = "remark";

export const useSearchNetworks = (
  searchText: string,
  targetChainList: ChainDisplayData[],
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
    const temp = targetChainList.filter(
      (i) => i.mode !== ChainAssembleMode.ALL,
    );
    return (temp as SingleChainDisplayData[]).map((config) => ({
      ...config,
      [CustomSearchKeyRemark]:
        config.chainRemark?.[language] ??
        config.chainRemark?.[SupportLanguages.EN],
    }));
  }, [targetChainList, language]);

  const { searchRes, searching, delaySearchStr } =
    useFuseSearch<ChainDisplayData>(
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

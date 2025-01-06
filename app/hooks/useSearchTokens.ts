import { useMemo } from "react";
import { useFuseSearch } from "@/hooks/useFuseSearch";

export const useSearchTokens = <T>(searchText: string, targetList: T[]) => {
  const fuseOptions = useMemo(() => {
    return {
      keys: [
        { name: "contractAddress", weight: 0.5 },
        { name: "symbol", weight: 0.5 },
      ],
      threshold: 0.1,
    };
  }, []);

  const { searchRes, searching, delaySearchStr } = useFuseSearch(
    searchText,
    targetList,
    fuseOptions,
  );

  return {
    searchRes,
    searching,
    delaySearchStr,
  };
};

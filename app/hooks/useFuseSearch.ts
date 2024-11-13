import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import Fuse from "fuse.js";
import { shallowEqual } from "react-redux";
import { useDataRef } from "./useDataRef";
import { SEARCH_ITEM_NUM } from "@/common/constants";

const EMPTY_LIST = Object.freeze([]);

export const useFuseSearch = <T>(
  searchStr: string,
  dataList: T[],
  options: Fuse.IFuseOptions<T>,
) => {
  const [searching, setSearching] = useState(false);
  const [delaySearchStr] = useDebounce(searchStr, 500);
  const [searchList, setSearchList] = useState<readonly T[]>([]);
  const searchListRef = useDataRef(searchList);
  const fuseInstance = useRef<Fuse<T>>();

  useEffect(() => {
    fuseInstance.current = new Fuse(dataList, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataList]);

  const afterSearchStrChange = useCallback(
    async (text: string) => {
      setSearching(true);
      const searchRes =
        fuseInstance.current
          ?.search(text, { limit: SEARCH_ITEM_NUM })
          .map((res) => res.item) ?? EMPTY_LIST;
      if (!shallowEqual(searchRes, searchListRef.current)) {
        setSearchList(searchRes);
      }
      setSearching(false);
    },
    [searchListRef],
  );

  useEffect(() => {
    if (delaySearchStr) {
      afterSearchStrChange(delaySearchStr);
    } else {
      setSearchList(EMPTY_LIST);
    }
  }, [delaySearchStr, afterSearchStrChange]);

  return { searchRes: searchList, searching, delaySearchStr };
};

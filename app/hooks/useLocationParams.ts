import { useMemo } from "react";

export const useLocationParams = (key: string) => {
  const searchObj = useMemo(() => {
    return new URLSearchParams(
      location.href.slice(location.href.indexOf("?") + 1),
    );
  }, []);

  return searchObj.get(key);
};

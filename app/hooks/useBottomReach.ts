import { MutableRefObject, useEffect, useState } from "react";

export const useBottomReach = (
  ref: MutableRefObject<HTMLDivElement | null>,
) => {
  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = () => {
    if (ref.current) {
      setIsBottom(
        ref.current.scrollHeight - ref.current.scrollTop <=
          ref.current.clientHeight + 40,
      );
    }
  };

  useEffect(() => {
    const element = ref.current;
    element?.addEventListener("scroll", handleScroll);

    return () => element?.removeEventListener("scroll", handleScroll);
  }, [ref.current]);

  return isBottom;
};

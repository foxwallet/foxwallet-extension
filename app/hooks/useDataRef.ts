import { useEffect, useRef } from "react";

export function useDataRef<T>(data: T) {
  const dataRef = useRef<T>(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  return dataRef;
}

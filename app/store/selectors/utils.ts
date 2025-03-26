export const EMPTY_ARRAY: [] = [];

export const fallbackToEmptyArray = <T>(array: T[] | undefined) => {
  return array && array.length > 0 ? array : EMPTY_ARRAY;
};

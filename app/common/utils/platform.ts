export const isBrowser = () => {
  return window !== undefined;
};

export const isBgService = () => {
  return !isBrowser() && chrome !== undefined;
};

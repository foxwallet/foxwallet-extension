export type CustomEntry = string | { [key: string]: CustomEntry };

export type CustomRecord = {
  [key: string]: CustomEntry;
};

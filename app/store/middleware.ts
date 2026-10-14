import { isPlain } from "@reduxjs/toolkit";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

export const serializableOptions = {
  isSerializable: (value: unknown) => typeof value === "bigint" || isPlain(value),
  ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
};

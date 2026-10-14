import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const user = createSlice({
  name: "user",
  initialState: {
    hasAuth: false,
  },
  reducers: {
    _reset() {
      return { hasAuth: false };
    },
    setHasAuth(state, action: PayloadAction<{ hasAuth: boolean }>) {
      const payload = action.payload;
      const { hasAuth } = payload;
      return {
        ...state,
        hasAuth,
      };
    },
  },
});

import { SupportCurrency } from "core/constants/currency";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SupportLanguages } from "@/locales/languages";

export enum ColorMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export enum WalletUIMode {
  SidePanel = "sidepanel",
  Popup = "popup",
}

type SettingModel = {
  currency: SupportCurrency;
  initCurrencyByLocation: boolean;
  currencyFiat: SupportCurrency;
  language: SupportLanguages;
  colorMode: ColorMode;
  uiMode: WalletUIMode;
};

export const setting = createSlice({
  name: "setting",
  initialState: {
    currency: SupportCurrency.USD,
    initCurrencyByLocation: false,
    currencyFiat: SupportCurrency.USD,
    language: SupportLanguages.EN,
    colorMode: ColorMode.Light,
    uiMode: WalletUIMode.SidePanel,
  } as SettingModel,
  reducers: {
    updateCurrency(
      state,
      action: PayloadAction<{ currency: SupportCurrency }>,
    ) {
      const payload = action.payload;
      const { currency } = payload;
      return {
        ...state,
        currency,
      };
    },
    updateCurrencyFiat(
      state,
      action: PayloadAction<{ currencyFiat: SupportCurrency }>,
    ) {
      const payload = action.payload;
      const { currencyFiat } = payload;
      return {
        ...state,
        currencyFiat,
      };
    },
    updateLanguage(
      state,
      action: PayloadAction<{ language: SupportLanguages }>,
    ) {
      const payload = action.payload;
      const { language } = payload;
      return {
        ...state,
        language,
      };
    },
    changeColorModel(state, action: PayloadAction<{ colorMode: ColorMode }>) {
      const payload = action.payload;
      return {
        ...state,
        colorMode: payload.colorMode,
      };
    },
    updateUIMode(state, action: PayloadAction<{ uiMode: WalletUIMode }>) {
      return {
        ...state,
        uiMode: action.payload.uiMode,
      };
    },
  },
});

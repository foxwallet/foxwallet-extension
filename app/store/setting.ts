import { SupportCurrency } from "core/constants/currency";
import { createModel } from "@rematch/core";
import { RootModel } from ".";
import { SupportLanguages, changeLanguage } from "@/locales/i18";

export enum ColorMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

type SettingModel = {
  currency: SupportCurrency;
  initCurrencyByLocation: boolean;
  currencyFiat: SupportCurrency;
  language: SupportLanguages;
  colorMode: ColorMode;
};

export const setting = createModel<RootModel>()({
  name: "setting",
  state: {
    currency: SupportCurrency.USD,
    initCurrencyByLocation: false,
    currencyFiat: SupportCurrency.USD,
    language: SupportLanguages.EN,
    colorMode: ColorMode.Light,
  } as SettingModel,
  reducers: {
    updateCurrency(state, payload: { currency: SupportCurrency }) {
      const { currency } = payload;
      return {
        ...state,
        currency,
      };
    },
    updateCurrencyFiat(state, payload: { currencyFiat: SupportCurrency }) {
      const { currencyFiat } = payload;
      return {
        ...state,
        currencyFiat,
      };
    },
    updateLanguage(state, payload: { language: SupportLanguages }) {
      const { language } = payload;
      return {
        ...state,
        language,
      };
    },
    changeColorModel(state, payload: { colorMode: ColorMode }) {
      return {
        ...state,
        colorMode: payload.colorMode,
      };
    },
  },
  effects: (dispatch) => ({
    async changeLanguage({ language }: { language: SupportLanguages }) {
      await changeLanguage(language);
      dispatch.setting.updateLanguage({ language });
    },
  }),
});

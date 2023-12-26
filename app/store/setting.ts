import { SupportCurrency } from "core/constants";
import { createModel } from "@rematch/core";
import { RootModel } from ".";
import { SupportLanguages, changeLanguage } from "@/locales/i18";

type SettingModel = {
  currency: SupportCurrency;
  initCurrencyByLocation: boolean;
  currencyFiat: SupportCurrency;
  language: SupportLanguages;
};

export const setting = createModel<RootModel>()({
  name: "setting",
  state: {
    currency: SupportCurrency.USD,
    initCurrencyByLocation: false,
    currencyFiat: SupportCurrency.USD,
    language: SupportLanguages.EN,
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
  },
  effects: (dispatch) => ({
    async changeLanguage({ language }: { language: SupportLanguages }) {
      await changeLanguage(language);
      dispatch.setting.updateLanguage({ language });
    },
  }),
});

import { SupportCurrency } from "core/constants";
import { createModel } from "@rematch/core";
import { RootModel } from ".";

type SettingModel = {
  currency: SupportCurrency;
  initCurrencyByLocation: boolean;
  currencyFiat: SupportCurrency;
};

export const setting = createModel<RootModel>()({
  name: "setting",
  state: {
    currency: SupportCurrency.USD,
    initCurrencyByLocation: false,
    currencyFiat: SupportCurrency.USD,
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
  },
});

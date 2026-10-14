import { SupportCurrency } from "core/constants/currency";
import { SupportLanguages, changeLanguage } from "@/locales/i18";
import { actions } from "../actions";
import type { AppThunk } from "../types";

export const settingThunks = {
  changeLanguage({
    language,
  }: {
    language: SupportLanguages;
  }): AppThunk<Promise<void>> {
    return async (dispatch, getState) => {
      await changeLanguage(language);
      await dispatch(actions.setting.updateLanguage({ language }));
    };
  },
};

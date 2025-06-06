import i18n, { type LanguageDetectorModule } from "i18next";
import { initReactI18next, type useTranslation } from "react-i18next";
import en from "./languages/en.json";
import zh from "./languages/zh.json";
import es from "./languages/es.json";
import id from "./languages/id.json";
import ru from "./languages/ru.json";
import uk from "./languages/uk.json";
import my from "./languages/my.json";
import tr from "./languages/tr.json";
import vi from "./languages/vi.json";
import bn from "./languages/bn.json";
import hi from "./languages/hi.json";
import ur from "./languages/ur.json";
import de from "./languages/de.json";
import ja from "./languages/ja.json";
import ko from "./languages/ko.json";
import { logger } from "@/common/utils/logger";

// import { isDev } from "../common/utils/env";

export enum SupportLanguages {
  EN = "en", // 英语
  ZH = "zh", // 中文
  ES = "es", // 西班牙语
  ID = "id", // 印尼语
  RU = "ru", // 俄语
  UK = "uk", // 乌克兰语
  MY = "my", // 缅甸语 Burmese
  TR = "tr", // 土耳其语 Turkish
  VI = "vi", // 越南语 Vietnamese
  BN = "bn", // 孟加拉语 Bengali
  HI = "hi", // 印地语 Hindi
  UR = "ur", // 巴基斯坦 乌尔都语 Urdu
  DE = "de", // 德语 Deutsch
  JA = "ja", // 日语 日本語
  KO = "ko", // 韩语 한국어
}

export const LanguageLabels: { [key in SupportLanguages]: string } = {
  [SupportLanguages.EN]: "English",
  [SupportLanguages.ZH]: "简体中文",
  [SupportLanguages.JA]: "日本語",
  [SupportLanguages.KO]: "한국어",
  [SupportLanguages.ES]: "Español",
  [SupportLanguages.DE]: "Deutsch",
  [SupportLanguages.ID]: "Bahasa Indonesia",
  [SupportLanguages.RU]: "Русский",
  [SupportLanguages.UK]: "Українська",
  [SupportLanguages.MY]: "ဗမာ",
  [SupportLanguages.TR]: "Türkçe",
  [SupportLanguages.VI]: "Tiếng Việt",
  [SupportLanguages.BN]: "বাংলা",
  [SupportLanguages.HI]: "हिंदी",
  [SupportLanguages.UR]: "اُردُو",
};

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en,
  zh,
  es,
  id,
  ru,
  uk,
  my,
  tr,
  vi,
  bn,
  hi,
  ur,
  de,
  ja,
  ko,
};

const languageDetector: LanguageDetectorModule = {
  type: "languageDetector",
  init() {},
  detect() {
    return navigator.language;
  },
  cacheUserLanguage() {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    returnNull: false,
    compatibilityJSON: "v3",
    resources,
    // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    // lng: "en",
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .catch((err) => {
    logger.error("===> i18n init error: ", err);
  });

export type WalletTFunction = ReturnType<typeof useTranslation>[0];

export async function changeLanguage(
  language: string,
): Promise<WalletTFunction> {
  return await i18n.changeLanguage(language);
}

export const getCurrLanguage = (): SupportLanguages => {
  return i18n.resolvedLanguage as SupportLanguages;
};

export default i18n;

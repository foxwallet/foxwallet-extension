import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export const DEFAULT_UNIQUE_ID_MAP: { [key in CoinType]: InnerChainUniqueId } =
  {
    [CoinType.ALEO]: InnerChainUniqueId.ALEO_MAINNET,
  };

export enum SupportCurrency {
  USD = "USD",
  INR = "INR",
  PHP = "PHP",
  IDR = "IDR",
  EUR = "EUR",
  JPY = "JPY",
  CAD = "CAD",
  AUD = "AUD",
  SGD = "SGD",
  HKD = "HKD",
  KRW = "KRW",
  VND = "VND",
  NGN = "NGN",
  IRR = "IRR",
  MMK = "MMK",
  RUB = "RUB",
  UAH = "UAH",
  GBP = "GBP",
  TRY = "TRY",
  BDT = "BDT",
  BRL = "BRL",
}

export const CURRENCY = {
  [SupportCurrency.USD]: {
    symbol: "USD",
    symbolAbbr: "$",
    localName: "United States Dollar",
  },
  [SupportCurrency.EUR]: {
    symbol: "EUR",
    symbolAbbr: "€",
    localName: "Euro",
  },
  [SupportCurrency.JPY]: {
    symbol: "JPY",
    symbolAbbr: "¥",
    localName: "円/エン,Yen",
  },
  [SupportCurrency.GBP]: {
    symbol: "GBP",
    symbolAbbr: "£",
    localName: "Pound Sterling",
  },
  [SupportCurrency.INR]: {
    symbol: "INR",
    symbolAbbr: "₹",
    localName: "रुपया,rupayā",
  },
  [SupportCurrency.AUD]: {
    symbol: "AUD",
    symbolAbbr: "A$",
    localName: "Australian Dollar",
  },
  [SupportCurrency.CAD]: {
    symbol: "CAD",
    symbolAbbr: "C$",
    localName: "Canadian Dollar",
  },
  [SupportCurrency.KRW]: {
    symbol: "KRW",
    symbolAbbr: "₩",
    localName: "원/圓,Won",
  },
  [SupportCurrency.SGD]: {
    symbol: "SGD",
    symbolAbbr: "S$",
    localName: "Singapore Dollar",
  },
  [SupportCurrency.HKD]: {
    symbol: "HKD",
    symbolAbbr: "HK$",
    localName: "港幣",
  },
  [SupportCurrency.RUB]: {
    symbol: "RUB",
    symbolAbbr: "₽",
    localName: "рубль,ruble",
  },
  [SupportCurrency.IDR]: {
    symbol: "IDR",
    symbolAbbr: "Rp",
    localName: "Rupiah",
  },
  [SupportCurrency.VND]: {
    symbol: "VND",
    symbolAbbr: "D.",
    localName: "Đồng",
  },
  [SupportCurrency.PHP]: {
    symbol: "PHP",
    symbolAbbr: "₱",
    localName: "Piso",
  },
  [SupportCurrency.TRY]: {
    symbol: "TRY",
    symbolAbbr: "₺",
    localName: "Türk Lirası",
  },
  [SupportCurrency.UAH]: {
    symbol: "UAH",
    symbolAbbr: "₴",
    localName: "гривня,hryvnia",
  },
  [SupportCurrency.MMK]: {
    symbol: "MMK",
    symbolAbbr: "K",
    localName: "ကျပ်,kyat",
  },
  [SupportCurrency.NGN]: {
    symbol: "NGN",
    symbolAbbr: "N",
    localName: "Nigerian Naira",
  },
  [SupportCurrency.IRR]: {
    symbol: "IRR",
    symbolAbbr: "RI.",
    localName: "Rial-e Irân",
  },
  [SupportCurrency.BDT]: {
    symbol: "BDT",
    symbolAbbr: "৳",
    localName: "টাকা,taka",
  },
  [SupportCurrency.BRL]: {
    symbol: "BRL",
    symbolAbbr: "R$",
    localName: "Real Brasileiro",
  },
};

export const COUNTRY_CURRENCY: Record<string, SupportCurrency> = {
  US: SupportCurrency.USD,
  AU: SupportCurrency.AUD,
  CA: SupportCurrency.CAD,
  DE: SupportCurrency.EUR,
  FR: SupportCurrency.EUR,
  IT: SupportCurrency.EUR,
  ES: SupportCurrency.EUR,
  GR: SupportCurrency.EUR,
  HK: SupportCurrency.HKD,
  IN: SupportCurrency.INR,
  ID: SupportCurrency.IDR,
  IR: SupportCurrency.IRR,
  JP: SupportCurrency.JPY,
  KR: SupportCurrency.KRW,
  MM: SupportCurrency.MMK,
  NG: SupportCurrency.NGN,
  PH: SupportCurrency.PHP,
  SG: SupportCurrency.SGD,
  VN: SupportCurrency.VND,
  RU: SupportCurrency.RUB,
  UA: SupportCurrency.UAH,
  GB: SupportCurrency.GBP,
  TR: SupportCurrency.TRY,
  BD: SupportCurrency.BDT,
  BR: SupportCurrency.BRL,
};

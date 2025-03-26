import { CoinType } from "core/types";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

export const DEFAULT_UNIQUE_ID_MAP: { [key in CoinType]: InnerChainUniqueId } =
  {
    [CoinType.ALEO]: InnerChainUniqueId.ALEO_MAINNET,
    [CoinType.ETH]: InnerChainUniqueId.ETHEREUM,
  };

export enum SupportCurrency {
  USD = "USD", // 美元
  INR = "INR", // 印度卢比
  PHP = "PHP", // 菲律宾比索
  IDR = "IDR", // 印度尼西亚 卢比
  EUR = "EUR", // 欧元
  JPY = "JPY", // 日元
  CAD = "CAD", // 加元
  AUD = "AUD", // 澳元
  SGD = "SGD", // 新加坡元
  HKD = "HKD", // 港币
  KRW = "KRW", // 韩元
  VND = "VND", // 越南盾
  NGN = "NGN", // 尼日利亚	奈拉
  IRR = "IRR", // 伊朗里亚尔
  MMK = "MMK", // 缅甸元
  RUB = "RUB", // 俄罗斯卢布
  UAH = "UAH", // 乌克兰	格里夫尼亚
  GBP = "GBP", // 英镑
  TRY = "TRY", // 土耳其里拉
  BDT = "BDT", // 孟加拉国	塔卡
  BRL = "BRL", // 巴西雷亚尔
  PKR = "PKR", // 巴基斯坦卢比
  SAR = "SAR", // 沙特里亚尔
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
    symbolAbbr: "D. ",
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
    symbolAbbr: "RI. ",
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
  [SupportCurrency.PKR]: {
    symbol: "PKR",
    symbolAbbr: "₨ ",
    localName: "پاکستانی روپیہ",
  },
  [SupportCurrency.SAR]: {
    symbol: "SAR",
    symbolAbbr: "﷼",
    localName: "ريال سعودي",
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
  PK: SupportCurrency.PKR,
  SA: SupportCurrency.SAR,
};

import { formatTokenNum } from "@/common/utils/num";
import { Text, type TextProps } from "@chakra-ui/react";
import { useMemo } from "react";

export const TokenNum = ({
  amount,
  decimals,
  commify,
  precision,
  symbol,
  placeholder,
  extraPreText = "",
  ...rest
}: {
  amount?: bigint;
  decimals: number;
  commify?: boolean;
  precision?: number;
  symbol?: string;
  placeholder?: string;
  extraPreText?: string;
} & TextProps) => {
  const amountStr = useMemo(() => {
    if (amount === undefined) {
      return "---";
    }
    const formatted = formatTokenNum(
      amount,
      decimals,
      precision,
      commify,
      placeholder ?? "",
      symbol,
    );
    return extraPreText + formatted;
  }, [amount, decimals, precision, commify, placeholder, symbol, extraPreText]);

  return <Text {...rest}>{amountStr}</Text>;
};

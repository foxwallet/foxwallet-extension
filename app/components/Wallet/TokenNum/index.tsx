import { L1 } from "@/common/theme/components/text";
import { formatTokenNum } from "@/common/utils/num";
import { Text, TextProps, chakra } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useMemo } from "react";

export const TokenNum = ({
  amount,
  decimals,
  commify,
  precision,
  symbol,
  placeholder,
  ...rest
}: {
  amount?: bigint;
  decimals: number;
  commify?: boolean;
  precision?: number;
  symbol?: string;
  placeholder?: string;
} & TextProps) => {
  const amountStr = useMemo(() => {
    if (amount === undefined) {
      return "---";
    }
    return formatTokenNum(
      amount,
      decimals,
      precision,
      commify,
      placeholder || "",
      symbol,
    );
  }, [amount, decimals, precision, commify, placeholder, symbol]);

  return <Text {...rest}>{amountStr}</Text>;
};

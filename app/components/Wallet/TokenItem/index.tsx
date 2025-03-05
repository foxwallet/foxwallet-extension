import { type ChakraProps, Flex, Image, Text } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCallback, useMemo, useState } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { type TokenV2 } from "core/types/Token";
import { IconTokenPlaceHolder } from "@/components/Custom/Icon";
import { commaCurrency, commaInteger } from "@/common/utils/comma";
import { formatPrice } from "@/common/utils/num";

export const TokenItemWithBalance = ({
  uniqueId,
  address,
  token,
  onClick,
  hover,
  leftElement,
  showPriceAndChange = true,
  showBalnaceAndValue = true,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  token: TokenV2;
  onClick: (token: TokenV2) => void;
  leftElement?: React.ReactNode;
  hover?: boolean;
  showPriceAndChange?: boolean;
  showBalnaceAndValue?: boolean;
}) => {
  const showBalanceGlobal = usePopupSelector(
    (state) => state.accountV2.showBalance,
  );

  const { price, change, value } = token;
  const priceStr = useMemo(() => {
    const formatStr = formatPrice(price).toString();
    const comma = commaInteger(formatStr);
    return `$${comma}`; // usd price
  }, [price]);

  const changeStrColor = useMemo(() => {
    if (!change) {
      return "#777e90";
    }
    const numericValue = parseFloat(change.replace("%", ""));
    if (numericValue >= 0) {
      return "#00D856";
    } else {
      return "#ef466f";
    }
  }, [change]);

  const valueStr = useMemo(() => {
    if (value === undefined) {
      return "";
    }
    return `$${commaCurrency(value)}`;
  }, [value]);

  // const { balance } = useBalance({ uniqueId, address, token });

  const onTokenDetail = useCallback(() => {
    onClick(token);
  }, [onClick, token]);

  const [tokenImageOK, setTokenImageOK] = useState(true);

  const tokenImage = useMemo(() => {
    if (!token.icon || !tokenImageOK) {
      return <IconTokenPlaceHolder w={8} h={8} />;
    }
    return (
      <Image
        src={token.icon}
        w={8}
        h={8}
        borderRadius={16}
        onError={() => setTokenImageOK(false)}
      />
    );
  }, [token.icon, tokenImageOK]);

  return (
    <Flex
      py={3}
      px={5}
      align={"center"}
      justify={"space-between"}
      onClick={onTokenDetail}
      flex={1}
      _hover={{ bg: hover ? "gray.50" : undefined }}
      cursor={"pointer"}
      w={"full"}
    >
      <Flex align={"center"}>
        {leftElement}
        {tokenImage}
        <Flex flexDir={"column"} ml={2.5}>
          <Text fontSize={13} fontWeight={600}>
            {token.symbol}
          </Text>
          {showPriceAndChange && (
            <Flex justify={"center"} alignItems={"center"} fontSize={"11px"}>
              <Text color={"#777e90"}>{priceStr}</Text>
              <Text ml={1} color={changeStrColor}>
                {change}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      {showBalnaceAndValue &&
        (showBalanceGlobal ? (
          <Flex
            direction={"column"}
            justify={"center"}
            alignItems={"flex-end"}
            // bg={"yellow"}
          >
            <TokenNum
              amount={token?.total}
              decimals={token.decimals}
              symbol={""}
            />
            <Text color={"#777e90"} fontSize={"11px"}>
              {valueStr}
            </Text>
          </Flex>
        ) : (
          <Flex direction={"column"} justify={"center"} alignItems={"flex-end"}>
            <Text>*****</Text>
            <Text color={"#777e90"} fontSize={"11px"}>
              *****
            </Text>
          </Flex>
        ))}
    </Flex>
  );
};

export const TokenItem = ({
  token,
  onClick,
  hover,
  hideId,
  style,
}: {
  token: TokenV2;
  onClick: (token: TokenV2) => void;
  hover?: boolean;
  hideId?: boolean;
  style?: ChakraProps;
}) => {
  const onTokenDetail = useCallback(() => {
    onClick(token);
  }, [onClick, token]);

  return (
    <Flex
      py={3}
      px={5}
      align={"center"}
      justify={"space-between"}
      onClick={onTokenDetail}
      flex={1}
      _hover={{ bg: hover ? "gray.50" : undefined }}
      cursor={"pointer"}
      {...style}
    >
      <Flex align={"center"}>
        {token.icon ? (
          <Image src={token.icon} w={8} h={8} borderRadius={16} />
        ) : (
          <IconTokenPlaceHolder w={8} h={8} />
        )}{" "}
        <Flex flexDir={"column"} ml={2.5}>
          <Text fontSize={13} fontWeight={600}>
            {token.symbol}
          </Text>
          {!hideId && (
            <Text maxW={"120"} noOfLines={1} fontSize={10} color={"gray.400"}>
              {token.tokenId}
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

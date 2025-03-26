import {
  type ChakraProps,
  Flex,
  Image,
  type ImageProps,
  Text,
} from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCallback, useMemo, useState } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { AssetType, type TokenV2 } from "core/types/Token";
import { IconTokenPlaceHolder } from "@/components/Custom/Icon";
import { commaCurrency, commaInteger } from "@/common/utils/comma";
import { formatPrice } from "@/common/utils/num";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";

export const TokenImage = ({
  token,
  uniqueId,
  imageStyle,
}: {
  token: TokenV2;
  uniqueId: ChainUniqueId;
  imageStyle?: ImageProps;
}) => {
  const [tokenImageOK, setTokenImageOK] = useState(true);
  const { nativeCurrency } = useCoinService(uniqueId);

  return token.type === AssetType.COIN ? (
    <Image
      src={nativeCurrency.logo}
      w={8}
      h={8}
      borderRadius={16}
      {...imageStyle}
    />
  ) : token.icon && tokenImageOK ? (
    <Image
      src={token.icon}
      w={8}
      h={8}
      borderRadius={16}
      onError={() => {
        setTokenImageOK(false);
      }}
      {...imageStyle}
    />
  ) : (
    <IconTokenPlaceHolder w={8} h={8} {...imageStyle} />
  );
};

const TokenImageWithChainLogo = ({
  token,
  uniqueId,
  showChainLogo,
  imageStyle,
}: {
  token: TokenV2;
  uniqueId: ChainUniqueId;
  showChainLogo: boolean;
  imageStyle?: ImageProps;
}) => {
  const { chainConfig } = useCoinService(uniqueId);

  return (
    <Flex w={9} h={9} position="relative">
      <TokenImage token={token} uniqueId={uniqueId} imageStyle={imageStyle} />
      {showChainLogo && (
        <Flex
          justify={"center"}
          alignItems={"center"}
          bg={"white"}
          w={4}
          h={4}
          bottom={0}
          right={0}
          position={"absolute"}
          borderRadius={8}
        >
          <Image src={chainConfig.logo} w={3.5} h={3.5} borderRadius={8} />
        </Flex>
      )}
    </Flex>
  );
};

export const TokenItemWithBalance = ({
  uniqueId,
  address,
  token,
  onClick,
  hover,
  leftElement,
  showPriceAndChange = true,
  showBalanceAndValue = true,
  showChainLogo = true,
  style,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  token: TokenV2;
  onClick: (token: TokenV2) => void;
  leftElement?: React.ReactNode;
  hover?: boolean;
  showPriceAndChange?: boolean;
  showBalanceAndValue?: boolean;
  showChainLogo?: boolean;
  style?: ChakraProps;
}) => {
  const showBalanceGlobal = usePopupSelector(
    (state) => state.accountV2.showBalance,
  );

  const { balance } = useBalance({ uniqueId, address, token });
  // console.log("      balance", balance);

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
      w={"full"}
      {...style}
    >
      <Flex align={"center"}>
        {leftElement}
        <TokenImageWithChainLogo
          token={token}
          uniqueId={uniqueId}
          showChainLogo={showChainLogo}
        />
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
      {showBalanceAndValue &&
        (showBalanceGlobal ? (
          <Flex
            direction={"column"}
            justify={"center"}
            alignItems={"flex-end"}
            // bg={"yellow"}
          >
            <TokenNum
              amount={balance?.total ?? token?.total}
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
        )}
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

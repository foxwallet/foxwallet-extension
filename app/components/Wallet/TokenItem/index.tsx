import { type ChakraProps, Flex, Image, Text } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import Hover from "@/components/Custom/Hover";
import { type Token } from "core/coins/ALEO/types/Token";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import { type TokenV2 } from "core/types/Token";
import { IconTokenPlaceHolder } from "@/components/Custom/Icon";
import { useBalance } from "@/hooks/useBalance";
import { commaInteger } from "@/common/utils/comma";
import { formatPrice } from "@/common/utils/num";

export const TokenItemWithBalance = ({
  uniqueId,
  address,
  token,
  onClick,
  hover,
  leftElement,
}: {
  uniqueId: ChainUniqueId;
  address: string;
  token: TokenV2;
  onClick: (token: TokenV2) => void;
  leftElement?: React.ReactNode;
  hover?: boolean;
}) => {
  const showBalance = usePopupSelector((state) => state.accountV2.showBalance);
  const { price, change } = token;
  const priceStr = useMemo(() => {
    return formatPrice(price).toString();
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

  const { balance } = useBalance({ uniqueId, address, token });

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
    >
      <Flex align={"center"}>
        {leftElement}
        {token.icon ? (
          <Image src={token.icon} w={8} h={8} borderRadius={16} />
        ) : (
          <IconTokenPlaceHolder w={8} h={8} />
        )}
        <Flex flexDir={"column"} ml={2.5}>
          <Text fontSize={13} fontWeight={600}>
            {token.symbol}
          </Text>
          <Flex justify={"center"} alignItems={"center"} fontSize={"11px"}>
            <Text color={"#777e90"}>{commaInteger(priceStr)}</Text>
            <Text ml={1} color={changeStrColor}>
              {change}
            </Text>
          </Flex>
          {/* {token.programId !== NATIVE_TOKEN_PROGRAM_ID && */}
          {/*  token.programId !== BETA_STAKING_PROGRAM_ID && ( */}
          {/*    <Text maxW={"120"} noOfLines={1} fontSize={10} color={"gray.400"}> */}
          {/*      {token.tokenId} */}
          {/*    </Text> */}
          {/*  )} */}
        </Flex>
      </Flex>
      {showBalance ? (
        <TokenNum
          amount={balance?.total}
          decimals={token.decimals}
          symbol={""}
        />
      ) : (
        <Text>*****</Text>
      )}
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

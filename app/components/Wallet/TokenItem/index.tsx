import { type ChakraProps, Flex, Image, Text } from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { usePopupSelector } from "@/hooks/useStore";
import Hover from "@/components/Custom/Hover";
import { type Token } from "core/coins/ALEO/types/Token";
import { type ChainUniqueId } from "core/types/ChainUniqueId";
import {
  BETA_STAKING_PROGRAM_ID,
  NATIVE_TOKEN_PROGRAM_ID,
} from "core/coins/ALEO/constants";
import { useAleoBalance } from "@/hooks/useAleoBalance";

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
  token: Token;
  onClick: (token: Token) => void;
  leftElement?: React.ReactNode;
  hover?: boolean;
}) => {
  const showBalance = usePopupSelector((state) => state.accountV2.showBalance);
  const { balance } = useAleoBalance({
    uniqueId,
    address,
    programId: token.programId,
    tokenId: token.tokenId,
    refreshInterval: 4000,
  });

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
    >
      <Flex align={"center"}>
        {leftElement}
        <Image src={token.logo} w={8} h={8} borderRadius={16} />
        <Flex flexDir={"column"} ml={2.5}>
          <Text fontSize={13} fontWeight={600}>
            {token.symbol}
          </Text>
          {token.programId !== NATIVE_TOKEN_PROGRAM_ID &&
            token.programId !== BETA_STAKING_PROGRAM_ID && (
              <Text maxW={"120"} noOfLines={1} fontSize={10} color={"gray.400"}>
                {token.tokenId}
              </Text>
            )}
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
  token: Token;
  onClick: (token: Token) => void;
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
        <Image src={token.logo} w={8} h={8} borderRadius={16} />
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

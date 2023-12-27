import { Box, type BoxProps, Flex, type FlexProps } from "@chakra-ui/react";
import { type Score } from "@zxcvbn-ts/core";
import { B2, L2 } from "../../../common/theme/components/text";

const Line = (props: BoxProps) => {
  return <Box h="1" borderRadius={"2"} w={"5"} {...props} />;
};

const GrayLine = (props: BoxProps) => {
  return <Box bg={"gray.500"} h="1" w="5" borderRadius={"2"} {...props} />;
};

type Props = {
  score: Score;
} & FlexProps;

export const PasswordStrengthIndicator = (props: Props) => {
  const { score, ...restProps } = props;
  switch (score) {
    case 0:
    case 1: {
      return (
        <Flex {...restProps}>
          <Flex>
            <Line bg={"red.300"} mr="2" />
            <GrayLine mr="2" />
            <GrayLine mr="2" />
            <GrayLine />
          </Flex>
          <L2 color="red.300" ml={"2"} fontWeight={"bold"}>
            {"Weaker"}
          </L2>
        </Flex>
      );
    }
    case 2: {
      return (
        <Flex {...restProps}>
          <Flex>
            <Line bg={"red.300"} mr="2" />
            <Line bg={"red.300"} mr="2" />
            <GrayLine mr="2" />
            <GrayLine />
          </Flex>
          <L2 color="orange.400" ml={"2"} fontWeight={"bold"}>
            {"Weak"}
          </L2>
        </Flex>
      );
    }
    case 3: {
      return (
        <Flex {...restProps}>
          <Flex>
            <Line bg={"green.600"} mr="2" />
            <Line bg={"green.600"} mr="2" />
            <Line bg={"green.600"} mr="2" />
            <GrayLine />
          </Flex>
          <L2 color="green.600" ml={"2"} fontWeight={"bold"}>
            {"Good"}
          </L2>
        </Flex>
      );
    }
    case 4: {
      return (
        <Flex {...restProps}>
          <Flex>
            <Line bg={"green.600"} mr="2" />
            <Line bg={"green.600"} mr="2" />
            <Line bg={"green.600"} mr="2" />
            <Line bg={"green.600"} />
          </Flex>
          <L2 color="green.600" ml={"2"} fontWeight={"bold"}>
            {"Strong"}
          </L2>
        </Flex>
      );
    }
  }
};

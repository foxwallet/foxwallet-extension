
import { Box, type BoxProps, Flex, type FlexProps } from "@chakra-ui/react";
import { type Score } from "@zxcvbn-ts/core";
import { B2, L2, L3 } from "../../common/theme/components/text";

const Line = (props: BoxProps) => {
  return <Box h="1" borderRadius={"2"} {...props} />;
};

const GrayLine = (props: BoxProps) => {
  return <Box bg={"gray.500"} h="1" w="3" borderRadius={"2"} {...props} />;
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
          <Line bg={"red.200"} w={"8"} mr="2" />
          <GrayLine mr="2" />
          <GrayLine mr="2" />
          <GrayLine />
          <L3 color="red.300" ml={"2"}>
            {"Weaker"}
          </L3>
        </Flex>
      );
    }
    case 2: {
      return (
        <Flex {...restProps}>
          <Line bg={"orange.300"} w={"14"} mr="2" />
          <GrayLine mr="2" />
          <GrayLine />
          <L3 color="orange.400" ml={"2"}>
            {"Weak"}
          </L3>
        </Flex>
      );
    }
    case 3: {
      return (
        <Flex {...restProps}>
          <Line bg={"green.400"} w={"20"} mr="2" />
          <GrayLine />
          <L3 color="green.500" ml={"2"}>
            {"Good"}
          </L3>
        </Flex>
      );
    }
    case 4: {
      return (
        <Flex {...restProps}>
          <Line bg={"green.500"} w={"24"} />
          <L3 color="green.600" ml={"2"}>
            {"Strong"}
          </L3>
        </Flex>
      );
    }
  }
};

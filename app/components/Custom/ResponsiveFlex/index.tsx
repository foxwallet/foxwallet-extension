import { Flex, FlexProps } from "@chakra-ui/react";

export const ResponsiveFlex = (props: FlexProps) => {
  return (
    <Flex
      direction={"column"}
      width={["100%", "75%", "50%", "25%"]}
      {...props}
    />
  );
};

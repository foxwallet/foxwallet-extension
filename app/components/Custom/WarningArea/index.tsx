import { Box, type BoxProps } from "@chakra-ui/react";
import { P4 } from "../../../common/theme/components/text";

interface WarningAreaProps {
  container?: BoxProps;
  content: string;
}

export const WarningArea = (props: WarningAreaProps) => {
  const { content, container } = props;
  return (
    <Box bg={"red.50"} {...container} borderRadius={"lg"} px={"4"} py={"2"}>
      <P4 color={"red.500"} lineHeight={1.5}>
        *{content}
      </P4>
    </Box>
  );
};

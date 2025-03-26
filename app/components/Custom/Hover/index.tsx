import { Flex, useStyleConfig } from "@chakra-ui/react";
import { type PropsWithChildren } from "react";
import { type ChakraComponent } from "@chakra-ui/system";

type HoverVariant = "icon" | "cell";

type HoverProps = PropsWithChildren & { variant?: HoverVariant };

const Hover: ChakraComponent<any, HoverProps> = (props: HoverProps) => {
  const { variant, ...rest } = props;
  const styles = useStyleConfig("Hover", { variant });

  return <Flex __css={styles} {...rest} />;
};

export default Hover;

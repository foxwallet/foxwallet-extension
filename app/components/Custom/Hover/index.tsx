import { Flex, useStyleConfig } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { ChakraComponent } from "@chakra-ui/system";

type HoverVariant = "icon" | "cell";

type HoverProps = PropsWithChildren & { variant?: HoverVariant };

const Hover: ChakraComponent<any, HoverProps> = (props) => {
  const { variant, ...rest } = props;
  const styles = useStyleConfig("Hover", { variant });

  return <Flex __css={styles} {...rest} />;
};

export default Hover;

import { Flex, Box } from "@chakra-ui/react";
import { H5 } from "../../../common/theme/components/text";
import { useNavigate } from "react-router-dom";
import { IconCloseLineBlack, IconLeft } from "../Icon";

export enum HeaderLeftIconType {
  Back,
  Close,
}

export interface HeaderProps {
  enableBack?: boolean;
  onBack?: () => boolean;
  title: string;
  backIconType?: HeaderLeftIconType;
  rightIcon?: React.ReactNode;
}

export const Header = ({
  enableBack = true,
  onBack,
  title,
  backIconType = HeaderLeftIconType.Back,
  rightIcon,
}: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <Flex
      w={"full"}
      pt={4}
      pb={2}
      px={3}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      {enableBack ? (
        <Flex
          as={"button"}
          onClick={() => {
            if (onBack) {
              const res = onBack();
              if (res) {
                navigate(-1);
              }
            } else {
              navigate(-1);
            }
          }}
        >
          {backIconType === HeaderLeftIconType.Back ? (
            <IconLeft w={7} h={7} />
          ) : (
            <IconCloseLineBlack w={7} h={7} />
          )}
        </Flex>
      ) : (
        <Box w={"7"} h={"7"} />
      )}
      <H5
        whiteSpace={"nowrap"}
        overflow={"hidden"}
        textOverflow={"ellipsis"}
        mx={"2"}
        fontWeight={"semibold"}
      >
        {title}
      </H5>
      {!!rightIcon ? rightIcon : <Box w={"7"} h={"7"} />}
    </Flex>
  );
};

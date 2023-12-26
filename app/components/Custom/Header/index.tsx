import { Flex, Image, Box, Container } from "@chakra-ui/react";
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
}

export const Header = ({
  enableBack = true,
  onBack,
  title,
  backIconType = HeaderLeftIconType.Back,
}: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <Flex
      w={"full"}
      py={3}
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
            <IconLeft />
          ) : (
            <IconCloseLineBlack />
          )}
        </Flex>
      ) : (
        <Box w={"6"} h={"6"} />
      )}
      <H5
        whiteSpace={"nowrap"}
        overflow={"hidden"}
        textOverflow={"ellipsis"}
        mx={"2"}
        fontWeight={"normal"}
      >
        {title}
      </H5>
      <Box w={"6"} h={"6"} />
    </Flex>
  );
};

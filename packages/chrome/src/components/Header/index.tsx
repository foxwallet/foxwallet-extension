import React from "react";
import { Flex, Image, Box, Container } from "@chakra-ui/react";
import { H5 } from "../../common/theme/components/text";
import { useNavigate } from "react-router-dom";
import { IconLeft } from "../Icon";

interface HeaderProps {
  enableBack: boolean;
  title: string;
}

export const Header = ({ enableBack, title }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <Flex
      w={"full"}
      mt={"1"}
      py={"2"}
      px={"4"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      {enableBack ? (
        <Flex
          bg={"gray.100"}
          w={"6"}
          h={"6"}
          justifyContent={"center"}
          alignItems={"center"}
          borderRadius={"12"}
          cursor={"pointer"}
          onClick={() => {
            navigate(-1);
          }}
        >
          <IconLeft w={"3"} h={"3"} />
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

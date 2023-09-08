import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { default as logo } from "../../common/assets/image/onboard_logo.svg";
import { H4, L1 } from "../../common/theme/components/text";
import { useNavigate } from "react-router-dom";

function OnboardHomeScreen() {
  const navigate = useNavigate();

  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      <Flex alignItems={"center"} justifyContent={"center"} w={"full"} flex={1}>
        <Image src={logo} />
      </Flex>
      <Flex direction={"column"} alignItems={"center"} px="8" mb="8">
        <H4>{"The best Web3 wallet entrance to crypto world"}</H4>
      </Flex>
      <Button mx="8" mb="4" onClick={() => navigate("/onboard/create")}>
        Create Wallet
      </Button>
      <Button mx="8" mb="4">
        Import Wallet
      </Button>
    </Flex>
  );
}

export default OnboardHomeScreen;

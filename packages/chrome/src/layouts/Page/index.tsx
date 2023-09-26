import React, { type PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";
import { Header } from "../../components/Header";

export const Page = (props: PropsWithChildren) => {
  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      {props.children}
    </Flex>
  );
};

type PageWithHeaderProps = {
  enableBack: boolean;
  onBack?: () => boolean;
  title: string;
} & PropsWithChildren;

export const PageWithHeader = (props: PageWithHeaderProps) => {
  return (
    <Page>
      <Header {...props} />
      {props.children}
    </Page>
  );
};

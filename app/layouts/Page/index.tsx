import { type PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";
import { Header, HeaderProps } from "../../components/Custom/Header";

export const Page = (props: PropsWithChildren) => {
  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      {props.children}
    </Flex>
  );
};

type PageWithHeaderProps = HeaderProps & PropsWithChildren;

export const PageWithHeader = (props: PageWithHeaderProps) => {
  return (
    <Page>
      <Header {...props} />
      {props.children}
    </Page>
  );
};

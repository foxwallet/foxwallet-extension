import { type PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";
import { Header, type HeaderProps } from "../../components/Custom/Header";
import { isSidePanel } from "@/common/utils/walletUI";

type PageProps = PropsWithChildren<{ fillSidePanel?: boolean }>;

export const Page = ({ children, fillSidePanel = false }: PageProps) => {
  return (
    <Flex
      direction={"column"}
      w={"full"}
      h={fillSidePanel && isSidePanel() ? "100dvh" : "full"}
      minH={0}
    >
      {children}
    </Flex>
  );
};

type PageWithHeaderProps = HeaderProps & PageProps;

export const PageWithHeader = ({
  children,
  fillSidePanel,
  ...headerProps
}: PageWithHeaderProps) => {
  return (
    <Page fillSidePanel={fillSidePanel}>
      <Header {...headerProps} />
      {children}
    </Page>
  );
};

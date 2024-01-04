import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Flex } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const TransactionDetailScreen = () => {
  const { txId } = useParams();
  return (
    <PageWithHeader title="Transaction Detail">
      <Content>
        <Flex direction={"column"}>
          <Flex align={"center"}></Flex>
        </Flex>
      </Content>
    </PageWithHeader>
  );
};

export default TransactionDetailScreen;

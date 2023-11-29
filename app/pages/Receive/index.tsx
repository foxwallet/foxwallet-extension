import { useBalance } from "@/hooks/useBalance";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { Button, Flex, Text, chakra } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import WALLET_LOGO from "@/common/assets/image/logo.png";
import { L1 } from "@/common/theme/components/text";
import { Content } from "@/layouts/Content";

const QRCode = chakra(QRCodeSVG);

function ReceiveScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
  );

  return (
    <PageWithHeader enableBack title="Receive">
      <Content>
        <QRCode
          value={selectedAccount.address}
          h={200}
          w={200}
          mx={"auto"}
          imageSettings={{
            src: WALLET_LOGO,
            height: 30,
            width: 30,
            excavate: false,
          }}
        />
        <L1>{selectedAccount.address}</L1>
      </Content>
    </PageWithHeader>
  );
}

export default ReceiveScreen;

import {
  Box,
  Button,
  Flex,
  Image,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { default as logo } from "../../common/assets/image/onboard_logo.svg";
import { B2, B3, H4, L1, P4 } from "../../common/theme/components/text";
import { PageWithHeader } from "../../layouts/Page";
import { Body } from "../../layouts/Body";
import { Content } from "../../layouts/Content";
import { OnboardProgress } from "../../components/OnboardProgress";
import { BaseInput, BaseInputGroup } from "../../components/Input";
import IconEye from "@/common/assets/image/icon_eye.svg";
import { WarningArea } from "../../components/WarningArea";
import { BaseCheckBox } from "../../components/CheckBox";
import IconChecked from "@/common/assets/image/icon_checked.svg";

function OnboardCreateWalletScreen() {
  const [step, setStep] = useState(1);
  return (
    <PageWithHeader title="Create Wallet" enableBack>
      <Body>
        <OnboardProgress currStep={step} />
        <Content>
          <BaseInput
            title={"Wallet Name"}
            placeholder={"Enter wallet name"}
            container={{ mt: "2" }}
            required
          />
          <BaseInputGroup
            container={{ mt: 2 }}
            title={"Password"}
            required
            inputProps={{
              placeholder: "No less than 6 characters",
            }}
            rightElement={
              <InputRightElement
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                w={"5"}
                h="full"
                mr={"2"}
                cursor={"pointer"}
              >
                <Image src={IconEye} />
              </InputRightElement>
            }
          />
          <BaseInput
            placeholder={"Enter password again"}
            container={{ mt: "2" }}
          />
          <WarningArea
            container={{
              mt: 4,
            }}
            content="FoxWallet won't store the password. Once the password is forgotten, you can only restore the wallet through the mnemonic."
          />
        </Content>
        <Flex
          position={"fixed"}
          direction={"column"}
          left={0}
          right={0}
          bottom={"4"}
          px={2}
        >
          <BaseCheckBox>
            <B3>
              {"I agree to FoxWallet's "}
              <B3>{"User Notice "}</B3>
              {"and "}
              <B3>{"Privacy Policy"}</B3>
            </B3>
          </BaseCheckBox>
          <IconEye />
          <IconChecked />
          <Button>Confirm</Button>
        </Flex>
      </Body>
    </PageWithHeader>
  );
}

export default OnboardCreateWalletScreen;

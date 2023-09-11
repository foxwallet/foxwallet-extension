import {
  Box,
  Button,
  Flex,
  Image,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { default as logo } from "../../common/assets/image/onboard_logo.svg";
import { B2, B3, H4, L1, P4 } from "../../common/theme/components/text";
import { PageWithHeader } from "../../layouts/Page";
import { Body } from "../../layouts/Body";
import { Content } from "../../layouts/Content";
import { OnboardProgress } from "../../components/OnboardProgress";
import { BaseInput, BaseInputGroup } from "../../components/Input";
import IconEye from "@/common/assets/image/icon_eye.svg";
import { WarningArea } from "../../components/WarningArea";
import BaseCheckbox from "../../components/Checkbox";
import browser from "webextension-polyfill";
import { IconCheckLine, IconCloseLine, IconEyeOn } from "../../components/Icon";
import { IconEyeClose } from "../../components/Icon";
import { Score as PasswordScore, zxcvbn } from "@zxcvbn-ts/core";
import { useDebounce } from "use-debounce";
import { getPasswordStrength } from "../../common/utils/zxcvbn";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";
import { PASSWORD_MINIMUL_LENGTH } from "../../common/constants";

function OnboardCreateWalletScreen() {
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [viewPass, setViewPass] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState<PasswordScore | null>(
    null
  );
  const [debouncePassword] = useDebounce(password, 300);
  const [confirmPassword, setConfirmPassword] = useState("");

  const onWalletNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setWalletName(value);
    },
    []
  );

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    []
  );

  useEffect(() => {
    if (debouncePassword) {
      getPasswordStrength(debouncePassword).then((score) => {
        setPasswordScore(score);
      });
    } else {
      setPasswordScore(null);
    }
  }, [debouncePassword]);

  const [showConfirmPasswordIndicator, confirmPasswordCorrect] = useMemo(() => {
    if (!password || !confirmPassword) {
      return [false, false];
    }
    return [true, password === confirmPassword];
  }, [password, confirmPassword]);

  const disableConfirm = useMemo(() => {
    return (
      !walletName ||
      !password ||
      !confirmPassword ||
      password.length < PASSWORD_MINIMUL_LENGTH ||
      password !== confirmPassword
    );
  }, [walletName, password, confirmPassword]);

  console.log("==> disableConfirm: ", disableConfirm);

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
            value={walletName}
            onChange={onWalletNameChange}
          />
          <BaseInputGroup
            container={{ mt: 2 }}
            title={"Password"}
            required
            inputProps={{
              placeholder: "No less than 6 characters",
              type: viewPass ? "text" : "password",
              onChange: onPasswordChange,
              isInvalid:
                !!password && password.length < PASSWORD_MINIMUL_LENGTH,
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
                onClick={() => setViewPass((curr) => !curr)}
              >
                {viewPass ? (
                  <IconEyeClose w={"5"} h="full" />
                ) : (
                  <IconEyeOn w={"5"} h="full" />
                )}
              </InputRightElement>
            }
          />
          {passwordScore !== null && (
            <PasswordStrengthIndicator
              score={passwordScore}
              justifyContent={"flex-end"}
              alignItems={"center"}
            />
          )}
          <BaseInputGroup
            container={{ mt: 2 }}
            inputProps={{
              isInvalid:
                showConfirmPasswordIndicator && !confirmPasswordCorrect,
              placeholder: "Enter password again",
              type: viewPass ? "text" : "password",
              onChange: (event) => setConfirmPassword(event.target.value),
            }}
            rightElement={
              showConfirmPasswordIndicator && (
                <InputRightElement
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  w={"5"}
                  h="full"
                  mr={"2"}
                  cursor={"pointer"}
                  onClick={() => setViewPass((curr) => !curr)}
                >
                  {confirmPasswordCorrect ? (
                    <IconCheckLine w={"5"} h="full" stroke="green.500" />
                  ) : (
                    <IconCloseLine w={"5"} h="full" fill="red.400" />
                  )}
                </InputRightElement>
              )
            }
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
          px={4}
        >
          <Button isDisabled={disableConfirm}>Confirm</Button>
        </Flex>
      </Body>
    </PageWithHeader>
  );
}

export default OnboardCreateWalletScreen;

import { Button, Flex, InputRightElement } from "@chakra-ui/react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Content } from "../../../layouts/Content";
import { BaseInput, BaseInputGroup } from "../../Custom/Input";
import { WarningArea } from "../../Custom/WarningArea";
import {
  IconCheckLine,
  IconCloseLine,
  IconEyeOn,
  IconEyeClose,
} from "../../Custom/Icon";
import { type Score as PasswordScore } from "@zxcvbn-ts/core";
import { useDebounce } from "use-debounce";
import { getPasswordStrength } from "../../../common/utils/zxcvbn";
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator";
import { PASSWORD_MINIMUL_LENGTH } from "../../../common/constants";
import { showPasswordWarningDialog } from "../PasswordWarningDialog";
import { useTranslation } from "react-i18next";

export const CreatePasswordStep = (props: {
  onConfirm: (walletName: string, password: string) => void;
}) => {
  const { t } = useTranslation();
  const [walletName, setWalletName] = useState("");
  const [viewPass, setViewPass] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState<PasswordScore | null>(
    null,
  );
  const [debouncePassword] = useDebounce(password, 300);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { onConfirm: onSubmit } = props;

  const onWalletNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setWalletName(value);
    },
    [],
  );

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  useEffect(() => {
    if (debouncePassword) {
      void getPasswordStrength(debouncePassword).then((score) => {
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

  const onConfirm = useCallback(async () => {
    if (disableConfirm) {
      return;
    }
    if (!passwordScore || passwordScore < 3) {
      const { confirmed } = await showPasswordWarningDialog();
      if (!confirmed) {
        return;
      }
      onSubmit(walletName, password);
      return;
    }
    onSubmit(walletName, password);
  }, [disableConfirm, passwordScore, walletName, password, onSubmit]);

  return (
    <Content>
      <BaseInput
        title={t("Wallet:Create:walletName")}
        placeholder={t("Wallet:Create:walletNamePlaceholder")}
        container={{ mt: "2" }}
        value={walletName}
        onChange={onWalletNameChange}
      />
      <BaseInputGroup
        container={{ mt: 2 }}
        title={t("Password:title")}
        inputProps={{
          placeholder: t("Password:passwordPlaceholder"),
          type: viewPass ? "text" : "password",
          onChange: onPasswordChange,
          isInvalid: !!password && password.length < PASSWORD_MINIMUL_LENGTH,
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
            onClick={() => {
              setViewPass((curr) => !curr);
            }}
          >
            {!viewPass ? (
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
          justifyContent={"space-between"}
          alignItems={"center"}
        />
      )}
      <BaseInputGroup
        container={{ mt: 2 }}
        inputProps={{
          isInvalid: showConfirmPasswordIndicator && !confirmPasswordCorrect,
          placeholder: t("Password:confirmPasswordPlaceholder"),
          type: viewPass ? "text" : "password",
          onChange: (event) => {
            setConfirmPassword(event.target.value);
          },
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
              onClick={() => {
                setViewPass((curr) => !curr);
              }}
            >
              {confirmPasswordCorrect ? (
                <IconCheckLine w={"5"} h="full" stroke="green.600" />
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
        content={t("Password:warning")}
      />
      <Flex
        position={"fixed"}
        direction={"column"}
        left={0}
        right={0}
        bottom={"4"}
        px={4}
      >
        <Button isDisabled={disableConfirm} onClick={onConfirm}>
          {t("Common:confirm")}
        </Button>
      </Flex>
    </Content>
  );
};

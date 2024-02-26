import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageWithHeader } from "../../../layouts/Page";
import { Body } from "../../../layouts/Body";
import { useClient } from "../../../hooks/useClient";
import { CreatePasswordStep } from "../../../components/Onboard/CreatePassword";
import { BackupMnemonicStep } from "../../../components/Onboard/BackupMnemonic";
import { logger } from "../../../common/utils/logger";
import { ConfirmMnemonicStep } from "../../../components/Onboard/ConfirmMnemonic";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import { usePopupDispatch } from "@/hooks/useStore";
import { CoinType } from "core/types";
import { useTranslation } from "react-i18next";
import { Button, Flex, InputRightElement } from "@chakra-ui/react";
import { Content } from "@/layouts/Content";
import { BaseInput, BaseInputGroup } from "@/components/Custom/Input";
import {
  IconCheckLine,
  IconCloseLine,
  IconEyeClose,
  IconEyeOn,
} from "@/components/Custom/Icon";
import { PasswordStrengthIndicator } from "@/components/Onboard/PasswordStrengthIndicator";
import { WarningArea } from "@/components/Custom/WarningArea";
import { useDebounce } from "use-debounce";
import { type Score as PasswordScore } from "@zxcvbn-ts/core";
import { PASSWORD_MINIMUL_LENGTH } from "@/common/constants";
import { showPasswordWarningDialog } from "@/components/Onboard/PasswordWarningDialog";
import { getPasswordStrength } from "@/common/utils/zxcvbn";
import { P4 } from "@/common/theme/components/text";

function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { popupServerClient } = useClient();
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

  const [viewOldPass, setViewOldPass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [correctOldPwd, setCorrectOldPwd] = useState(true);
  const [debounceOldPassword] = useDebounce(oldPassword, 300);

  const [viewPass, setViewPass] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState<PasswordScore | null>(
    null,
  );
  const [debouncePassword] = useDebounce(password, 300);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const checkOldPassword = async () => {
      if (debounceOldPassword) {
        const isCorrect =
          await popupServerClient.checkPassword(debounceOldPassword);
        setCorrectOldPwd(isCorrect);
      } else {
        setCorrectOldPwd(true);
      }
    };
    checkOldPassword();
  }, [debounceOldPassword]);

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
      !correctOldPwd ||
      !password ||
      !confirmPassword ||
      password.length < PASSWORD_MINIMUL_LENGTH ||
      password !== confirmPassword
    );
  }, [password, confirmPassword, correctOldPwd]);

  const onConfirm = useCallback(async () => {
    if (disableConfirm) {
      return;
    }

    if (!passwordScore || passwordScore < 3) {
      const { confirmed } = await showPasswordWarningDialog();
      if (!confirmed) {
        return;
      }

      // todo submit
      return;
    }
    // todo submit
  }, [disableConfirm, passwordScore, password]);

  return (
    <PageWithHeader title={"Change Password"}>
      <Content>
        <BaseInputGroup
          container={{ mt: 2 }}
          title={"Old Password"}
          inputProps={{
            isInvalid:
              !correctOldPwd ||
              (!!oldPassword && oldPassword.length < PASSWORD_MINIMUL_LENGTH),
            placeholder: "Please input your old password",
            type: viewOldPass ? "text" : "password",
            onChange: (event) => {
              setOldPassword(event.target.value);
            },
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
                setViewOldPass((curr) => !curr);
              }}
            >
              {viewOldPass ? (
                <IconEyeClose w={"5"} h="full" />
              ) : (
                <IconEyeOn w={"5"} h="full" />
              )}
            </InputRightElement>
          }
        />
        {!correctOldPwd && (
          <P4 color={"red.500"} lineHeight={1.5} mt={1}>
            Password is wrong
          </P4>
        )}
        <BaseInputGroup
          title="Set Password"
          container={{ mt: 5 }}
          inputProps={{
            isInvalid: !!password && password.length < PASSWORD_MINIMUL_LENGTH,
            placeholder: t("Password:passwordPlaceholder"),
            type: viewPass ? "text" : "password",
            onChange: (event) => {
              setPassword(event.target.value);
            },
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
    </PageWithHeader>
  );
}

export default ChangePasswordScreen;

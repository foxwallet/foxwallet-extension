import { Button, Flex, InputRightElement } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import React, { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { BaseInputGroup } from "@/components/Custom/Input";
import { useTranslation } from "react-i18next";
import { IconEyeClose, IconEyeOn } from "../Icon";
import { useAuth } from "@/hooks/useAuth";
import { WarningArea } from "../WarningArea";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PasswordVerifyDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const { checkPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [validPass, setValidPass] = useState(true);
  const [viewPass, setViewPass] = useState(false);

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setPassword(value);
    },
    [setPassword],
  );

  const handleConfirmPassword = useCallback(async () => {
    if (!password) return;

    const success = await checkPassword(password);
    setValidPass(success);
    if (success) {
      onConfirm?.();
    } else {
      console.warn("password verify failed");
    }
  }, [onConfirm, password, checkPassword]);

  const disabledConfirm = useMemo(() => !password, [password]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Password:verify")}
      body={
        <Flex flexDirection={"column"}>
          <BaseInputGroup
            container={{ mt: 1 }}
            inputProps={{
              placeholder: t("Password:enter"),
              type: viewPass ? "text" : "password",
              onChange: onPasswordChange,
              isInvalid: disabledConfirm,
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
                {viewPass ? (
                  <IconEyeClose w={"5"} h="full" />
                ) : (
                  <IconEyeOn w={"5"} h="full" />
                )}
              </InputRightElement>
            }
          />
          {!validPass && (
            <WarningArea
              container={{ mt: "2" }}
              content={t("Error:invalidPassword")}
            />
          )}
        </Flex>
      }
      footer={
        <Flex justify={"space-between"} flex={1}>
          <Button
            flex={1}
            isDisabled={disabledConfirm}
            onClick={handleConfirmPassword}
          >
            {t("Common:confirm")}
          </Button>
          <Button flex={1} ml={3} onClick={onCancel} colorScheme="normal">
            {t("Common:cancel")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showPasswordVerifyDrawer =
  promisifyChooseDialogWrapper(PasswordVerifyDrawer);

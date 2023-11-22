import { H1 } from "@/common/theme/components/text";
import {
  IconCheckLine,
  IconCloseLine,
  IconEyeClose,
  IconEyeOn,
} from "@/components/Custom/Icon";
import { BaseInput, BaseInputGroup } from "@/components/Custom/Input";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Button, Flex, InputRightElement, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

// TODO: add reset
// TODO: add biometric auth
function Lock() {
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [viewPass, setViewPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsPasswordValid(true);
      setPassword(event.target.value);
    },
    [],
  );

  const onConfirm = useCallback(async () => {
    if (!password) {
      return;
    }
    try {
      const res = await login(password);
      setIsPasswordValid(res);
    } catch (err) {
      console.log("===> Lock login: ", err);
      setIsPasswordValid(false);
    }
  }, [password, login, navigate]);

  const passwordInvalid = !!password && !isPasswordValid;

  return (
    <Flex direction={"column"} w={"full"} h={"full"} justifyContent={"center"}>
      <H1 alignSelf={"center"}>Login</H1>
      <BaseInputGroup
        container={{ mt: 2, mx: 8, mb: 4 }}
        title={"Password"}
        required
        inputProps={{
          isInvalid: passwordInvalid,
          placeholder: "Enter password",
          type: viewPass ? "text" : "password",
          onChange: onPasswordChange,
        }}
        rightElement={
          <InputRightElement
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            w={passwordInvalid ? "12" : "5"}
            h="full"
            mr={"2"}
            cursor={"pointer"}
            onClick={() => {
              setViewPass((curr) => !curr);
            }}
          >
            {passwordInvalid && (
              <IconCloseLine w={"5"} h="full" fill="red.400" mr={2} />
            )}
            {viewPass ? (
              <IconEyeClose w={"5"} h="full" />
            ) : (
              <IconEyeOn w={"5"} h="full" />
            )}
          </InputRightElement>
        }
      />
      <Button isDisabled={!password} onClick={onConfirm} mx="8">
        Confirm
      </Button>
    </Flex>
  );
}

export default Lock;

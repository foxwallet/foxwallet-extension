import {
  Flex,
  type FlexProps,
  Input,
  type InputProps,
  Text,
  chakra,
  InputGroup,
} from "@chakra-ui/react";
import { H6 } from "@/common/theme/components/text";

type BaseInputProps = {
  title?: string;
  required?: boolean;
  container?: FlexProps;
} & InputProps;

export const BaseInput = chakra((props: BaseInputProps) => {
  const { title, required, container } = props;
  return (
    <Flex direction={"column"} {...container}>
      {!!title && (
        <Flex>
          <H6 mb={"2"}>{title}</H6>
          {required ? (
            <Text color={"green.400"} ml={"1"}>
              *
            </Text>
          ) : null}
        </Flex>
      )}
      <Input {...props} />
    </Flex>
  );
});

interface BaseInputGroupProps {
  title?: string;
  required?: boolean;
  container?: FlexProps;
  inputProps?: InputProps;
  headerRightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const BaseInputGroup = (props: BaseInputGroupProps) => {
  const {
    title,
    headerRightElement,
    container,
    inputProps,
    leftElement,
    rightElement,
  } = props;

  return (
    <Flex direction={"column"} {...container}>
      {!!title && (
        <Flex justify={"space-between"}>
          <H6 mb={"2"}>{title}</H6>
          {headerRightElement ?? null}
        </Flex>
      )}
      <InputGroup>
        {leftElement}
        <Input {...inputProps} flex={1} />
        {rightElement}
      </InputGroup>
    </Flex>
  );
};

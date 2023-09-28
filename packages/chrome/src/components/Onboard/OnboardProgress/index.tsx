import { Flex, Box } from "@chakra-ui/react";
import { H6, H5 } from "../../../common/theme/components/text";
import { Fragment, useMemo } from "react";

interface ProgressProps {
  currStep: number;
  steps: string[];
}

const ProgressDivider = () => {
  return <Box h={"1"} w={"10"} bg={"gray.100"} borderRadius={"2"} mt={"-5"} />;
};

const ProgressItem = ({
  step,
  currStep,
  text,
}: {
  step: number;
  currStep: number;
  text: string;
}) => {
  return (
    <Flex
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
    >
      <Flex
        w={"8"}
        h={"8"}
        borderRadius={"16"}
        justifyContent={"center"}
        alignItems={"center"}
        bg={currStep >= step ? "orange.500" : "gray.200"}
        mb={"1"}
      >
        <H6>{step}</H6>
      </Flex>
      <H6 fontWeight={"medium"}>{text}</H6>
    </Flex>
  );
};

export const OnboardProgress = ({ currStep, steps }: ProgressProps) => {
  return (
    <Flex
      justifyContent={"space-around"}
      alignItems={"center"}
      bg={"gray.50"}
      pt="3"
      pb="2"
    >
      {steps.map((step, index) => {
        if (index === 0) {
          return (
            <ProgressItem
              key={index}
              step={index + 1}
              currStep={currStep}
              text={step}
            />
          );
        }

        return (
          <Fragment key={index}>
            <ProgressDivider />
            <ProgressItem step={index + 1} currStep={currStep} text={step} />
          </Fragment>
        );
      })}
    </Flex>
  );
};

import {
  Box,
  Modal,
  ModalBody,
  type ModalBodyProps,
  ModalContent,
  ModalFooter,
  type ModalFooterProps,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
} from "@chakra-ui/react";
import { H6 } from "../../../common/theme/components/text";
import { IconCloseLine } from "../Icon";

interface ModalProps {
  titleElement?: React.ReactNode;
  isOpen: boolean;
  hideClose?: boolean;
  onClose: () => void;
  body: React.ReactNode;
  footer?: React.ReactNode;
  bodyStyle?: ModalBodyProps;
  footerStyle?: ModalFooterProps;
  leftIcon?: React.ReactNode;
}

export function BasicDrawer(props: ModalProps) {
  const {
    titleElement,
    isOpen,
    hideClose,
    onClose,
    body,
    footer,
    bodyStyle,
    footerStyle,
    leftIcon,
  } = props;
  const bg = useColorModeValue("white", "black");

  return (
    <Modal
      closeOnEsc
      closeOnOverlayClick
      onClose={onClose}
      isOpen={isOpen}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent alignSelf={"flex-end"} bg={bg} px={2.5} pt={2.5} pb={5}>
        {(!!titleElement || !hideClose) && (
          <ModalHeader
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mb={4}
          >
            {leftIcon ?? <Box w={6} h={6} />}
            {titleElement ?? <Box w={6} h={6} />}
            {hideClose ? (
              <Box w={6} h={6} />
            ) : (
              <IconCloseLine w={6} h={6} cursor={"pointer"} onClick={onClose} />
            )}
          </ModalHeader>
        )}
        <ModalBody {...bodyStyle}>{body}</ModalBody>
        {!!footer && (
          <ModalFooter justifyContent={"center"} mt={4} {...footerStyle}>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}

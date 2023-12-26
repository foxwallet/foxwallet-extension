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
} from "@chakra-ui/react";
import { H6 } from "../../../common/theme/components/text";
import { IconCloseLine } from "../Icon";

interface ModalProps {
  title?: string;
  isOpen: boolean;
  hideClose?: boolean;
  onClose: () => void;
  body: React.ReactNode;
  footer?: React.ReactNode;
  bodyStyle?: ModalBodyProps;
  footerStyle?: ModalFooterProps;
}

export function BasicDrawer(props: ModalProps) {
  const {
    title,
    isOpen,
    hideClose,
    onClose,
    body,
    footer,
    bodyStyle,
    footerStyle,
  } = props;

  return (
    <Modal
      closeOnEsc
      closeOnOverlayClick
      onClose={onClose}
      isOpen={isOpen}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        alignSelf={"flex-end"}
        bg={"white"}
        px={2.5}
        pt={2.5}
        pb={5}
      >
        {(!!title || !hideClose) && (
          <ModalHeader
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mb={4}
          >
            {hideClose ? (
              <Box w={6} h={6} />
            ) : (
              <IconCloseLine
                w={6}
                h={6}
                cursor={"pointer"}
                fill={"black"}
                onClick={onClose}
              />
            )}
            {!!title && <H6>{title}</H6>}
            <Box w={5} h={5} />
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

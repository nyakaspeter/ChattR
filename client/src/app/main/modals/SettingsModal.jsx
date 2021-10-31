import { Button } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { HStack, Text, VStack } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Switch } from '@chakra-ui/switch';
import React from 'react';
import { IoMdMoon } from 'react-icons/io';

const SettingsModal = props => {
  const { isOpen, onClose } = props;

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="stretch">
            <HStack spacing={4}>
              <IoMdMoon size={20} />
              <Text flex="1">Dark mode</Text>
              <Switch
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
              />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          {/* <Button colorScheme="blue" mr={3}>
            Save
          </Button> */}
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;

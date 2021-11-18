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
import { MdBrandingWatermark } from 'react-icons/md';
import { useCallSettings } from '../../../core/store';

const SettingsModal = props => {
  const { isOpen, onClose } = props;

  const callSettings = useCallSettings();
  const { colorMode, toggleColorMode } = useColorMode();

  const toggleNameOverlay = () => callSettings.nameOverlay.set(e => !e);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems="stretch" spacing={6}>
            <HStack spacing={4}>
              <IoMdMoon size={20} />
              <VStack flex="1" alignItems="start" spacing={0}>
                <Text>Enable dark mode</Text>
                <Text fontSize="xs">Choose between light and dark theme</Text>
              </VStack>
              <Switch
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
              />
            </HStack>
            <HStack spacing={4}>
              <MdBrandingWatermark size={20} />
              <VStack flex="1" alignItems="start" spacing={0}>
                <Text>Overlay name on video stream</Text>
                <Text fontSize="xs">
                  This will only be visible for remote viewers
                </Text>
              </VStack>
              <Switch
                isChecked={callSettings.nameOverlay.value}
                onChange={toggleNameOverlay}
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

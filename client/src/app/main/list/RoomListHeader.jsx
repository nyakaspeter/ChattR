import { IconButton } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { AddIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Flex, Heading, HStack } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { MenuDivider } from '@chakra-ui/react';
import React from 'react';
import { MdLogout, MdSettings } from 'react-icons/md';
import CreateOrEditRoomModal from '../modals/CreateOrEditRoomModal';
import SettingsModal from '../modals/SettingsModal';

const RoomListHeader = props => {
  const {
    isOpen: createRoomModalIsOpen,
    onOpen: openCreateRoomModal,
    onClose: closeCreateRoomModal,
  } = useDisclosure();

  const {
    isOpen: settingsModalIsOpen,
    onOpen: openSettingsModal,
    onClose: closeSettingsModal,
  } = useDisclosure();

  return (
    <>
      <Flex {...props}>
        <HStack spacing={3} flex="1">
          <Heading
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            bgClip="text"
            fontSize="2xl"
            fontWeight="extrabold"
          >
            ChattR
          </Heading>
        </HStack>
        <HStack spacing={3}>
          <IconButton
            onClick={openCreateRoomModal}
            borderRadius="full"
            aria-label=""
            icon={<AddIcon />}
          ></IconButton>
          <Menu>
            <IconButton as={MenuButton} borderRadius="full">
              <HamburgerIcon />
            </IconButton>
            <MenuList>
              <MenuItem
                icon={<MdSettings size={20} />}
                onClick={openSettingsModal}
              >
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<MdLogout size={20} />}
                as="a"
                href="/auth/logout"
              >
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <CreateOrEditRoomModal
        isOpen={createRoomModalIsOpen}
        onClose={closeCreateRoomModal}
      />

      <SettingsModal
        isOpen={settingsModalIsOpen}
        onClose={closeSettingsModal}
      />
    </>
  );
};

export default RoomListHeader;

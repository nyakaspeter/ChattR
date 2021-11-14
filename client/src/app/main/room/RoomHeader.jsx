import { Avatar } from '@chakra-ui/avatar';
import { IconButton } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Badge, Box, Heading, HStack, VStack } from '@chakra-ui/layout';
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/menu';
import { Fade } from '@chakra-ui/transition';
import React from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { HiChatAlt2 } from 'react-icons/hi';
import { ImExit } from 'react-icons/im';
import { IoMdInformationCircle, IoMdPeople } from 'react-icons/io';
import { MdCall, MdDelete, MdEdit } from 'react-icons/md';
import ElapsedTimeText from '../../../components/ElapsedTime';
import { useUser } from '../../../core/query';
import { useUiState } from '../../../core/store';
import CallSetup from '../call/CallSetup';
import Messages from '../message/Messages';
import CreateOrEditRoomModal from '../modals/CreateOrEditRoomModal';
import DeleteRoomModal from '../modals/DeleteRoomModal';
import LeaveRoomModal from '../modals/LeaveRoomModal';
import RoomDetails from './RoomDetails';
import RoomUsers from './RoomUsers';

const RoomHeader = props => {
  const { room, inCall, callSession, ...rest } = props;

  const user = useUser();
  const own = user.data._id === room.owner;

  const uiState = useUiState();

  const {
    isOpen: editRoomModalIsOpen,
    onOpen: openEditRoomModal,
    onClose: closeEditRoomModal,
  } = useDisclosure();

  const {
    isOpen: leaveRoomModalIsOpen,
    onOpen: openLeaveRoomModal,
    onClose: closeLeaveRoomModal,
  } = useDisclosure();

  const {
    isOpen: deleteRoomModalIsOpen,
    onOpen: openDeleteRoomModal,
    onClose: closeDeleteRoomModal,
  } = useDisclosure();

  const handleOpenCallPanel = () =>
    uiState.currentPanel.set({ title: 'Call', content: CallSetup });

  const handleOpenMessagesPanel = () =>
    uiState.currentPanel.set({ title: 'Messages', content: Messages });

  const handleOpenUsersPanel = () =>
    uiState.currentPanel.set({ title: 'Users', content: RoomUsers });

  const handleOpenDetailsPanel = () =>
    uiState.currentPanel.set({ title: 'Details', content: RoomDetails });

  const handleToggleRoomList = () => uiState.showRoomList.set(s => !s);

  return (
    <Fade in>
      <HStack {...rest} p={3} spacing={3}>
        {!uiState.showRoomList.value && (
          <Fade in>
            <IconButton onClick={handleToggleRoomList} borderRadius="full">
              <HamburgerIcon />
            </IconButton>
          </Fade>
        )}
        <Avatar
          name={room.name}
          src={room.image && `/api/room/${room._id}/image?id=${room.image}`}
        />
        <Heading fontSize="2xl" noOfLines={1}>
          {room.name}
        </Heading>
        <Box flex="1" />
        <VStack spacing={1} alignItems="flex-end">
          <Badge>{room.users.length} users</Badge>
          <Badge colorScheme="green">
            {room.users.filter(u => u.online).length} online
          </Badge>
        </VStack>
        {callSession?.active ? (
          <IconButton
            onClick={handleOpenCallPanel}
            borderRadius="full"
            p={3}
            colorScheme="green"
          >
            <HStack>
              <MdCall size={20} />
              <ElapsedTimeText since={callSession?.createdAt} />
            </HStack>
          </IconButton>
        ) : (
          <IconButton onClick={handleOpenCallPanel} borderRadius="full">
            <MdCall size={20} />
          </IconButton>
        )}
        {inCall && (
          <IconButton onClick={handleOpenMessagesPanel} borderRadius="full">
            <HiChatAlt2 size={20} />
          </IconButton>
        )}
        <IconButton onClick={handleOpenUsersPanel} borderRadius="full">
          <IoMdPeople size={20} />
        </IconButton>
        <IconButton onClick={handleOpenDetailsPanel} borderRadius="full">
          <IoMdInformationCircle size={20} />
        </IconButton>
        <Menu>
          <IconButton as={MenuButton} borderRadius="full" p={2.5}>
            <BsThreeDots size={20} />
          </IconButton>
          <MenuList>
            {own && (
              <>
                <MenuItem
                  onClick={openEditRoomModal}
                  icon={<MdEdit size={20} />}
                >
                  Edit room
                </MenuItem>
                <MenuDivider />
              </>
            )}

            {own ? (
              <MenuItem
                onClick={openDeleteRoomModal}
                icon={<MdDelete size={20} />}
                color="red.500"
              >
                Delete room
              </MenuItem>
            ) : (
              <MenuItem
                onClick={openLeaveRoomModal}
                icon={<ImExit size={20} />}
                color="red.500"
              >
                Leave room
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </HStack>

      <CreateOrEditRoomModal
        key={room._id + 'edit'}
        room={room}
        isOpen={editRoomModalIsOpen}
        onClose={closeEditRoomModal}
      />

      <LeaveRoomModal
        key={room._id + 'leave'}
        room={room}
        isOpen={leaveRoomModalIsOpen}
        onClose={closeLeaveRoomModal}
      />

      <DeleteRoomModal
        key={room._id + 'delete'}
        room={room}
        isOpen={deleteRoomModalIsOpen}
        onClose={closeDeleteRoomModal}
      />
    </Fade>
  );
};

export default RoomHeader;

import { Avatar } from '@chakra-ui/avatar';
import { IconButton } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { Badge, Box, Heading, HStack, Text, VStack } from '@chakra-ui/layout';
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
import { useUser } from '../../../core/query';
import Messages from '../message/Messages';
import CreateOrEditRoomModal from '../modals/CreateOrEditRoomModal';
import DeleteRoomModal from '../modals/DeleteRoomModal';
import LeaveRoomModal from '../modals/LeaveRoomModal';
import RoomDetails from './RoomDetails';
import RoomUsers from './RoomUsers';

const RoomHeader = props => {
  const { room, onOpenPanel, ...rest } = props;

  const user = useUser();
  const own = user.data._id === room.owner;

  const inCall = false;

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

  const handleOpenCallPanel = () => {
    onOpenPanel({ title: 'Call', content: Box });
  };

  const handleOpenMessagesPanel = () => {
    onOpenPanel({ title: 'Messages', content: Messages });
  };

  const handleOpenUsersPanel = () => {
    onOpenPanel({ title: 'Users', content: RoomUsers });
  };

  const handleOpenDetailsPanel = () => {
    onOpenPanel({ title: 'Details', content: RoomDetails });
  };

  return (
    <Fade in>
      <HStack {...rest} p={3} spacing={3}>
        <Avatar
          name={room.name}
          src={room.image && `/api/room/${room._id}/image`}
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
        {!inCall && (
          <IconButton onClick={handleOpenCallPanel} borderRadius="full">
            <MdCall size={20} />
          </IconButton>
        )}
        {inCall && (
          <>
            <IconButton
              onClick={handleOpenCallPanel}
              borderRadius="full"
              p={3}
              colorScheme="red"
            >
              <HStack>
                <MdCall size={20} />
                <Text>14:15</Text>
              </HStack>
            </IconButton>
            {/* <IconButton
              onClick={handleOpenMessagesPanel}
              borderRadius="full"
              color="red.500"
            >
              <BsRecordFill size={20} />
            </IconButton> */}
            <IconButton onClick={handleOpenMessagesPanel} borderRadius="full">
              <HiChatAlt2 size={20} />
            </IconButton>
          </>
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

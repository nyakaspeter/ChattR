import { Avatar } from '@chakra-ui/avatar';
import { IconButton } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
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
import { IoMdPeople } from 'react-icons/io';
import { MdCall, MdDelete, MdEdit } from 'react-icons/md';
import { useAuth } from '../../../core/api';
import CreateOrEditRoomModal from '../modals/CreateOrEditRoomModal';
import DeleteRoomModal from '../modals/DeleteRoomModal';
import LeaveRoomModal from '../modals/LeaveRoomModal';

const RoomHeader = props => {
  const { room, ...rest } = props;

  const user = useAuth();
  const own = user.data._id === room.owner;

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
          <Badge>
            {room.users.length} {room.users.length === 1 ? 'user' : 'users'}
          </Badge>
          <Badge colorScheme="green">{room.users.length} online</Badge>
        </VStack>
        <IconButton borderRadius="3xl">
          <MdCall size={20} />
        </IconButton>
        <IconButton borderRadius="3xl">
          <HiChatAlt2 size={20} />
        </IconButton>
        <IconButton borderRadius="3xl">
          <IoMdPeople size={20} />
        </IconButton>
        <Menu>
          <IconButton as={MenuButton} borderRadius="3xl" p={2.5}>
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

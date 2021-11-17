import { Avatar } from '@chakra-ui/avatar';
import { IconButton } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { Badge, Box, Circle, Heading, HStack, VStack } from '@chakra-ui/layout';
import { useBreakpointValue } from '@chakra-ui/media-query';
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

  const showUserCounts = useBreakpointValue({ base: false, sm: true });
  const showAllButtons = useBreakpointValue({ base: false, md: true });

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

  return (
    <Fade in>
      <HStack {...rest} p={3} spacing={3}>
        <Avatar
          name={room.name}
          src={room.image && `/api/room/${room._id}/image?id=${room.image}`}
          ml={!uiState.showRoomList.value && 14}
        />
        <Heading fontSize="2xl" noOfLines={1} wordBreak="break-all">
          {room.name}
        </Heading>
        <Box flex="1" />
        {showUserCounts && (
          <VStack spacing={1} alignItems="flex-end">
            <Badge>{room.users.length} users</Badge>
            <Badge colorScheme="green">
              {room.users.filter(u => u.online).length} online
            </Badge>
          </VStack>
        )}
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

        {showAllButtons && (
          <>
            {inCall && (
              <IconButton onClick={handleOpenMessagesPanel} borderRadius="full">
                <HiChatAlt2 size={20} />
              </IconButton>
            )}
            <Box position="relative">
              <IconButton onClick={handleOpenUsersPanel} borderRadius="full">
                <IoMdPeople size={20} />
              </IconButton>
              {room.usersWhoRequestedToJoin?.length > 0 && (
                <Circle
                  position="absolute"
                  right={0}
                  bottom={0}
                  size={3}
                  bg="red.500"
                  borderColor="red.300"
                  borderWidth={2}
                />
              )}
            </Box>
            <IconButton onClick={handleOpenDetailsPanel} borderRadius="full">
              <IoMdInformationCircle size={20} />
            </IconButton>{' '}
          </>
        )}
        <Menu>
          <IconButton as={MenuButton} borderRadius="full" p={2.5}>
            <BsThreeDots size={20} />
          </IconButton>
          <MenuList>
            {!showAllButtons && (
              <>
                {inCall && (
                  <MenuItem
                    onClick={handleOpenMessagesPanel}
                    icon={<HiChatAlt2 size={20} />}
                  >
                    Messages
                  </MenuItem>
                )}
                <MenuItem
                  onClick={handleOpenUsersPanel}
                  icon={<IoMdPeople size={20} />}
                >
                  Users
                </MenuItem>
                <MenuItem
                  onClick={handleOpenDetailsPanel}
                  icon={<IoMdInformationCircle size={20} />}
                >
                  Details
                </MenuItem>
              </>
            )}
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

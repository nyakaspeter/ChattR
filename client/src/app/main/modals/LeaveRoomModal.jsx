import { Button } from '@chakra-ui/button';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';
import { leaveRoom } from '../../../core/api';
import { roomKeys } from '../../../core/query';

const LeaveRoomModal = props => {
  const { isOpen, onClose, room } = props;

  const history = useHistory();
  const queryClient = useQueryClient();

  const leaveMutation = useMutation(() => leaveRoom(room._id), {
    onSuccess: () => {
      handleClose();

      queryClient.setQueryData(roomKeys.list(), old => ({
        rooms: old.rooms.filter(r => r._id !== room._id),
        pending: old.pending,
      }));

      queryClient.removeQueries(roomKeys.info(room._id));

      history.push('/');
    },
  });

  const handleMutate = () => leaveMutation.mutate();

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leave chat room</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to leave this room? You won't be able to access
          any messages or files until you rejoin.
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleMutate}
            isLoading={leaveMutation.isLoading}
            colorScheme="red"
            mr={3}
          >
            Leave
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LeaveRoomModal;

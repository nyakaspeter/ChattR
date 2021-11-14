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
import { deleteRoom } from '../../../core/api';
import { roomKeys } from '../../../core/query';

const DeleteRoomModal = props => {
  const { isOpen, onClose, room } = props;

  const history = useHistory();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(() => deleteRoom(room._id), {
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

  const handleMutate = () => deleteMutation.mutate();

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete chat room</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to delete this room? Every message, file and
          recording will be deleted forever.
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleMutate}
            isLoading={deleteMutation.isLoading}
            colorScheme="red"
            mr={3}
          >
            Delete
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteRoomModal;

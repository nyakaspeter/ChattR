import { Avatar } from '@chakra-ui/avatar';
import { Button } from '@chakra-ui/button';
import { FormControl, FormErrorMessage } from '@chakra-ui/form-control';
import { Input, InputRightElement } from '@chakra-ui/input';
import {
  Badge,
  Center,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/layout';
import { Fade } from '@chakra-ui/transition';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';
import { joinRoom, joinRoomCancel } from '../../../core/api';
import { roomKeys } from '../../../core/query';

const RoomJoin = props => {
  const { room, ...rest } = props;

  const history = useHistory();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);

  const joinMutation = useMutation(
    ({ roomId, password }) => joinRoom(roomId, { password }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(roomKeys.list());
        queryClient.invalidateQueries(roomKeys.info(room._id));
      },
      onError: () => {
        formik.errors.password = 'The password you entered is incorrect';
      },
    }
  );

  const cancelMutation = useMutation(roomId => joinRoomCancel(roomId), {
    onSuccess: () => {
      queryClient.invalidateQueries(roomKeys.list());
      queryClient.invalidateQueries(roomKeys.info(room._id));

      history.push('/');
    },
  });

  const formik = useFormik({
    initialValues: {
      roomId: room._id,
      password: '',
    },
    validate: values => {
      let errors = {};

      if (room.privacy === 'protected' && !values.password) {
        errors.password = 'The room password cannot be empty';
      }

      return errors;
    },
    onSubmit: values => joinMutation.mutate(values),
  });

  const handleCancel = () => {
    if (room.privacy === 'private' && room.status === 'requestedToJoin') {
      cancelMutation.mutate(room._id);
    } else {
      history.push('/');
    }
  };

  const message = () => {
    switch (room.privacy) {
      case 'public':
        return 'You have been invited to join this chat room.';
      case 'protected':
        return 'Please enter the password to join this chat room.';
      case 'private':
        if (room.status === 'notMember')
          return 'You can join this chat room after the owner accepts your request.';
        if (room.status === 'requestedToJoin')
          return 'Please wait until the room owner accepts your join request.';
    }
  };

  const buttonText = () => {
    switch (room.privacy) {
      case 'public':
      case 'protected':
        return 'Join this chat room';
      case 'private':
        return 'Request to join chat room';
    }
  };

  return (
    <Center {...rest} overflow="auto">
      <Fade in>
        <VStack spacing={10} m={20}>
          <VStack spacing={4}>
            <Avatar
              size="2xl"
              name={room.name}
              src={room.hasImage && `/api/room/${room._id}/image`}
            />
            <Heading fontSize="3xl">{room.name}</Heading>
            <HStack>
              <Badge>{room.userCount} users</Badge>
              <Badge colorScheme="green">{room.onlineUserCount} online</Badge>
            </HStack>
            {room.description && (
              <Text whiteSpace="pre-line">{room.description}</Text>
            )}
          </VStack>

          <VStack>
            <Text fontWeight="semibold">{message()}</Text>
            {room.privacy === 'protected' && (
              <FormControl
                isRequired
                isInvalid={formik.errors.password && formik.touched.password}
              >
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  name="password"
                  placeholder="Room password"
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem" p={1.5}>
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>
            )}
          </VStack>

          <VStack spacing={4}>
            {(room.privacy !== 'private' ||
              room.status !== 'requestedToJoin') && (
              <Button
                onClick={formik.handleSubmit}
                isLoading={joinMutation.isLoading}
                colorScheme="blue"
              >
                {buttonText()}
              </Button>
            )}
            <Button
              onClick={handleCancel}
              isLoading={cancelMutation.isLoading}
              colorScheme="red"
            >
              I don't want to join
            </Button>
          </VStack>
        </VStack>
      </Fade>
    </Center>
  );
};

export default RoomJoin;

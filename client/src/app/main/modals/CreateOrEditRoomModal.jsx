import { Avatar } from '@chakra-ui/avatar';
import { Button, IconButton } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { Box, HStack, Text, VStack } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Textarea } from '@chakra-ui/textarea';
import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { MdDelete, MdLock, MdPhotoCamera, MdPublic } from 'react-icons/md';
import { useMutation, useQueryClient } from 'react-query';
import { createRoom, updateRoom } from '../../../core/api';
import { roomKeys } from '../../../core/query';

const privacyOptions = {
  public: {
    displayName: 'Public',
    displayIcon: MdPublic,
    description: 'Everyone with the link can join',
  },

  protected: {
    displayName: 'Protected',
    displayIcon: MdLock,
    description: 'Only those who know the password can join',
  },

  private: {
    displayName: 'Private',
    displayIcon: FaUsers,
    description: 'Only allowed people can join',
  },
};

const CreateOrEditRoomModal = props => {
  const { isOpen, onClose, room } = props;
  const editing = !!room;
  const hasImage = editing && room.image;

  const initialImageUrl = hasImage ? `/api/room/${room._id}/image` : undefined;

  const avatarBgColor = useColorModeValue('gray.300', 'gray.600');
  const avatarOptionsBgColor = useColorModeValue(
    'whiteAlpha.600',
    'blackAlpha.600'
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    formValues => {
      const formData = Object.keys(formValues).reduce((formData, key) => {
        formData.append(key, formValues[key]);
        return formData;
      }, new FormData());

      return editing ? updateRoom(room._id, formData) : createRoom(formData);
    },
    {
      onSuccess: data => {
        if (editing) {
          // TODO?
        } else {
          const newRoom = {
            _id: data._id,
            name: data.name,
            image: data.image,
            owner: data.owner,
            lastMessage: null,
            lastActivity: data.lastActivity,
          };

          queryClient.setQueryData(roomKeys.list(), old => ({
            rooms: [...old.rooms, newRoom],
            pending: old.pending,
          }));
        }

        handleClose();
      },
    }
  );

  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const imageInput = useRef();
  const imageUrl = useRef(initialImageUrl);

  const formik = useFormik({
    initialValues: {
      image: hasImage ? 'unchanged' : null,
      name: editing ? room.name : '',
      description: editing ? room.description : '',
      privacy: editing ? room.privacy : 'public',
      password: editing ? room.password : '',
    },
    validate: values => {
      let errors = {};

      if (!values.name) {
        errors.name = 'The room must have a name';
      } else if (values.name.length > 100) {
        errors.name = 'The room name cannot be longer than 100 characters';
      }

      if (values.description.length > 300) {
        errors.description =
          'The room description cannot be longer than 300 characters';
      }

      if (values.privacy === 'protected') {
        if (!values.password) {
          errors.password = 'Protected rooms must have a password';
        } else if (values.password.length > 100) {
          errors.password =
            'The room password cannot be longer than 100 characters';
        }
      }

      return errors;
    },
    onSubmit: values => mutation.mutate(values),
  });

  const handleBrowseImage = () => {
    imageInput.current?.click();
  };

  const handleChooseImage = event => {
    formik.setFieldValue('image', event.target.files[0]);

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl.current);
    }
    imageUrl.current = URL.createObjectURL(event.target.files[0]);

    imageInput.current.value = null;
  };

  const handleUnselectImage = () => {
    formik.setFieldValue('image', null);
    imageUrl.current = undefined;
  };

  const handleClose = () => {
    formik.resetForm();
    imageUrl.current = initialImageUrl;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`${editing ? 'Edit' : 'Create'} chat room`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} alignItems="stretch">
            <Box
              alignSelf="center"
              position="relative"
              onMouseEnter={() => setShowAvatarOptions(true)}
              onMouseLeave={() => setShowAvatarOptions(false)}
            >
              <Avatar
                size="2xl"
                name={formik.values.name}
                bg={avatarBgColor}
                color="white"
                src={imageUrl.current}
              />
              <input
                ref={imageInput}
                type="file"
                accept="image/png, image/jpeg"
                hidden
                onChange={handleChooseImage}
              />
              {showAvatarOptions && (
                <HStack
                  position="absolute"
                  top={0}
                  left={0}
                  spacing={3}
                  w="100%"
                  h="100%"
                  bg={avatarOptionsBgColor}
                  borderRadius="full"
                  justifySelf="center"
                  justifyContent="center"
                >
                  <IconButton
                    borderRadius="full"
                    colorScheme="blue"
                    onClick={handleBrowseImage}
                  >
                    <MdPhotoCamera fontSize={24} />
                  </IconButton>
                  {formik.values.image && (
                    <IconButton
                      borderRadius="full"
                      colorScheme="red"
                      onClick={handleUnselectImage}
                    >
                      <MdDelete fontSize={24} />
                    </IconButton>
                  )}
                </HStack>
              )}
            </Box>
            <FormControl
              isRequired
              isInvalid={formik.errors.name && formik.touched.name}
            >
              <FormLabel>Room name</FormLabel>
              <Input
                value={formik.values.name}
                name="name"
                onChange={formik.handleChange}
              />
              <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl
              isInvalid={
                formik.errors.description && formik.touched.description
              }
            >
              <FormLabel>Room description</FormLabel>
              <Textarea
                value={formik.values.description}
                name="description"
                onChange={formik.handleChange}
              />
              <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
            </FormControl>
            <HStack spacing={4}>
              {Object.keys(privacyOptions).map(key => {
                const selected = key === formik.values.privacy;
                const option = privacyOptions[key];

                return (
                  <Button
                    key={key}
                    flex="1"
                    h="100%"
                    colorScheme={selected ? 'blue' : undefined}
                    onClick={() => formik.setFieldValue('privacy', key)}
                  >
                    <VStack p={4}>
                      <option.displayIcon size={40} />
                      <Text>{option.displayName}</Text>
                    </VStack>
                  </Button>
                );
              })}
            </HStack>
            <Text>{privacyOptions[formik.values.privacy].description}</Text>
            {formik.values.privacy === 'protected' && (
              <FormControl
                isRequired
                isInvalid={formik.errors.password && formik.touched.password}
              >
                <FormLabel>Room password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    name="password"
                    onChange={formik.handleChange}
                    pr="4.5rem"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  Please choose a password that you don't use anywhere else!
                </FormHelperText>
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={formik.handleSubmit}
            isLoading={mutation.isLoading}
            colorScheme="blue"
            mr={3}
          >
            {editing ? 'Save' : 'Create'}
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateOrEditRoomModal;

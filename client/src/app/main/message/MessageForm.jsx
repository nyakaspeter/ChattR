import { Button, IconButton } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { ChatIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/layout';
import { Textarea } from '@chakra-ui/textarea';
import { Fade } from '@chakra-ui/transition';
import { useFormik } from 'formik';
import React, { useRef } from 'react';
import { BiSend } from 'react-icons/bi';
import { FaRegFile } from 'react-icons/fa';
import { MdAttachFile } from 'react-icons/md';
import { useMutation } from 'react-query';
import ResizeTextarea from 'react-textarea-autosize';
import { sendMessage } from '../../../core/api';

const MessageForm = props => {
  const { room, ...rest } = props;

  const fileBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const fileInput = useRef();

  const sendMutation = useMutation(
    formValues => {
      const trimmedText = formValues.text.trim();
      const formData = new FormData();
      formValues.files.forEach(file => formData.append('files', file));
      if (trimmedText) formData.append('text', trimmedText);

      return sendMessage(room._id, formData);
    },
    {
      onError: async (error, formValues) => {
        await formik.setValues(formValues);
        formik.setFieldError('text', 'Remote request failed');
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      text: '',
      files: [],
    },
    validate: values => {
      let errors = {};

      if (!values.text.trim() && values.files.length === 0) {
        errors.text = 'You cannot send an empty message';
      }

      return errors;
    },
    onSubmit: values => {
      sendMutation.mutate(values);
      formik.resetForm();
    },
  });

  const handleTextInput = event => {
    if (event.target.value === '' || event.target.value.trim()) {
      formik.handleChange(event);
    }
  };

  const handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      formik.submitForm();
    }
  };

  const handleOnBlur = () => {
    if (formik.errors.text !== 'Remote request failed') {
      formik.setFieldError('text', '');
    }
  };

  const handleBrowseFiles = () => {
    fileInput.current?.click();
  };

  const handleChooseFiles = event => {
    const pickedFiles = [...event.target.files];

    const addedFiles = pickedFiles.filter(
      f => !formik.values.files.find(file => file.name === f.name)
    );

    const newFiles = [...formik.values.files, ...addedFiles];
    newFiles.sort((a, b) => a.name.localeCompare(b.name));

    formik.setFieldValue('files', newFiles);
    fileInput.current.value = null;
  };

  const handleUnselectFile = file => {
    formik.setFieldValue(
      'files',
      formik.values.files.filter(f => f !== file) || []
    );
  };

  return (
    <Fade in>
      <VStack {...rest} p={2} alignItems="stretch">
        <Box position="relative">
          <Textarea
            name="text"
            value={formik.values.text}
            onChange={handleTextInput}
            onKeyDown={handleKeyDown}
            onBlur={handleOnBlur}
            isInvalid={formik.errors.text}
            placeholder="Write a message"
            variant="filled"
            borderRadius="3xl"
            pl={10}
            pr={20}
            minH="unset"
            minRows={1}
            maxRows={20}
            resize="none"
            as={ResizeTextarea}
          />
          <Center position="absolute" left={0} top={0} h="100%" w={10}>
            <ChatIcon color="gray.500" />
          </Center>
          <Center>
            <HStack position="absolute" right={1} top={0} h="100%" spacing={2}>
              <IconButton
                onClick={handleBrowseFiles}
                size="sm"
                color="gray.500"
                bg="transparent"
                borderRadius="full"
                pointerEvents="auto"
              >
                <MdAttachFile size={24} />
              </IconButton>
              <IconButton
                onClick={formik.handleSubmit}
                isLoading={sendMutation.isLoading}
                size="sm"
                color="gray.500"
                bg="transparent"
                borderRadius="full"
              >
                <BiSend size={24} />
              </IconButton>
            </HStack>
          </Center>
        </Box>
        <input
          ref={fileInput}
          type="file"
          hidden
          multiple
          onChange={handleChooseFiles}
        />
        {formik.values.files.length > 0 && (
          <SimpleGrid
            minChildWidth={200}
            maxH={204}
            spacingX={2}
            spacingY={2}
            overflowY="auto"
            overflowX="hidden"
          >
            {formik.values.files.map(file => (
              <HStack
                key={file.name}
                p={2.5}
                bg={fileBg}
                borderRadius="md"
                flex="1"
              >
                <FaRegFile size={20} />
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  noOfLines="1"
                  wordBreak="break-all"
                  textOverflow="ellipsis"
                  flex="1"
                >
                  {file.name}
                </Text>
                <Button
                  size="xs"
                  borderRadius="full"
                  colorScheme="red"
                  p={0}
                  onClick={() => handleUnselectFile(file)}
                >
                  <CloseIcon fontSize={10} />
                </Button>
              </HStack>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Fade>
  );
};

export default MessageForm;

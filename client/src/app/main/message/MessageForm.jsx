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
import React, { useRef, useState } from 'react';
import { BiSend } from 'react-icons/bi';
import { FaRegFile } from 'react-icons/fa';
import { MdAttachFile } from 'react-icons/md';
import ResizeTextarea from 'react-textarea-autosize';
import { sendMessage } from '../../../core/api';

const MessageForm = props => {
  const { room, ...rest } = props;

  const fileBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');

  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const fileInput = useRef();

  const handleBrowseFiles = () => {
    fileInput.current?.click();
  };

  const handleChooseFiles = event => {
    const pickedFiles = [...event.target.files];

    const addedFiles = pickedFiles.filter(
      f => !files.find(file => file.name === f.name)
    );

    const newFiles = [...files, ...addedFiles];
    newFiles.sort((a, b) => a.name.localeCompare(b.name));

    setFiles(newFiles);

    fileInput.current.value = null;
  };

  const handleUnselectFile = file => {
    setFiles(files.filter(f => f !== file) || []);
  };

  const handleTextInput = event => {
    if (event.target.value === '' || event.target.value.trim()) {
      setText(event.target.value);
    }
  };

  const handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('text', trimmedText);

    sendMessage(room._id, formData);

    setText('');
    setFiles([]);
  };

  return (
    <Fade in>
      <VStack {...rest} p={2} alignItems="stretch">
        <Box position="relative">
          <Textarea
            value={text}
            onChange={handleTextInput}
            onKeyDown={handleKeyDown}
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
            <HStack position="absolute" right={0} top={0} h="100%" spacing={1}>
              <IconButton
                onClick={handleBrowseFiles}
                color="gray.500"
                bg="transparent"
                borderRadius="3xl"
              >
                <MdAttachFile size={24} />
              </IconButton>
              <IconButton
                onClick={handleSendMessage}
                color="gray.500"
                bg="transparent"
                borderRadius="3xl"
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
        {files.length > 0 && (
          <SimpleGrid
            minChildWidth={200}
            maxH={204}
            spacingX={2}
            spacingY={2}
            overflowY="auto"
            overflowX="hidden"
          >
            {files.map((file, i) => (
              <Button
                position="relative"
                key={i}
                bg={fileBg}
                p={3}
                borderRadius="md"
                flex="1"
              >
                <IconButton
                  position="absolute"
                  top={0}
                  right={0}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleUnselectFile(file)}
                >
                  <CloseIcon fontSize="xs" />
                </IconButton>
                <HStack maxW="100%">
                  <FaRegFile size={20} />
                  <Text fontSize="sm" isTruncated>
                    {file.name}
                  </Text>
                </HStack>
              </Button>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Fade>
  );
};

export default MessageForm;

import { IconButton } from '@chakra-ui/button';
import { CloseIcon } from '@chakra-ui/icons';
import { Box, Heading, HStack, VStack } from '@chakra-ui/layout';
import React from 'react';
import { useUiState } from '../../../core/store';

const SidePanel = props => {
  const { title, content: Content, room, ...rest } = props;

  const uiState = useUiState();
  const handleClose = () => uiState.currentPanel.set(null);

  return (
    <VStack {...rest} spacing={0} alignItems="stretch">
      <HStack p={4}>
        <Heading fontSize="2xl">{title}</Heading>
        <Box flex="1" />
        <IconButton onClick={handleClose} borderRadius="full">
          <CloseIcon />
        </IconButton>
      </HStack>
      {Content && <Content room={room} flex="1" />}
    </VStack>
  );
};

export default SidePanel;

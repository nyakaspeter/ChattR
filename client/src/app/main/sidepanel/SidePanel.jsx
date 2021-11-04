import { Avatar } from '@chakra-ui/avatar';
import { IconButton } from '@chakra-ui/button';
import { CloseIcon } from '@chakra-ui/icons';
import { Badge, Box, Heading, HStack, Text, VStack } from '@chakra-ui/layout';

const SidePanel = props => {
  const { title, content, room, onClose, ...rest } = props;

  return (
    <VStack {...rest} spacing={0} alignItems="stretch">
      <HStack p={4}>
        <Heading fontSize="2xl">{title}</Heading>
        <Box flex="1" />
        <IconButton onClick={onClose} borderRadius="full">
          <CloseIcon />
        </IconButton>
      </HStack>
      {content}
    </VStack>
  );
};

export default SidePanel;

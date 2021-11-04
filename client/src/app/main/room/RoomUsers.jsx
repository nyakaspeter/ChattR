import { Avatar, AvatarBadge } from '@chakra-ui/avatar';
import { Badge, Heading, HStack, Text, VStack } from '@chakra-ui/layout';

const RoomUsers = props => {
  const { room, ...rest } = props;

  return (
    <VStack px={3} py={1} spacing={3} alignItems="stretch" {...rest}>
      {room.users.map(user => (
        <HStack key={user._id} spacing={3}>
          <Avatar name={user.name} src={user.picture}>
            {user.online && <AvatarBadge boxSize={4} bg="green.400" />}
          </Avatar>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" noOfLines="1" wordBreak="break-all">
              {user.name}
            </Text>
            <Text fontSize="sm" noOfLines="1" wordBreak="break-all">
              {user.email}
            </Text>
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
};

export default RoomUsers;

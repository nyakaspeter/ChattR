import { Avatar } from '@chakra-ui/avatar';
import { Badge, Heading, HStack, Text, VStack } from '@chakra-ui/layout';

const RoomDetails = props => {
  const { room, ...rest } = props;

  return (
    <VStack p={3} spacing={4} {...rest}>
      <Avatar
        size="2xl"
        name={room.name}
        src={room.image && `/api/room/${room._id}/image`}
      />
      <Heading fontSize="3xl">{room.name}</Heading>
      <HStack>
        <Badge>{room.users.length} users</Badge>
        <Badge colorScheme="green">
          {room.users.filter(u => u.online).length} online
        </Badge>
      </HStack>
      {room.description && (
        <Text whiteSpace="pre-line">{room.description}</Text>
      )}
    </VStack>
  );
};

export default RoomDetails;

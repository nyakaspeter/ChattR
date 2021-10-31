import { chakra, useColorModeValue } from '@chakra-ui/system';
import { Link as RouterLink } from 'react-router-dom';

const Link = props => (
  <chakra.a
    as={RouterLink}
    to="#"
    marginStart="1"
    color={useColorModeValue('blue.500', 'blue.200')}
    _hover={{
      color: useColorModeValue('blue.600', 'blue.300'),
    }}
    display={{
      base: 'block',
      sm: 'inline',
    }}
    {...props}
  />
);

export default Link;

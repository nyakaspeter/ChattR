import {
  Button,
  chakra,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from '@chakra-ui/react';
import PasswordField from './PasswordField';

const LoginForm = props => (
  <chakra.form
    onSubmit={e => {
      e.preventDefault(); // your login logic here
    }}
    {...props}
  >
    <Stack spacing="6">
      <FormControl id="email">
        <FormLabel>Email address</FormLabel>
        <Input name="email" type="email" autoComplete="email" required />
      </FormControl>
      <PasswordField />
      <Button type="submit" colorScheme="blue" size="lg" fontSize="md">
        Sign in
      </Button>
    </Stack>
  </chakra.form>
);

export default LoginForm;
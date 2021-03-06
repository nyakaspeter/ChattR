import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import React from 'react';
import { FaFacebook, FaGithub, FaGoogle } from 'react-icons/fa';
import Card from './Card';
import DividerWithText from './DividerWithText';
import Link from './Link';
import LoginForm from './LoginForm';

const Login = () => (
  <Box
    bg={useColorModeValue('gray.50', 'inherit')}
    minH="100vh"
    py="12"
    px={{
      base: '4',
      lg: '8',
    }}
  >
    <Box maxW="md" mx="auto">
      <Heading
        textAlign="center"
        size="xl"
        fontWeight="extrabold"
        bgGradient="linear(to-l, #7928CA, #FF0080)"
        bgClip="text"
      >
        Welcome to ChattR!
      </Heading>
      <Card marginY={12}>
        <LoginForm />
        <DividerWithText mt="6">or continue with</DividerWithText>
        <SimpleGrid mt="6" columns={3} spacing="3">
          <Button color="currentColor" variant="outline">
            <VisuallyHidden>Login with Facebook</VisuallyHidden>
            <FaFacebook />
          </Button>

          <Button
            as="a"
            href="/auth/google"
            color="currentColor"
            variant="outline"
          >
            <VisuallyHidden>Login with Google</VisuallyHidden>
            <FaGoogle />
          </Button>

          <Button color="currentColor" variant="outline">
            <VisuallyHidden>Login with Github</VisuallyHidden>
            <FaGithub />
          </Button>
        </SimpleGrid>
      </Card>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Don&apos;t have an account?</Text>
        <Link to="/register">Register here</Link>
      </Text>
    </Box>
  </Box>
);

export default Login;

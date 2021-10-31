import { Center } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import React from 'react';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { useAuth } from '../core/api';
import Login from './login/Login';
import Main from './main/Main';
import Register from './register/Register';

const App = () => {
  const user = useAuth();

  if (user.isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (user.isError) {
    return (
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route path="/">
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/r/:roomId?" component={Main} />
      <Route path="/">
        <Redirect to="/r" />
      </Route>
    </Switch>
  );
};

export default App;

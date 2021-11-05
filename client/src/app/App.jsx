import React from 'react';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { useUser } from '../core/api';
import Login from './login/Login';
import Main from './main/Main';
import Register from './register/Register';

const App = () => {
  const user = useUser();

  if (user.isLoading) {
    return <Loading fullscreen />;
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

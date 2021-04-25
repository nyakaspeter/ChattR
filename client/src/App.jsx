import { Box } from "@material-ui/core";
import { useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Login from "./Login";
import Main from "./Main";
import Menubar from "./Menubar";
import UserProvider from "./UserProvider";

const App = () => {
  const user = useContext(UserProvider.context);

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Menubar />
      {user ? (
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/">
            <Redirect to="/" />
          </Route>
        </Switch>
      ) : (
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/">
            <Redirect to="/" />
          </Route>
        </Switch>
      )}
    </Box>
  );
};

export default App;

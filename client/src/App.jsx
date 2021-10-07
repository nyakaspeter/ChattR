import { useHookstate } from "@hookstate/core";
import { Box, CssBaseline } from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import AuthRoute from "./components/AuthRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./Home";
import Login from "./Login";
import Menubar from "./Menubar";
import { userState } from "./Store";

const App = () => {
  const user = useHookstate(userState);
  const userLoaded = useHookstate(false);

  useEffect(() => {
    async function fetchUserData() {
      let userData = null;
      try {
        userData = (await axios.get("/api/user", { withCredentials: true })).data;
      } catch (err) {
        console.error(err);
      }

      user.set(userData);
      userLoaded.set(true);
    }

    fetchUserData();
  }, []);

  return (
    <BrowserRouter>
      <CssBaseline>
        {userLoaded.get() && (
          <Box display="flex" flexDirection="column" height="100vh">
            <Menubar />
            <Switch>
              <AuthRoute exact path="/login" component={Login} />
              <ProtectedRoute exact path="/" component={Home} />
              <Route path="/">
                <Redirect to="/" />
              </Route>
            </Switch>
          </Box>
        )}
      </CssBaseline>
    </BrowserRouter>
  );
};

export default App;

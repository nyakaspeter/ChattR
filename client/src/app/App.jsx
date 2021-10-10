import { useHookstate } from "@hookstate/core";
import { Box, CssBaseline } from "@mui/material";
import { useEffect } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import AuthRoute from "../components/AuthRoute";
import Menubar from "../components/Menubar";
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../core/api";
import { globalStore } from "../core/store";
import Home from "./home/Home";
import Login from "./login/Login";
import Room from "./room/Room";

const App = () => {
  const store = useHookstate(globalStore);
  const loading = useHookstate(true);
  const error = useHookstate(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        store.user.set((await api.get(`user`)).data);
        loading.set(false);
      } catch (err) {
        store.user.set(null);
        loading.set(false);
        if (err.response.status !== 401) error.set(true);
      }
    }

    fetchUserData();
  }, []);

  if (loading.get()) return <>Loading...</>;
  if (error.get()) return <>Error!</>;
  return (
    <BrowserRouter>
      <CssBaseline>
        <Box display="flex" flexDirection="column" height="100vh">
          <Menubar />
          <Switch>
            <AuthRoute exact path="/login" component={Login} />
            <ProtectedRoute exact path="/" component={Home} />
            <ProtectedRoute path="/room/:roomId" component={Room} />
            <Route path="/">
              <Redirect to="/" />
            </Route>
          </Switch>
        </Box>
      </CssBaseline>
    </BrowserRouter>
  );
};

export default App;

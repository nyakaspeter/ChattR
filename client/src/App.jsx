import {
  AppBar,
  Avatar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("profile")));

  const onLoginSuccess = async (res) => {
    const result = res?.profileObj;
    const token = res?.tokenId;

    try {
      localStorage.setItem("profile", JSON.stringify({ result, token }));
      setUser(JSON.parse(localStorage.getItem("profile")));
    } catch (error) {
      console.log(error);
    }
  };

  const onLoginFailure = (error) => {
    localStorage.removeItem("profile");
    setUser(null);
  };

  const onLogoutSuccess = () => {
    localStorage.removeItem("profile");
    setUser(null);
  };

  return (
    <CssBaseline>
      <AppBar position="static">
        <Toolbar>
          <Box
            display="flex"
            flexGrow="1"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">WebRTC Video Conference</Typography>

            {user ? (
              <Box display="flex" alignItems="center">
                <Avatar
                  style={{ marginRight: 16 }}
                  src={user.result.imageUrl}
                />
                <Typography style={{ marginRight: 16 }}>
                  {user.result.name}
                </Typography>
                <GoogleLogout
                  clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
                  onLogoutSuccess={onLogoutSuccess}
                />
              </Box>
            ) : (
              <GoogleLogin
                clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
                onSuccess={onLoginSuccess}
                onFailure={onLoginFailure}
                cookiePolicy="single_host_origin"
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container>{!user ? <Box></Box> : <Box></Box>}</Container>
    </CssBaseline>
  );
};

export default App;

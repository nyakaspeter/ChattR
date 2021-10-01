import { ExitToApp } from "@mui/icons-material";
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { useContext } from "react";
import UserProvider from "./UserProvider";

const Menubar = () => {
  const user = useContext(UserProvider.context);

  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" flexGrow="1" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">WebRTC Video Conference</Typography>

          {user ? (
            <Box display="flex" alignItems="center">
              <Avatar style={{ marginRight: 16 }} src={user.picture} />
              <Typography style={{ marginRight: 16 }}>{user.name}</Typography>
              <IconButton href="/logout" size="large">
                <ExitToApp style={{ color: "white" }} />
              </IconButton>
            </Box>
          ) : (
            <></>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Menubar;

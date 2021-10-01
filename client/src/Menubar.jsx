import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
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
              <IconButton href="/logout">
                <ExitToAppIcon style={{ color: "white" }} />
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

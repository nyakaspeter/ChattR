import { useHookstate } from "@hookstate/core";
import { ExitToApp } from "@mui/icons-material";
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { userState } from "./Store";

const Menubar = () => {
  const user = useHookstate(userState);

  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" flexGrow="1" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">WebRTC Video Conference</Typography>

          {user.get() ? (
            <Box display="flex" alignItems="center">
              <Avatar style={{ marginRight: 16 }} src={user.get().picture} />
              <Typography style={{ marginRight: 16 }}>{user.get().name}</Typography>
              <IconButton href="/auth/logout" size="large">
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

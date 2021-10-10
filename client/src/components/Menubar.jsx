import { useHookstate } from "@hookstate/core";
import { ExitToApp } from "@mui/icons-material";
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { globalStore } from "../core/store";

const Menubar = () => {
  const store = useHookstate(globalStore);
  const authenticated = store.user.get() !== null;

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box display="flex" flexGrow="1" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">WebRTC Video Conference</Typography>

          {authenticated && (
            <Box display="flex" alignItems="center">
              <Avatar style={{ marginRight: 16 }} src={store.user.picture.get()} />
              <Typography style={{ marginRight: 16 }}>{store.user.name.get()}</Typography>
              <IconButton href="/auth/logout" size="large">
                <ExitToApp style={{ color: "white" }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Menubar;

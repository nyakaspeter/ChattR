import { Downgraded, useHookstate } from "@hookstate/core";
import { Avatar, Badge, Box, Stack, Typography } from "@mui/material";
import { globalStore } from "../../../core/store";

const Users = (props) => {
  const store = useHookstate(globalStore);

  return (
    <Box display="flex" flexDirection="column">
      <Stack height="600px" spacing={1}>
        {store.room.users.get().map((user, idx) => {
          const avatar = <Avatar src={user.picture} referrerPolicy="no-referrer" />;
          const online = store.onlineUsers.attach(Downgraded).get().indexOf(user._id) !== -1;
          return (
            <Stack key={idx} direction="row" alignItems="center" spacing={1}>
              {online ? (
                <Badge
                  children={avatar}
                  overlap="circular"
                  variant="dot"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#44b700",
                      color: "#44b700",
                      "&::after": {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        animation: "ripple 1.2s infinite ease-in-out",
                        border: "1px solid currentColor",
                        content: '""',
                      },
                    },
                    "@keyframes ripple": {
                      "0%": {
                        transform: "scale(.8)",
                        opacity: 1,
                      },
                      "100%": {
                        transform: "scale(2.4)",
                        opacity: 0,
                      },
                    },
                  }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                />
              ) : (
                avatar
              )}
              <Typography>{user.name}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Users;

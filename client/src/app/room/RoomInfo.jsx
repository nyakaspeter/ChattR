import { useHookstate } from "@hookstate/core";
import { ArrowBack } from "@mui/icons-material";
import { Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Link, useHistory } from "react-router-dom";
import { api } from "../../core/api";
import { globalStore } from "../../core/store";

const RoomInfo = (props) => {
  const history = useHistory();
  const store = useHookstate(globalStore);
  const roomNameInput = useHookstate(store.room.name.get());
  const roomOwned = store.room.owner.get() === store.user._id.get();

  const updateRoom = async () => {
    await api.post(`room/${store.room._id.get()}/update`, { name: roomNameInput.get() });
  };

  const leaveRoom = async () => {
    await api.get(`room/${store.room._id.get()}/leave`);
    history.push("/");
  };

  const deleteRoom = async () => {
    await api.get(`room/${store.room._id.get()}/delete`);
  };

  return (
    <Stack direction="row">
      <IconButton component={Link} to="/">
        <ArrowBack />
      </IconButton>
      <Box flex="1" display="flex" flexDirection="column">
        <Typography variant="h5">{store.room.name.get() + (roomOwned ? " 👑" : "")}</Typography>
        <Typography variant="subtitle2">{store.room._id.get()}</Typography>
      </Box>

      {roomOwned && (
        <Box display="flex">
          <TextField
            variant="outlined"
            label="Room name"
            value={roomNameInput.get()}
            onChange={(e) => roomNameInput.set(e.target.value)}
          />
          <Button onClick={updateRoom} variant="outlined">
            Save
          </Button>
          <Button onClick={deleteRoom} variant="outlined">
            Delete
          </Button>
          {/* {recording.get() ? (
            <Button onClick={stopRecording} variant="outlined">
              Stop recording
            </Button>
          ) : (
            <Button onClick={startRecording} variant="outlined">
              Record
            </Button>
          )} */}
        </Box>
      )}

      <Button onClick={leaveRoom} variant="outlined">
        Leave
      </Button>
    </Stack>
  );
};

export default RoomInfo;

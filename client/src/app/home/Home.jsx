import { useHookstate } from "@hookstate/core";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../core/api";
import { globalStore } from "../../core/store";

const Home = () => {
  const store = useHookstate(globalStore);
  const loading = useHookstate(true);
  const error = useHookstate(false);
  const newRoomNameInput = useHookstate("");
  const joinRoomIdInput = useHookstate("");

  function joinRoom(roomId) {
    api.get(`room/${roomId}/enter`).then((res) => store.rooms.merge([res.data]));
  }

  function createNewRoom() {
    const newRoom = { name: newRoomNameInput.get() };
    api.post("room/create", newRoom).then((res) => store.rooms.merge([res.data]));
  }

  useEffect(() => {
    async function fetchRooms() {
      try {
        store.rooms.set((await api.get(`rooms`)).data);
        loading.set(false);
      } catch (err) {
        store.rooms.set([]);
        loading.set(false);
        error.set(true);
      }
    }

    fetchRooms();
  }, []);

  if (loading.get()) return <>Loading...</>;
  if (error.get()) return <>Error!</>;
  return (
    <Box flex="1" m={1} display="flex">
      <Box flex="1" display="flex" flexDirection="column">
        <Typography variant="h5">Create room</Typography>
        <Box my={1} display="flex">
          <TextField
            fullWidth
            variant="outlined"
            label="Room name"
            value={newRoomNameInput.get()}
            onChange={(e) => newRoomNameInput.set(e.target.value)}
          />
          <Button onClick={createNewRoom} variant="outlined">
            Create
          </Button>
        </Box>

        <Typography variant="h5">Join room</Typography>
        <Box my={1} display="flex">
          <TextField
            fullWidth
            variant="outlined"
            label="Room ID"
            value={joinRoomIdInput.get()}
            onChange={(e) => joinRoomIdInput.set(e.target.value)}
          />
          <Button onClick={() => joinRoom(joinRoomIdInput.get())} variant="outlined">
            Join
          </Button>
        </Box>

        <Typography variant="h5">My rooms</Typography>
        <Box my={1} display="flex" flexDirection="column">
          {store.rooms.get().map((room, idx) => {
            const roomOwned = room.owner === store.user._id.get();
            return (
              <Box my={1} key={idx}>
                <Link to={`room/${room._id}`}>{room.name + (roomOwned ? " 👑" : "")}</Link>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;

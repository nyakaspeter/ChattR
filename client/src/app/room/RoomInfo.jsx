import { useHookstate } from "@hookstate/core";
import { Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { globalStore } from "../../core/store";

const RoomInfo = (props) => {
  const store = useHookstate(globalStore);
  const roomNameInput = useHookstate(store.room.name.get());
  const roomOwned = store.room.owner.get() === store.user._id.get();

  const editRoom = () => {
    // Axios.put(`/api/room/${room.get()._id}`, { name: roomNameInput.get() })
    //   .then((res) => {
    //     room.set(res.data);
    //     setRooms(
    //       rooms.map((room) => {
    //         if (room._id === res.data._id) return res.data;
    //         else return room;
    //       })
    //     );
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  };

  const leaveRoom = (roomId) => {
    // disconnectFromRoom();
    // Axios.get(`/api/room/${roomId}/leave`)
    //   .then((res) => setRooms(rooms.filter((room) => room._id !== roomId)))
    //   .catch((err) => {
    //     console.error(err);
    //   });
  };

  const deleteRoom = () => {
    // Axios.delete(`/api/room/${room.get()._id}`).then((res) => {
    //   setRooms(rooms.filter((room) => room._id !== room.get()._id));
    //   setConnectedRoom(null);
    // });
  };

  return (
    <Box display="flex">
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
          <Button onClick={editRoom} variant="outlined">
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

      <Button onClick={() => leaveRoom(store.room._id.get())} variant="outlined">
        Leave
      </Button>

      {/* <Button onClick={disconnectFromRoom} variant="outlined">
        Disconnect
      </Button> */}
    </Box>
  );
};

export default RoomInfo;

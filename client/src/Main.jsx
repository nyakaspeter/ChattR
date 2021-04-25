import { Avatar, Box, Button, TextField, Typography } from "@material-ui/core";
import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import UserProvider from "./UserProvider";

const Main = () => {
  const user = useContext(UserProvider.context);

  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [connectedRoom, setConnectedRoom] = useState(null);
  const [connectedRoomOwned, setConnectedRoomOwned] = useState(false);
  const [editedRoomName, setEditedRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    getRooms();
  }, []);

  const createNewRoom = () => {
    const newRoom = { name: newRoomName };

    Axios.post("/api/room", newRoom)
      .then((res) => {
        const newRoom = res.data;
        setRooms([...rooms, newRoom]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRooms = () => {
    Axios.get("/api/room")
      .then((res) => {
        const rooms = res.data;
        setRooms(rooms);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const joinRoom = (roomId) => {
    Axios.get(`/api/room/${roomId}/join`)
      .then((res) => {
        const room = res.data;
        setRooms([...rooms, room]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const leaveRoom = (roomId) => {
    disconnectFromRoom();
    Axios.get(`/api/room/${roomId}/leave`)
      .then((res) => setRooms(rooms.filter((room) => room._id !== roomId)))
      .catch((err) => {
        console.log(err);
      });
  };

  const editRoom = () => {
    Axios.put(`/api/room/${connectedRoom._id}`, { name: editedRoomName })
      .then((res) => {
        setConnectedRoom(res.data);
        setRooms(
          rooms.map((room) => {
            if (room._id === res.data._id) return res.data;
            else return room;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteRoom = () => {
    Axios.delete(`/api/room/${connectedRoom._id}`).then((res) => {
      setRooms(rooms.filter((room) => room._id !== connectedRoom._id));
      setConnectedRoom(null);
    });
  };

  const connectToRoom = (roomId) => {
    Axios.get(`/api/room/${roomId}/join`)
      .then((res) => {
        const room = res.data;
        setConnectedRoom(room);
        setConnectedRoomOwned(room.owner === user._id);
        setEditedRoomName(room.name);
        setMessageText("");
      })
      .catch((err) => {
        console.log(err);
        setConnectedRoom(null);
      });
  };

  const disconnectFromRoom = () => {
    setConnectedRoom(null);
  };

  const sendMessage = () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("text", messageText);

    Axios.post(`/api/room/${connectedRoom._id}/message`, formData)
      .then((res) => {
        const newMessage = res.data;

        setConnectedRoom({
          ...connectedRoom,
          messages: [...connectedRoom.messages, newMessage],
        });
        setMessageText("");
        setSelectedFiles([]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Box height="100%" display="flex">
      <Box flex="1" m={2} display="flex">
        <Box flex="1" display="flex" flexDirection="column">
          <Typography variant="h5">Create room</Typography>
          <Box my={2} display="flex">
            <TextField
              fullWidth
              variant="outlined"
              label="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <Button onClick={createNewRoom} variant="outlined">
              Create
            </Button>
          </Box>

          <Typography variant="h5">Join room</Typography>
          <Box my={2} display="flex">
            <TextField
              fullWidth
              variant="outlined"
              label="Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <Button onClick={() => joinRoom(joinRoomId)} variant="outlined">
              Join
            </Button>
          </Box>

          <Typography variant="h5">My rooms</Typography>
          <Box my={1} display="flex" flexDirection="column">
            {rooms.map((room) => (
              <Box my={1} key={room._id}>
                <Button
                  style={{ justifyContent: "flex-start" }}
                  fullWidth
                  variant="outlined"
                  onClick={() => connectToRoom(room._id)}
                >
                  {room.name + (room.owner === user._id ? " 👑" : "")}
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box flex="3" my={2} display="flex">
        {connectedRoom && (
          <Box flex="1" display="flex" flexDirection="column">
            <Box display="flex">
              <Box flex="1" display="flex" flexDirection="column">
                <Typography variant="h5">
                  {connectedRoom.name + (connectedRoomOwned ? " 👑" : "")}
                </Typography>
                <Typography variant="subtitle2">{connectedRoom._id}</Typography>
              </Box>

              {connectedRoomOwned && (
                <Box display="flex">
                  <TextField
                    variant="outlined"
                    label="Room name"
                    value={editedRoomName}
                    onChange={(e) => setEditedRoomName(e.target.value)}
                  />
                  <Button onClick={editRoom} variant="outlined">
                    Save
                  </Button>
                  <Button onClick={deleteRoom} variant="outlined">
                    Delete
                  </Button>
                </Box>
              )}

              <Button
                onClick={() => leaveRoom(connectedRoom._id)}
                variant="outlined"
              >
                Leave
              </Button>

              <Button onClick={disconnectFromRoom} variant="outlined">
                Disconnect
              </Button>
            </Box>

            <Box flex="1" my={2}>
              CAMS WILL BE HERE
            </Box>
          </Box>
        )}
      </Box>

      <Box flex="1" m={2} display="flex">
        {connectedRoom && (
          <Box flex="1" display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column" flex="1" overflow="auto">
              {connectedRoom.messages.map((message) => {
                const ownMessage = message.sender._id === user._id;
                return (
                  <Box
                    key={message._id}
                    my={1}
                    alignSelf={ownMessage ? "flex-end" : "flex-start"}
                    display="flex"
                    flexDirection="row"
                  >
                    <Avatar src={message.sender.picture} />
                    <Box
                      ml={1}
                      p={1}
                      style={{
                        borderRadius: 32,
                        background: ownMessage ? "gray" : "blue",
                      }}
                      color="white"
                    >
                      <Typography>{message.text}</Typography>
                      {message.files.map((file) => (
                        <li key={file.id}>
                          <a href={`/api/file/${file.id}`} download>
                            {file.filename}
                          </a>
                        </li>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box display="flex" mt={2}>
              <TextField
                fullWidth
                variant="outlined"
                label="Message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button variant="outlined" component="label">
                File
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => {
                    setSelectedFiles([...e.target.files]);
                  }}
                />
              </Button>
              <Button onClick={sendMessage} variant="outlined">
                Send
              </Button>
            </Box>
            <Box display="flex" flexDirection="column">
              {selectedFiles.map((file) => (
                <Box key={file.name} mt={1}>
                  <Button
                    style={{ justifyContent: "flex-start" }}
                    fullWidth
                    variant="outlined"
                    onClick={() =>
                      setSelectedFiles(selectedFiles.filter((f) => f !== file))
                    }
                  >
                    {file.name}
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Main;

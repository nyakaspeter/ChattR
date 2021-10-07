import { useHookstate } from "@hookstate/core";
import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import Axios from "axios";
import { OpenVidu } from "openvidu-browser";
import { useEffect, useRef, useState } from "react";
import { userState } from "./Store";
import Video from "./Video";

const Home = () => {
  const user = useHookstate(userState);

  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [connectedRoom, _setConnectedRoom] = useState(null);
  const [connectedRoomOwned, setConnectedRoomOwned] = useState(false);
  const [editedRoomName, setEditedRoomName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [currentRecording, setCurrentRecording] = useState(null);

  const connectedRoomRef = useRef(connectedRoom);
  const setConnectedRoom = (data) => {
    connectedRoomRef.current = data;
    _setConnectedRoom(data);
  };

  const OV = useRef(null);
  const session = useRef(null);
  const sessionToken = useRef(null);

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
        console.error(err);
      });
  };

  const getRooms = () => {
    Axios.get("/api/room")
      .then((res) => {
        const rooms = res.data;
        setRooms(rooms);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const joinRoom = (roomId) => {
    Axios.get(`/api/room/${roomId}/join`)
      .then((res) => {
        const room = res.data;
        setRooms([...rooms, room]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const leaveRoom = (roomId) => {
    disconnectFromRoom();
    Axios.get(`/api/room/${roomId}/leave`)
      .then((res) => setRooms(rooms.filter((room) => room._id !== roomId)))
      .catch((err) => {
        console.error(err);
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
        console.error(err);
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
        setConnectedRoomOwned(room.owner === user.get()._id);
        setEditedRoomName(room.name);
        setMessageText("");

        Axios.post(`/api/room/${roomId}/connect`)
          .then((res) => {
            const token = res.data.token;
            joinSession(token);
          })
          .catch((err) => {
            console.error(err);
            setConnectedRoom(null);
          });
      })
      .catch((err) => {
        console.error(err);
        setConnectedRoom(null);
      });
  };

  const disconnectFromRoom = () => {
    Axios.post(`/api/room/${connectedRoom._id}/disconnect`, {
      token: sessionToken.current,
    })
      .then(() => {
        setConnectedRoom(null);
      })
      .catch((err) => {
        console.error(err);
        setConnectedRoom(null);
      });

    leaveSession();
  };

  const sendMessage = () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("text", messageText);

    Axios.post(`/api/room/${connectedRoom._id}/message`, formData)
      .then((res) => {
        setMessageText("");
        setSelectedFiles([]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const startRecording = () => {
    Axios.post(`/api/room/${connectedRoom._id}/startRecording`)
      .then((res) => {
        setCurrentRecording(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const stopRecording = () => {
    Axios.post(`/api/room/${connectedRoom._id}/stopRecording`, {
      id: currentRecording.id,
    })
      .then((res) => {
        setCurrentRecording(null);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const joinSession = (token) => {
    OV.current = new OpenVidu();
    session.current = OV.current.initSession();
    sessionToken.current = token;

    session.current.on("streamCreated", (event) => {
      const subscriber = session.current.subscribe(event.stream, undefined);
      setSubscribers([...subscribers, subscriber]);
    });

    session.current.on("streamDestroyed", (event) => {
      setSubscribers(subscribers.filter((sub) => sub !== event.stream.streamManager));
    });

    session.current.on("signal:message", (event) => {
      const message = JSON.parse(event.data);

      setConnectedRoom({
        ...connectedRoomRef.current,
        messages: [...connectedRoomRef.current.messages, message],
      });
    });

    session.current
      .connect(token, { clientData: "hello" })
      .then(() => {
        let publisher = OV.current.initPublisher(undefined, {
          audioSource: undefined, // The source of audio. If undefined default microphone
          videoSource: undefined, // The source of video. If undefined default webcam
          publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
          publishVideo: true, // Whether you want to start publishing with your video enabled or not
          resolution: "640x480", // The resolution of your video
          frameRate: 30, // The frame rate of your video
          insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
          mirror: false, // Whether to mirror your local video or not
        });

        session.current.publish(publisher);
        setPublisher(publisher);
      })
      .catch((error) => {
        console.error("There was an error connecting to the session:", error.code, error.message);
      });
  };

  const leaveSession = () => {
    if (session.current) session.current.disconnect();

    OV.current = null;

    session.current = null;
    sessionToken.current = null;
    setSubscribers([]);
    setPublisher(null);
  };

  return (
    <Box height="100%" display="flex" overflow="hidden">
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
                  {room.name + (room.owner === user.get()._id ? " 👑" : "")}
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
                <Typography variant="h5">{connectedRoom.name + (connectedRoomOwned ? " 👑" : "")}</Typography>
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
                  {currentRecording ? (
                    <Button onClick={stopRecording} variant="outlined">
                      Stop recording
                    </Button>
                  ) : (
                    <Button onClick={startRecording} variant="outlined">
                      Record
                    </Button>
                  )}
                </Box>
              )}

              <Button onClick={() => leaveRoom(connectedRoom._id)} variant="outlined">
                Leave
              </Button>

              <Button onClick={disconnectFromRoom} variant="outlined">
                Disconnect
              </Button>
            </Box>

            <Box flex="1" my={2}>
              {publisher && <Video streamManager={publisher} />}
              {subscribers && subscribers.map((subscriber, index) => <Video key={index} streamManager={subscriber} />)}
            </Box>
          </Box>
        )}
      </Box>

      <Box flex="1" m={2} display="flex" overflow="hidden">
        {connectedRoom && (
          <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
            <Box display="flex" flexDirection="column" flex="1" overflow="auto">
              {connectedRoom.messages.map((message) => {
                const ownMessage = message.sender._id === user.get()._id;
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
                      display="flex"
                      flexWrap="wrap"
                      maxWidth={200}
                      style={{
                        borderRadius: 32,
                        background: ownMessage ? "silver" : "green",
                      }}
                      color="white"
                    >
                      <Typography style={{ overflow: "auto", wordWrap: "break-word" }}>{message.text}</Typography>
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
                    onClick={() => setSelectedFiles(selectedFiles.filter((f) => f !== file))}
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

export default Home;

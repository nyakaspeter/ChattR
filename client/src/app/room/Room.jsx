import { Downgraded, none, useHookstate } from "@hookstate/core";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import { useEffect, useRef } from "react";
import { useBeforeunload } from "react-beforeunload";
import { Prompt, useHistory, useParams } from "react-router";
import { api } from "../../core/api";
import { openvidu } from "../../core/openvidu";
import { globalStore } from "../../core/store";
import Call from "./call/Call";
import Messages from "./messages/Messages";
import RoomInfo from "./RoomInfo";
import Users from "./users/Users";

const Room = () => {
  const history = useHistory();
  const { roomId } = useParams();
  const store = useHookstate(globalStore);
  const loading = useHookstate(true);
  const error = useHookstate(false);

  const value = useHookstate("messages");

  const sessionRef = useRef(openvidu.initSession());

  function disconnectFromSession() {
    sessionRef.current.disconnect();
  }

  useEffect(() => {
    async function load() {
      try {
        if (!sessionRef.current.connection) {
          store.token.set((await api.get(`room/${roomId}/token`)).data);
          await connectToSession(store.token.get());
        }
        store.room.set((await api.get(`room/${roomId}/enter`)).data);
        store.messages.set((await api.get(`room/${roomId}/messages`)).data);
        loading.set(false);
      } catch {
        error.set(true);
        loading.set(false);
      }
    }

    async function connectToSession(token) {
      sessionRef.current.on("connectionCreated", (event) => {
        store.onlineUsers.merge([event.connection.data]);
      });

      sessionRef.current.on("connectionDestroyed", (event) => {
        store.onlineUsers.set((users) => users.filter((user) => user !== event.connection.data));
      });

      sessionRef.current.on("streamCreated", (event) => {
        const stream = sessionRef.current.subscribe(event.stream, undefined);
        store.remoteStreams.merge([stream]);
      });

      sessionRef.current.on("streamDestroyed", (event) => {
        const idx = store.remoteStreams.attach(Downgraded).get().indexOf(event.stream.streamManager);
        store.remoteStreams[idx].set(none);
      });

      sessionRef.current.on("recordingStarted", (event) => {
        store.recording.set(true);
      });

      sessionRef.current.on("recordingStopped", (event) => {
        store.recording.set(false);
      });

      sessionRef.current.on("signal:message", (event) => {
        const message = JSON.parse(event.data);
        store.messages.merge([message]);
      });

      sessionRef.current.on("signal:roomUpdated", (event) => {
        const room = JSON.parse(event.data);
        store.room.merge(room);
      });

      sessionRef.current.on("signal:roomDeleted", (event) => {
        history.push("/");
      });

      sessionRef.current.connect(token);
    }

    load();
  }, []);

  useBeforeunload((event) => {
    disconnectFromSession();
  });

  if (loading.get()) return <>Loading...</>;
  if (error.get()) return <>Error!</>;
  return (
    <Box height="100%" display="flex" overflow="hidden">
      <Prompt message={disconnectFromSession} />
      <Box flex="3" m={1} display="flex">
        <Box flex="1" display="flex" flexDirection="column">
          <RoomInfo />
          <Call sessionRef={sessionRef} />
        </Box>
      </Box>
      <Box flex="1" m={1} display="flex" flexDirection="column">
        <TabContext value={value.get()}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={(event, newValue) => value.set(newValue)} centered>
              <Tab label="Messages" value="messages" />
              <Tab label="Users" value="users" />
            </TabList>
          </Box>
          <TabPanel value="messages">
            <Messages />
          </TabPanel>
          <TabPanel value="users">
            <Users />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Room;

import { Downgraded, none, useHookstate } from "@hookstate/core";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useBeforeunload } from "react-beforeunload";
import { useParams } from "react-router";
import { api } from "../../core/api";
import { openvidu } from "../../core/openvidu";
import { globalStore } from "../../core/store";
import Call from "./call/Call";
import Messages from "./messages/Messages";
import RoomInfo from "./RoomInfo";

const Room = () => {
  const { roomId } = useParams();
  const store = useHookstate(globalStore);
  const loading = useHookstate(true);
  const error = useHookstate(false);

  const sessionRef = useRef(openvidu.initSession());

  useEffect(() => {
    async function load() {
      try {
        if (!sessionRef.current.connection) {
          store.token.set((await api.get(`room/${roomId}/session/connect`)).data.token);
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
      sessionRef.current.on("signal:message", (event) => {
        const message = JSON.parse(event.data);
        store.messages.merge([message]);
      });

      sessionRef.current.on("streamCreated", (event) => {
        const stream = sessionRef.current.subscribe(event.stream, undefined);
        store.remoteStreams.merge([stream]);
      });

      sessionRef.current.on("streamDestroyed", (event) => {
        const idx = store.remoteStreams.attach(Downgraded).get().indexOf(event.stream.streamManager);
        store.remoteStreams[idx].set(none);
      });

      sessionRef.current.connect(token);
    }

    load();
  }, []);

  useBeforeunload((event) => {
    sessionRef.current.disconnect();
  });

  if (loading.get()) return <>Loading...</>;
  if (error.get()) return <>Error!</>;
  return (
    <Box height="100%" display="flex" overflow="hidden">
      <Box flex="3" m={1} display="flex">
        <Box flex="1" display="flex" flexDirection="column">
          <RoomInfo />
          <Call sessionRef={sessionRef} />
        </Box>
      </Box>
      <Box flex="1" m={1} display="flex" overflow="hidden">
        <Messages />
      </Box>
    </Box>
  );
};

export default Room;

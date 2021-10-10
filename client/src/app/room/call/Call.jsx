import { Downgraded, useHookstate } from "@hookstate/core";
import { Box, Button, Typography } from "@mui/material";
import { openvidu } from "../../../core/openvidu";
import { globalStore } from "../../../core/store";
// import Axios from "axios";
import Video from "./Video";

const Call = (props) => {
  const { sessionRef } = props;

  const store = useHookstate(globalStore);

  //   const recording = useHookstate(null);

  function joinCall() {
    const stream = openvidu.initPublisher(undefined, {
      audioSource: undefined, // The source of audio. If undefined default microphone
      videoSource: undefined, // The source of video. If undefined default webcam
      publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
      publishVideo: true, // Whether you want to start publishing with your video enabled or not
      resolution: "640x480", // The resolution of your video
      frameRate: 30, // The frame rate of your video
      insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
      mirror: false, // Whether to mirror your local video or not
    });

    sessionRef.current.publish(stream);
    store.localStream.set(stream);
  }

  function leaveCall() {
    sessionRef.current.unpublish(store.localStream.get());
    store.localStream.set(null);
  }

  //   const disconnectFromRoom = () => {
  //     Axios.post(`/api/room/${room.get()._id}/disconnect`, {
  //       token: sessionTokenRef.current,
  //     })
  //       .then(() => {
  //         //setConnectedRoom(null);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         //setConnectedRoom(null);
  //       });

  //     //leaveSession();
  //   };

  //   const leaveSession = () => {
  //     if (sessionRef.current) sessionRef.current.disconnect();

  //     openViduRef.current = null;

  //     sessionRef.current = null;
  //     sessionTokenRef.current = null;
  //     subscribers.set([]);
  //     publisher.set(null);
  //   };

  //   const startRecording = () => {
  //     Axios.post(`/api/room/${room.get()._id}/startRecording`)
  //       .then((res) => {
  //         recording.set(res.data);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //       });
  //   };

  //   const stopRecording = () => {
  //     Axios.post(`/api/room/${roomId}/stopRecording`, {
  //       id: recording.get().id,
  //     })
  //       .then((res) => {
  //         recording.set(null);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //       });
  //   };

  return (
    <Box flex="1" my={1} flexDirection="column">
      {store.localStream.get() ? (
        <Button variant="outlined" onClick={leaveCall}>
          Leave call
        </Button>
      ) : (
        <Button variant="outlined" onClick={joinCall}>
          Join call
        </Button>
      )}

      <Typography my={1}>Local stream:</Typography>
      {store.localStream.get() && (
        <Box my={1}>
          <Video streamManager={store.localStream.attach(Downgraded).get()} />
        </Box>
      )}
      <Typography my={1}>Remote streams ({store.remoteStreams.get().length}):</Typography>
      <Box my={1} display="flex">
        {store.remoteStreams
          .attach(Downgraded)
          .get()
          .map((stream, idx) => (
            <Box key={idx} mr={1}>
              <Video streamManager={stream} />
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default Call;

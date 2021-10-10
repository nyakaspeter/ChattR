import { useEffect, useRef } from "react";

const Video = (props) => {
  const videoRef = useRef();

  useEffect(() => {
    if (props && props.streamManager && videoRef) {
      props.streamManager.addVideoElement(videoRef.current);
    }
  }, []);

  return (
    <video
      id={props.streamManager.stream.streamId}
      autoPlay
      style={{ width: "200px", background: "red" }}
      ref={videoRef}
    />
  );
};

export default Video;

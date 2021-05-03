import { useEffect, useRef } from "react";

const Video = (props) => {
  const videoRef = useRef();

  useEffect(() => {
    if (props && !!videoRef) {
      props.streamManager.addVideoElement(videoRef.current);
    }
  });

  return <video width={200} autoPlay={true} ref={videoRef} />;
};

export default Video;

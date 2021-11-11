export const delay = ms => new Promise(res => setTimeout(res, ms));

export const getMediaDevices = async () => {
  let audioInputs = [];
  let audioOutputs = [];
  let videoInputs = [];

  // Ask for permissions if needed
  try {
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(stream => stream.getTracks().forEach(track => track.stop()));
  } catch {
    console.log('Failed to get audio devices');
  }
  try {
    await navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then(stream => stream.getTracks().forEach(track => track.stop()));
  } catch {
    console.log('Failed to get video devices');
  }

  // Enumerate media devices
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
      d => d.deviceId
    );

    audioInputs = devices.filter(d => d.kind === 'audioinput');
    audioOutputs = devices.filter(d => d.kind === 'audiooutput');
    videoInputs = devices.filter(d => d.kind === 'videoinput');
  } catch {
    console.log('Failed to enumerate media devices');
  }

  return { audioInputs, audioOutputs, videoInputs };
};

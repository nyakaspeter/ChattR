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
  } catch (err) {
    console.error('Failed to get audio devices', err);
  }
  try {
    await navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then(stream => stream.getTracks().forEach(track => track.stop()));
  } catch (err) {
    console.error('Failed to get video devices', err);
  }

  // Enumerate media devices
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
      d => d.deviceId
    );

    audioInputs = devices.filter(d => d.kind === 'audioinput');
    audioOutputs = devices.filter(d => d.kind === 'audiooutput');
    videoInputs = devices.filter(d => d.kind === 'videoinput');
  } catch (err) {
    console.error('Failed to enumerate media devices', err);
  }

  return { audioInputs, audioOutputs, videoInputs };
};

export const toHHMMSS = secs => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map(v => (v < 10 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

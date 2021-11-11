import { OpenVidu } from 'openvidu-browser';

const openvidu = new OpenVidu();

openvidu.setAdvancedConfiguration({
  publisherSpeakingEventsOptions: {
    interval: 100, // Frequency of the polling of audio streams in ms (default 100)
    threshold: -70, // Threshold volume in dB (default -50)
  },
});

openvidu.enableProdMode();

export { openvidu };

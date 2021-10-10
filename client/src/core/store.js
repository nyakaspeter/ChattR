import { createState } from "@hookstate/core";

export const globalStore = createState({
  user: null,
  rooms: [],
  room: null,
  messages: [],
  session: null,
  token: null,
  localStream: null,
  remoteStreams: [],
});

import { createState, useHookstate } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';

const uiState = createState({
  showRoomList: true,
  currentPanel: null,
});

export const useUiState = () => useHookstate(uiState);

const callSettings = createState({
  selectedCam: '',
  selectedMic: '',
  camEnabled: true,
  micEnabled: true,
  soundEnabled: true,
  nameOverlay: false,
});
callSettings.attach(Persistence('callSettings'));

export const useCallSettings = () => useHookstate(callSettings);

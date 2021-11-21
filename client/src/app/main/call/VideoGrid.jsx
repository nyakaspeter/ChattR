import { Box } from '@chakra-ui/layout';
import React, { useEffect, useRef } from 'react';
import { PackedGrid } from 'react-packed-grid';
import { useUiState } from '../../../core/store';
import Video from './Video';
import './VideoGrid.css';

const VideoGrid = props => {
  const { videos, users } = props;

  const { align = 'center', spacing = 2 } = props;
  const updateLayout = useRef();

  const uiState = useUiState();

  useEffect(
    () => updateLayout.current(),
    [uiState.currentPanel.value, uiState.showRoomList.value]
  );

  return (
    <PackedGrid
      className={`fill ${align === 'left' && 'left'}`}
      boxAspectRatio={4 / 3}
      updateLayoutRef={updateLayout}
    >
      {videos.map(video => (
        <Box
          key={video.remote ? video.stream.connection.connectionId : 'local'}
          w="100%"
          h="100%"
          display="grid"
        >
          <Video streamManager={video} users={users} m={spacing / 2}></Video>
        </Box>
      ))}
    </PackedGrid>
  );
};

export default VideoGrid;

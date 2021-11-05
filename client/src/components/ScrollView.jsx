import { useColorModeValue } from '@chakra-ui/color-mode';
import { useTheme } from '@chakra-ui/system';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

export const ScrollView = React.forwardRef((props, ref) => {
  const theme = useTheme();
  const color = useColorModeValue(
    theme.colors.gray['300'],
    theme.colors.gray['500']
  );

  return (
    <Scrollbars
      ref={ref}
      {...props}
      autoHide
      renderThumbVertical={({ ...props }) => (
        <div {...props} style={{ backgroundColor: color, borderRadius: 4 }} />
      )}
    />
  );
});

ScrollView.displayName = 'ScrollView';

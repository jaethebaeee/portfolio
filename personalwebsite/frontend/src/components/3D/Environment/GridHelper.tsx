import React from 'react';
import { RETRO_COLORS } from '../constants/colors';

/**
 * Enhanced grid helper for the ground
 */
export const GroundGrid = React.memo(function GroundGrid() {
  return (
    <gridHelper
      args={[120, 24, RETRO_COLORS.darkGray, RETRO_COLORS.gray]}
      position={[0, 0.01, 0]}
    />
  );
});

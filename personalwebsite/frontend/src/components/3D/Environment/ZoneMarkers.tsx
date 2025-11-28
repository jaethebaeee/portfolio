import React from 'react';
import * as THREE from 'three';
import { RETRO_COLORS } from '../constants/colors';
import { Voxel } from '../models/VoxelBuilder';

/**
 * Zone boundary markers and decorative elements
 */
export const ZoneMarkers = React.memo(function ZoneMarkers() {
  return (
    <>
      {/* Enhanced zone boundary markers with grass transition */}
      {/* About zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.02, -15]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Projects zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Skills zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Education zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.02, -15]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={new THREE.Color(RETRO_COLORS.stone).lerp(new THREE.Color(RETRO_COLORS.grass), 0.3)}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Decorative boundary markers */}
      {/* Corner markers for visual interest */}
      <Voxel position={[-25, 0.5, -25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />
      <Voxel position={[-25, 0.5, 25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />
      <Voxel position={[25, 0.5, -25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />
      <Voxel position={[25, 0.5, 25]} color={RETRO_COLORS.gold} materialType="metallic" size={0.8} />

      {/* Path markers between zones */}
      <Voxel position={[-20, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[-10, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[0, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[10, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
      <Voxel position={[20, 0.3, -20]} color={RETRO_COLORS.silver} materialType="metallic" size={0.5} />
    </>
  );
});

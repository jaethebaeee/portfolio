import { RETRO_COLORS } from '../constants/colors';

export type VoxelAdder = (
  _position: [number, number, number],
  _color: string,
  _materialType?: 'standard' | 'metallic' | 'emissive' | 'glass' | 'animated',
  _emissiveIntensity?: number,
  _metalness?: number,
  _roughness?: number
) => void;

export const HOUSE_CONFIG = {
  PLATFORM_SIZE: 8,
  WALL_HEIGHT: 4,
  ROOF_HEIGHT: 4,
  ROOF_PEAK_HEIGHT: 5,
  CENTER_OFFSET: 4,
} as const;

export interface HouseConfigType {
  PLATFORM_SIZE: number;
  WALL_HEIGHT: number;
  ROOF_HEIGHT: number;
  ROOF_PEAK_HEIGHT: number;
  CENTER_OFFSET: number;
}

export function generatePlatform(addVoxel: VoxelAdder, config: Partial<HouseConfigType> = HOUSE_CONFIG) {
  const { PLATFORM_SIZE = 8, CENTER_OFFSET = 4 } = config;

  for (let x = 0; x < PLATFORM_SIZE; x++) {
    for (let z = 0; z < PLATFORM_SIZE; z++) {
      addVoxel([x - CENTER_OFFSET, 0, z - CENTER_OFFSET], RETRO_COLORS.stone);
    }
  }
}

export function generateWalls(addVoxel: VoxelAdder, config: Partial<HouseConfigType> = HOUSE_CONFIG) {
  const { WALL_HEIGHT = 4, CENTER_OFFSET = 4 } = config;

  for (let y = 0; y < WALL_HEIGHT; y++) {
    const level = y + 1;

    for (let x = -CENTER_OFFSET + 1; x <= CENTER_OFFSET - 1; x++) {
      addVoxel([x, level, CENTER_OFFSET - 1], RETRO_COLORS.blue);
      addVoxel([x, level, -CENTER_OFFSET], RETRO_COLORS.blue);
    }

    for (let z = -CENTER_OFFSET + 1; z <= CENTER_OFFSET - 1; z++) {
      addVoxel([CENTER_OFFSET - 1, level, z], RETRO_COLORS.blue);
      addVoxel([-CENTER_OFFSET, level, z], RETRO_COLORS.blue);
    }
  }
}

export function generateRoof(addVoxel: VoxelAdder, config: Partial<HouseConfigType> = HOUSE_CONFIG) {
  const { ROOF_HEIGHT = 4, ROOF_PEAK_HEIGHT = 5, CENTER_OFFSET = 4 } = config;

  const roofSize = CENTER_OFFSET - 1;

  for (let level = 0; level < 2; level++) {
    const y = ROOF_HEIGHT + level;
    const size = roofSize - level;

    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        const isEmissive = Math.random() < 0.3 && level === 1;
        addVoxel(
          [x, y, z],
          isEmissive ? RETRO_COLORS.neonBlue : RETRO_COLORS.red,
          isEmissive ? 'emissive' : 'standard',
          isEmissive ? 0.4 : 0,
          0.1,
          0.8
        );
      }
    }
  }

  addVoxel(
    [0, ROOF_PEAK_HEIGHT, 0],
    RETRO_COLORS.red,
    'emissive',
    0.3,
    0.1,
    0.6
  );
}

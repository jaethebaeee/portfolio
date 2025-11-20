import { Vector3 } from 'three';

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface Zone {
  name: string;
  position: Vector3;
  size: Vector3;
}

/**
 * Check if two AABB (Axis-Aligned Bounding Boxes) intersect
 */
export function checkAABBIntersection(box1: BoundingBox, box2: BoundingBox): boolean {
  return (
    box1.min.x <= box2.max.x &&
    box1.max.x >= box2.min.x &&
    box1.min.y <= box2.max.y &&
    box1.max.y >= box2.min.y &&
    box1.min.z <= box2.max.z &&
    box1.max.z >= box2.min.z
  );
}

/**
 * Check if a point is inside a zone
 */
export function isPointInZone(point: Vector3, zone: Zone): boolean {
  const halfSize = zone.size.clone().multiplyScalar(0.5);
  const min = zone.position.clone().sub(halfSize);
  const max = zone.position.clone().add(halfSize);

  return (
    point.x >= min.x &&
    point.x <= max.x &&
    point.y >= min.y &&
    point.y <= max.y &&
    point.z >= min.z &&
    point.z <= max.z
  );
}

/**
 * Get bounding box from position and size
 */
export function getBoundingBox(position: Vector3, size: Vector3): BoundingBox {
  const halfSize = size.clone().multiplyScalar(0.5);
  return {
    min: position.clone().sub(halfSize),
    max: position.clone().add(halfSize),
  };
}

/**
 * Clamp position within world boundaries
 */
export function clampToWorldBounds(
  position: Vector3,
  worldSize: number
): Vector3 {
  const clamped = position.clone();
  const halfWorld = worldSize / 2;
  
  clamped.x = Math.max(-halfWorld, Math.min(halfWorld, clamped.x));
  clamped.z = Math.max(-halfWorld, Math.min(halfWorld, clamped.z));
  
  return clamped;
}

/**
 * Check which zone a character is in
 */
export function getZoneAtPosition(position: Vector3, zones: Zone[]): Zone | null {
  for (const zone of zones) {
    if (isPointInZone(position, zone)) {
      return zone;
    }
  }
  return null;
}


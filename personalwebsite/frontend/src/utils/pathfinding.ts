import * as THREE from 'three';

// Simple A* pathfinding implementation for 3D voxel worlds
export class Pathfinding {
  // Simple steering-based pathfinding
  findPath(start: THREE.Vector3, end: THREE.Vector3, obstacles: THREE.Box3[] = []): THREE.Vector3[] {
    // For now, implement a simple steering behavior
    // In a full implementation, this would use A* with a proper grid

    const path: THREE.Vector3[] = [];
    const current = start.clone();
    const target = end.clone();

    // Check for direct line of sight
    if (this.hasLineOfSight(current, target, obstacles)) {
      // Direct path is clear
      path.push(target.clone());
      return path;
    }

    // Simple obstacle avoidance - try to go around obstacles
    const avoidancePoints = this.findAvoidancePoints(current, target, obstacles);
    path.push(...avoidancePoints);
    path.push(target.clone());

    return path;
  }

  private hasLineOfSight(start: THREE.Vector3, end: THREE.Vector3, obstacles: THREE.Box3[]): boolean {
    const direction = end.clone().sub(start).normalize();
    const distance = start.distanceTo(end);
    const steps = Math.ceil(distance / 0.5); // Check every 0.5 units

    for (let i = 1; i < steps; i++) {
      const testPoint = start.clone().add(direction.clone().multiplyScalar(i * 0.5));

      // Check if test point intersects any obstacles
      for (const obstacle of obstacles) {
        if (obstacle.containsPoint(testPoint)) {
          return false;
        }
      }
    }

    return true;
  }

  private findAvoidancePoints(start: THREE.Vector3, end: THREE.Vector3, obstacles: THREE.Box3[]): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const direction = end.clone().sub(start).normalize();

    // Try to find a point around obstacles
    // Simple implementation: try perpendicular offsets
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
    const offsets = [2, -2, 4, -4]; // Try different distances

    for (const offset of offsets) {
      const testPoint = start.clone().add(perpendicular.clone().multiplyScalar(offset));

      // Check if this avoidance point is clear
      if (this.isPointClear(testPoint, obstacles)) {
        points.push(testPoint);
        // Then try to path from this point to the end
        if (this.hasLineOfSight(testPoint, end, obstacles)) {
          break;
        }
      }
    }

    return points;
  }

  private isPointClear(point: THREE.Vector3, obstacles: THREE.Box3[]): boolean {
    for (const obstacle of obstacles) {
      if (obstacle.containsPoint(point)) {
        return false;
      }
    }
    return true;
  }

  // Get obstacles from the current zone
  getZoneObstacles(zonePosition: THREE.Vector3): THREE.Box3[] {
    // This would be populated based on the actual zone geometry
    // For now, return some sample obstacles
    const obstacles: THREE.Box3[] = [];

    // Add some sample building obstacles
    obstacles.push(new THREE.Box3(
      new THREE.Vector3(-18, 0, -18).add(zonePosition),
      new THREE.Vector3(-12, 6, -12).add(zonePosition)
    ));

    obstacles.push(new THREE.Box3(
      new THREE.Vector3(12, 0, -18).add(zonePosition),
      new THREE.Vector3(18, 6, -12).add(zonePosition)
    ));

    return obstacles;
  }
}

// Steering behavior for smooth following
export class SteeringBehavior {
  static seek(current: THREE.Vector3, target: THREE.Vector3, maxSpeed: number = 5): THREE.Vector3 {
    const desired = target.clone().sub(current).normalize().multiplyScalar(maxSpeed);
    return desired;
  }

  static arrive(current: THREE.Vector3, target: THREE.Vector3, maxSpeed: number = 5, slowingRadius: number = 2): THREE.Vector3 {
    const desired = target.clone().sub(current);
    const distance = desired.length();

    if (distance < slowingRadius) {
      // Slow down as we approach
      const speed = maxSpeed * (distance / slowingRadius);
      desired.normalize().multiplyScalar(speed);
    } else {
      desired.normalize().multiplyScalar(maxSpeed);
    }

    return desired;
  }

  static avoidObstacles(current: THREE.Vector3, obstacles: THREE.Box3[], avoidDistance: number = 3): THREE.Vector3 {
    const avoidance = new THREE.Vector3();

    for (const obstacle of obstacles) {
      const closestPoint = obstacle.clampPoint(current.clone(), new THREE.Vector3());
      const distance = current.distanceTo(closestPoint);

      if (distance < avoidDistance) {
        // Calculate avoidance force
        const avoidForce = current.clone().sub(closestPoint).normalize();
        const strength = (avoidDistance - distance) / avoidDistance;
        avoidance.add(avoidForce.multiplyScalar(strength));
      }
    }

    return avoidance;
  }

  static combineBehaviors(behaviors: THREE.Vector3[], weights: number[]): THREE.Vector3 {
    const combined = new THREE.Vector3();

    for (let i = 0; i < behaviors.length; i++) {
      combined.add(behaviors[i].clone().multiplyScalar(weights[i]));
    }

    return combined;
  }
}

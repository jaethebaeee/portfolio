import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Box3, Sphere, Raycaster, Intersection } from 'three';
import * as THREE from 'three';

// Physics context for global physics state
/* eslint-disable no-unused-vars */
interface PhysicsContextType {
  addCollider: (id: string, collider: Collider) => void;
  removeCollider: (id: string) => void;
  checkCollision: (_position: Vector3, _radius: number) => CollisionResult | null;
  raycast: (origin: Vector3, direction: Vector3, maxDistance?: number) => Intersection[] | null;
}
/* eslint-enable no-unused-vars */

const PhysicsContext = createContext<PhysicsContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function usePhysics() {
  const context = useContext(PhysicsContext);
  if (!context) {
    throw new Error('usePhysics must be used within a PhysicsProvider');
  }
  return context;
}

interface Collider {
  type: 'box' | 'sphere';
  position: Vector3;
  size?: Vector3; // for box
  radius?: number; // for sphere
  onCollide?: (_other: any) => void;
  isTrigger?: boolean;
}

interface CollisionResult {
  collider: Collider;
  point: Vector3;
  normal: Vector3;
  distance: number;
}

interface PhysicsProviderProps {
  children: React.ReactNode;
  enableDebug?: boolean;
}

export function PhysicsProvider({
  children,
  enableDebug = false
}: PhysicsProviderProps) {
  const { scene } = useThree();
  const collidersRef = useRef<Map<string, Collider>>(new Map());
  const raycasterRef = useRef<Raycaster>(new Raycaster());

  const addCollider = (id: string, collider: Collider) => {
    collidersRef.current.set(id, collider);
  };

  const removeCollider = (id: string) => {
    collidersRef.current.delete(id);
  };

  const checkCollision = (position: Vector3, radius: number): CollisionResult | null => {
    for (const [, collider] of collidersRef.current) {
      let collision: CollisionResult | null = null;

      if (collider.type === 'sphere') {
        const distance = position.distanceTo(collider.position);
        if (distance < radius + (collider.radius || 0)) {
          const normal = new Vector3().subVectors(position, collider.position).normalize();
          collision = {
            collider,
            point: collider.position.clone().add(normal.clone().multiplyScalar(collider.radius || 0)),
            normal,
            distance: radius + (collider.radius || 0) - distance
          };
        }
      } else if (collider.type === 'box') {
        const halfSize = (collider.size || new Vector3(1, 1, 1)).clone().multiplyScalar(0.5);
        const box = new Box3(
          collider.position.clone().sub(halfSize),
          collider.position.clone().add(halfSize)
        );
        const sphere = new Sphere(position, radius);

        if (box.intersectsSphere(sphere)) {
          // Calculate intersection point and normal
          const closestPoint = position.clone().clamp(box.min, box.max);
          const normal = new Vector3().subVectors(position, closestPoint).normalize();
          collision = {
            collider,
            point: closestPoint,
            normal,
            distance: position.distanceTo(closestPoint)
          };
        }
      }

      if (collision) {
        return collision;
      }
    }

    return null;
  };

  const raycast = (origin: Vector3, direction: Vector3, maxDistance = 100): Intersection[] | null => {
    raycasterRef.current.set(origin, direction.normalize());
    raycasterRef.current.far = maxDistance;

    const intersects = raycasterRef.current.intersectObjects(scene.children, true);
    return intersects.length > 0 ? intersects : null;
  };

  const contextValue: PhysicsContextType = {
    addCollider,
    removeCollider,
    checkCollision,
    raycast
  };

  return (
    <PhysicsContext.Provider value={contextValue}>
      {children}
      {enableDebug && <PhysicsDebugger />}
    </PhysicsContext.Provider>
  );
}

function PhysicsDebugger() {
  const debugMeshesRef = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    // Clear previous debug meshes
    debugMeshesRef.current.forEach(mesh => {
      if (mesh.parent) mesh.parent.remove(mesh);
    });
    debugMeshesRef.current = [];

    // Add debug visualization for colliders (this would be more complex in a real implementation)
    // For now, just log collider count
    console.log(`Active colliders: ${debugMeshesRef.current.length}`);
  });

  return null;
}

interface RigidBodyProps {
  children: React.ReactNode;
  drag?: number;
  angularDrag?: number;
  useGravity?: boolean;
  isKinematic?: boolean;
  collider?: Collider;
  onCollision?: (_collision: CollisionResult) => void;
}

export function RigidBody({
  children,
  drag = 0.1,
  angularDrag = 0.1,
  useGravity = true,
  isKinematic = false,
  collider,
  onCollision
}: RigidBodyProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { addCollider, removeCollider, checkCollision } = usePhysics();

  const [velocity] = useState(new Vector3());
  const [angularVelocity] = useState(new Vector3());
  const [id] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (collider) {
      addCollider(id, collider);
    }

    return () => {
      if (collider) {
        removeCollider(id);
      }
    };
  }, [collider, id, addCollider, removeCollider]);

  useFrame((_state, delta) => {
    if (!meshRef.current || isKinematic) return;

    // Apply gravity
    if (useGravity) {
      velocity.add(new Vector3(0, -9.81 * delta, 0));
    }

    // Apply drag
    velocity.multiplyScalar(1 - drag * delta);
    angularVelocity.multiplyScalar(1 - angularDrag * delta);

    // Update position
    const newPosition = meshRef.current.position.clone().add(velocity.clone().multiplyScalar(delta));

    // Check for collisions
    if (collider) {
      const collision = checkCollision(newPosition, collider.radius || 1);
      if (collision && !collider.isTrigger) {
        // Handle collision response
        const normal = collision.normal;
        const dot = velocity.dot(normal);

        if (dot < 0) {
          // Reflect velocity
          velocity.sub(normal.clone().multiplyScalar(2 * dot));

          // Apply some energy loss
          velocity.multiplyScalar(0.8);

          // Move object out of collision
          newPosition.add(normal.clone().multiplyScalar(collision.distance));
        }

        onCollision?.(collision);
      }
    }

    meshRef.current.position.copy(newPosition);

    // Update rotation
    if (angularVelocity.length() > 0) {
      const rotationDelta = angularVelocity.clone().multiplyScalar(delta);
      meshRef.current.rotation.x += rotationDelta.x;
      meshRef.current.rotation.y += rotationDelta.y;
      meshRef.current.rotation.z += rotationDelta.z;
    }
  });

  return <group ref={meshRef}>{children}</group>;
}

interface TriggerZoneProps {
  position: [number, number, number];
  size?: [number, number, number];
  radius?: number;
  type?: 'box' | 'sphere';
  onEnter?: () => void;
  onExit?: () => void;
  onStay?: () => void;
  children?: React.ReactNode;
}

export function TriggerZone({
  position,
  size = [2, 2, 2],
  radius = 1,
  type = 'box',
  onEnter,
  onExit,
  onStay,
  children
}: TriggerZoneProps) {
  const { checkCollision } = usePhysics();
  const [isInside, setIsInside] = useState(false);

  useFrame(() => {
    // Check if player (or camera) is inside the trigger zone
    const cameraPosition = new Vector3(); // This would need to be passed from a camera context
    const collision = checkCollision(cameraPosition, 0.5);

    const wasInside = isInside;
    const nowInside = collision !== null;

    if (!wasInside && nowInside) {
      onEnter?.();
    } else if (wasInside && !nowInside) {
      onExit?.();
    } else if (wasInside && nowInside) {
      onStay?.();
    }

    setIsInside(nowInside);
  });

  return (
    <group position={position}>
      {/* Visual representation of trigger zone */}
      {type === 'box' ? (
        <mesh>
          <boxGeometry args={size} />
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
      {children}
    </group>
  );
}

interface ForceFieldProps {
  position: [number, number, number];
  strength?: number;
  radius?: number;
  type?: 'attract' | 'repel' | 'vortex';
  children?: React.ReactNode;
}

export function ForceField({
  position,
  strength = 1,
  radius = 5,
  type = 'attract',
  children
}: ForceFieldProps) {
  const { addCollider, removeCollider } = usePhysics();
  const [id] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const collider: Collider = {
      type: 'sphere',
      position: new Vector3(...position),
      radius,
      isTrigger: true,
      onCollide: (other: any) => {
        if (other.velocity) {
          const direction = new Vector3(...position).sub(other.position).normalize();
          const distance = new Vector3(...position).distanceTo(other.position);

          if (distance < radius) {
            const force = strength / (distance * distance + 1); // Inverse square law with smoothing

            switch (type) {
              case 'attract':
                other.velocity.add(direction.clone().multiplyScalar(force * -1));
                break;
              case 'repel':
                other.velocity.add(direction.clone().multiplyScalar(force));
                break;
              case 'vortex': {
                // Create swirling motion
                const tangent = new Vector3(-direction.z, 0, direction.x);
                other.velocity.add(tangent.multiplyScalar(force));
                break;
              }
            }
          }
        }
      }
    };

    addCollider(id, collider);

    return () => {
      removeCollider(id);
    };
  }, [position, strength, radius, type, id, addCollider, removeCollider]);

  return (
    <group position={position}>
      {/* Visual representation */}
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={type === 'attract' ? '#00ff00' : type === 'repel' ? '#ff0000' : '#ffff00'}
          transparent
          opacity={0.05}
          wireframe
        />
      </mesh>
      {children}
    </group>
  );
}

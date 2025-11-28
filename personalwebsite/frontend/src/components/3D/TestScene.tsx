import { Canvas } from '@react-three/fiber';
import { Ground, Skybox, Lights } from './Environment';

export function TestScene() {
  return (
    <Canvas style={{ background: '#1e1e1e' }}>
      <Skybox />
      <Lights />
      <Ground />
    </Canvas>
  );
}

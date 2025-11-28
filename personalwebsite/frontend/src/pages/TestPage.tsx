import { Suspense } from 'react';
import { TestScene } from '../components/3D/TestScene';
import { WebGLErrorBoundary } from '../components/UI/WebGLErrorBoundary';

export function TestPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              fontSize: '18px',
            }}
          >
            Loading Test Scene...
          </div>
        }
      >
        <WebGLErrorBoundary>
          <TestScene />
        </WebGLErrorBoundary>
      </Suspense>
    </div>
  );
}

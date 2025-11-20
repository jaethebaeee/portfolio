import { useState } from 'react';
import { VoxelWorld } from './components/3D/VoxelWorld';
import { VoxelPortfolio } from './components/3D/VoxelPortfolio';
import { TraditionalWebsite } from './components/TraditionalWebsite';
import { WebGLErrorBoundary } from './components/UI/WebGLErrorBoundary';

type AppMode = 'dog' | 'portfolio' | 'traditional';

function App() {
  const [mode, setMode] = useState<AppMode>('traditional'); // Start with traditional website by default

  if (mode === 'dog') {
    return (
      <div
        style={{ width: '100vw', height: '100vh' }}
        role="application"
        aria-label="3D Animated Dog Experience"
        aria-description="Enjoy a cute animated dog with beautiful 3D animations and effects."
      >
        <WebGLErrorBoundary>
          <VoxelWorld />
        </WebGLErrorBoundary>
        <button
          onClick={() => setMode('portfolio')}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            background: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          Enter Portfolio
        </button>
      </div>
    );
  }

  if (mode === 'portfolio') {
    return (
      <div
        style={{ width: '100vw', height: '100vh' }}
        role="application"
        aria-label="3D Interactive Portfolio"
        aria-description="Explore Jae's professional portfolio in an immersive 3D environment."
      >
        <WebGLErrorBoundary>
          <VoxelPortfolio onExit={() => setMode('traditional')} />
        </WebGLErrorBoundary>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setMode('dog')}
            style={{
              padding: '8px 16px',
              background: '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🐕 Dog Scene
          </button>
          <button
            onClick={() => setMode('traditional')}
            style={{
              padding: '8px 16px',
              background: '#a78bfa',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📄 Traditional
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      role="application"
      aria-label="Professional Portfolio"
      aria-description="Explore Jae's professional background and projects."
    >
      <TraditionalWebsite />
      <button
        onClick={() => setMode('portfolio')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
        }}
      >
        🌟 Enter 3D World
      </button>
    </div>
  );
}

export default App;

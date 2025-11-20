import { Component, ErrorInfo, ReactNode } from 'react';

// Utility function to detect common WebGL issues
function getWebGLTroubleshootingInfo(): string[] {
  const tips: string[] = [];

  // Check for software rendering
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') as WebGLRenderingContext | null ||
             canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer && (
        renderer.includes('Software') ||
        renderer.includes('Microsoft Basic') ||
        renderer.includes('SwiftShader')
      )) {
        tips.push('Your browser is using software rendering instead of hardware acceleration');
        tips.push('Enable hardware acceleration in browser settings');
      }
    }
  }

  // Check for known browser issues
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('firefox') && parseFloat(navigator.userAgent.match(/firefox\/(\d+)/)?.[1] || '0') < 90) {
    tips.push('Firefox version might be outdated - update to latest version');
  }

  if (userAgent.includes('safari') && parseFloat(navigator.userAgent.match(/version\/(\d+)/)?.[1] || '0') < 15) {
    tips.push('Safari version might be outdated - update to latest version');
  }

  return tips;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('WebGL Error Boundary caught an error:', error, errorInfo);

    // Check if it's a WebGL-related error
    const isWebGLError = error.message.includes('WebGL') ||
                        error.message.includes('GL') ||
                        error.message.includes('context') ||
                        error.message.includes('canvas') ||
                        error.name === 'WebGLRenderingContext' ||
                        errorInfo.componentStack?.includes('react-three-fiber') ||
                        errorInfo.componentStack?.includes('@react-three') ||
                        error.message.includes('WebGL context') ||
                        error.message.includes('shader') ||
                        error.message.includes('texture');

    if (isWebGLError) {
      console.warn('WebGL error detected, showing fallback UI');

      // Try to detect specific WebGL issues
      if (error.message.includes('context lost')) {
        console.warn('WebGL context lost - possibly due to GPU memory issues');
      } else if (error.message.includes('shader')) {
        console.warn('WebGL shader compilation failed - possibly driver issues');
      } else if (error.message.includes('texture')) {
        console.warn('WebGL texture creation failed - possibly GPU memory or format issues');
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '2rem',
            borderRadius: '15px',
            border: '2px solid rgba(255,255,255,0.3)',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: '#ff6b6b'
            }}>
              🚨 3D World Unavailable
            </h1>
            <p style={{
              marginBottom: '1.5rem',
              lineHeight: '1.6',
              color: '#e5e7eb'
            }}>
              We're having trouble loading the 3D experience. This might be due to WebGL not being supported on your device or browser.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => {
                  // Fallback to traditional website mode
                  const url = new URL(window.location.href);
                  url.searchParams.set('traditional', 'true');
                  window.location.href = url.toString();
                }}
                style={{
                  background: 'transparent',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📄 View Traditional Site
              </button>
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#9ca3af',
              borderTop: '1px solid rgba(156, 163, 175, 0.3)',
              paddingTop: '1rem'
            }}>
              <strong>Troubleshooting tips:</strong>
              <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                <li>Try refreshing the page</li>
                <li>Update your browser to the latest version</li>
                <li>Enable hardware acceleration in browser settings</li>
                <li>Try a different browser (Chrome, Firefox, Safari)</li>
                {getWebGLTroubleshootingInfo().map((tip, index) => (
                  <li key={index} style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    ⚠️ {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

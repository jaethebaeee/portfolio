import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for Three.js/WebGL components
 * Provides graceful fallback when 3D rendering fails
 */
export class ThreeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js Error Boundary caught an error:', error, errorInfo);

    // Could send to error reporting service here
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: 'white',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            3D Experience Unavailable
          </h2>
          <p style={{ marginBottom: '2rem', maxWidth: '500px' }}>
            We're having trouble loading the 3D portfolio experience.
            This might be due to graphics driver issues or browser compatibility.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Try Again
            </button>
          </div>
          <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '500px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
              Technical Details
            </summary>
            <pre style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}


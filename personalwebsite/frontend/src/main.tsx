import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WebGLErrorBoundary } from './components/UI/WebGLErrorBoundary.tsx'
import { ErrorBoundary } from './components/UI/ErrorBoundary.tsx'
import './index.css'

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WebGLErrorBoundary>
        <App />
      </WebGLErrorBoundary>
    </ErrorBoundary>
  </React.StrictMode>,
)

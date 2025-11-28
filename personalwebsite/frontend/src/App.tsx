import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { useEffect } from 'react';

function App() {
  // Manage body overflow and background
  useEffect(() => {
    const body = document.body;

    // Enhanced gradient background with multiple layers
    body.style.setProperty('background',
      `
        radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, #064e3b 0%, #065f46 30%, #064e3b 70%, #065f46 100%)
      `,
      'important'
    );

    // Add subtle pattern overlay
    body.style.setProperty('background-image',
      `
        radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, #064e3b 0%, #065f46 30%, #064e3b 70%, #065f46 100%),
        radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)
      `,
      'important'
    );

    body.style.setProperty('background-size', '100% 100%, 100% 100%, 100% 100%, 100% 100%, 30px 30px', 'important');
    body.style.setProperty('background-attachment', 'fixed', 'important');

    // Cleanup on unmount
    return () => {
      body.style.background = '';
      body.style.backgroundImage = '';
      body.style.backgroundSize = '';
      body.style.backgroundAttachment = '';
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

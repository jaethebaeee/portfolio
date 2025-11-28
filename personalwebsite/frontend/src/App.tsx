import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { useEffect } from 'react';

function App() {
  // Manage body overflow and background
  useEffect(() => {
    const body = document.body;
    // Always use the green gradient background
    body.style.setProperty('background', 'linear-gradient(135deg, #064e3b 0%, #10b981 45%, #065f46 100%)', 'important');
    body.style.setProperty('background-image', 'none', 'important');
    body.style.setProperty('background-color', 'transparent', 'important');

    // Cleanup on unmount
    return () => {
      body.style.background = '';
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

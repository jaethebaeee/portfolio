import { useState, useEffect } from 'react';
import { MOBILE_BREAKPOINT } from '../components/3D/constants/portfolioConstants';

/**
 * Custom hook for detecting mobile devices based on screen width
 * @returns {boolean} isMobile - Whether the current device is considered mobile
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}


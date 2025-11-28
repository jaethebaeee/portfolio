import { useEffect } from 'react';

// Simple analytics hook for tracking user interactions
export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // In a real app, this would send to analytics service like Google Analytics, Mixpanel, etc.
    console.log('Analytics Event:', eventName, properties);

    // For now, just store in localStorage for demo purposes
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        sessionId: sessionStorage.getItem('session_id') || 'unknown'
      });

      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Analytics storage failed:', error);
    }
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page, referrer: document.referrer });
  };

  const trackChatInteraction = (action: string, details?: Record<string, any>) => {
    trackEvent('chat_interaction', { action, ...details });
  };

  const track3DInteraction = (zone: string, action: string) => {
    trackEvent('3d_interaction', { zone, action });
  };

  const trackContactForm = (action: 'start' | 'submit' | 'success' | 'error') => {
    trackEvent('contact_form', { action });
  };

  // Initialize session
  useEffect(() => {
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', Date.now().toString());
      trackEvent('session_start', {
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer
      });
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackChatInteraction,
    track3DInteraction,
    trackContactForm
  };
};

import { useEffect } from 'react';

// Simple error tracking hook
export const useErrorTracking = () => {
  const trackError = (error: Error, context?: Record<string, any>) => {
    // In a real app, this would send to error tracking service like Sentry, Rollbar, etc.
    console.error('Error Tracked:', error, context);

    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }

      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (storageError) {
      console.warn('Error logging failed:', storageError);
    }
  };

  const trackUnhandledError = (event: ErrorEvent) => {
    trackError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'unhandled_error'
    });
  };

  const trackUnhandledRejection = (event: PromiseRejectionEvent) => {
    trackError(new Error('Unhandled Promise Rejection'), {
      reason: event.reason,
      type: 'unhandled_rejection'
    });
  };

  // Set up global error handlers
  useEffect(() => {
    window.addEventListener('error', trackUnhandledError);
    window.addEventListener('unhandledrejection', trackUnhandledRejection);

    return () => {
      window.removeEventListener('error', trackUnhandledError);
      window.removeEventListener('unhandledrejection', trackUnhandledRejection);
    };
  }, []);

  return { trackError };
};

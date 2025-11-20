import { useEffect, useState } from 'react';

export function DevErrorOverlay() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      setMessage(e.message || String(e.error || 'Unknown error'));
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      // Some errors hide in axios/async, show reason message
      const reason: any = e.reason;
      const msg = reason?.message || reason?.toString?.() || 'Unhandled rejection';
      setMessage(msg);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!message) return null;

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <div style={{ background: '#111827', color: '#fff', padding: 12, border: '2px solid #ef4444', maxWidth: 360, fontFamily: 'monospace' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#f87171' }}>Runtime error</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
      </div>
    </div>
  );
}


export function isSafeMode(): boolean {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('safe') === '1') return true;
  } catch {
    // Ignore URL parsing errors - fall back to default behavior
  }
  // Default to safe mode (frontend-only) if not explicitly disabled
  return import.meta.env.VITE_SAFE_MODE !== '0';
}


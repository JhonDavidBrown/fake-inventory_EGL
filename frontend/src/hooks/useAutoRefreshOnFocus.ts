import { useEffect, useCallback } from 'react';

/**
 * Hook to automatically refresh data when the window/tab gains focus
 * @param refreshFunction - Function to call when refreshing data
 * @param enabled - Whether the auto-refresh is enabled (default: true)
 */
export function useAutoRefreshOnFocus(
  refreshFunction: () => void | Promise<void>,
  enabled = true
) {
  const handleFocus = useCallback(() => {
    if (enabled) {
      console.log('Window focused - triggering auto-refresh');
      refreshFunction();
    }
  }, [refreshFunction, enabled]);

  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && enabled) {
      console.log('Tab became visible - triggering auto-refresh');
      refreshFunction();
    }
  }, [refreshFunction, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Listen for window focus events
    window.addEventListener('focus', handleFocus);
    
    // Listen for visibility change events (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFocus, handleVisibilityChange, enabled]);
}
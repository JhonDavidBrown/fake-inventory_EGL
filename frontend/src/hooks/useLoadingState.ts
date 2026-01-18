import { useState, useCallback } from "react";

export interface LoadingState {
  [key: string]: boolean;
}

export function useLoadingState(initialState: LoadingState = {}) {
  const [loadingStates, setLoadingStates] =
    useState<LoadingState>(initialState);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const resetLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    resetLoading,
  };
}

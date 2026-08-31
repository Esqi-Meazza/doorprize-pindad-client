import { useState, useCallback } from 'react';

export default function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  // Wrapper cerdas: Otomatis set true saat fungsi jalan, dan set false saat selesai/error
  const withLoading = useCallback(async (asyncFunction) => {
    try {
      startLoading();
      return await asyncFunction();
    } finally {
      stopLoading();
    }
  }, []);

  return { isLoading, startLoading, stopLoading, withLoading };
}
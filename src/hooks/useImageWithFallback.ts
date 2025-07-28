import { useState, useCallback } from 'react';

interface UseImageWithFallbackProps {
  photoId: string;
  initialUrl: string;
}

export const useImageWithFallback = ({ photoId, initialUrl }: UseImageWithFallbackProps) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const refreshUrl = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/photos/refresh-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoId }),
      });

      const data = await response.json();
      
      if (data.success && data.data.preview_url) {
        setCurrentUrl(data.data.preview_url);
        setHasError(false);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error('Failed to refresh image URL:', error);
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [photoId, isRefreshing]);

  const handleImageError = useCallback(() => {
    if (!hasError && !isRefreshing) {
      refreshUrl();
    } else {
      setHasError(true);
    }
  }, [hasError, isRefreshing, refreshUrl]);

  return {
    currentUrl,
    isRefreshing,
    hasError,
    handleImageError,
    refreshUrl
  };
};
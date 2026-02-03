import { useEffect, useState, useCallback, useRef } from 'react';
import { useNetworkState } from './useNetworkState';
import { processQueue, getQueueSize } from '../services/offlineQueue';

interface UseOfflineQueueReturn {
  queueSize: number;
  isProcessing: boolean;
  refreshQueueSize: () => Promise<void>;
}

/**
 * Hook that monitors network state and auto-flushes the offline queue
 * when connectivity is restored. Exposes queue size for UI display.
 */
export function useOfflineQueue(): UseOfflineQueueReturn {
  const { isConnected } = useNetworkState();
  const [queueSize, setQueueSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const wasOffline = useRef(false);

  const refreshQueueSize = useCallback(async () => {
    const size = await getQueueSize();
    setQueueSize(size);
  }, []);

  // Track offline→online transitions and process queue
  useEffect(() => {
    if (isConnected === false) {
      wasOffline.current = true;
      refreshQueueSize();
      return;
    }

    if (isConnected === true && wasOffline.current) {
      wasOffline.current = false;

      // Flush the queue
      setIsProcessing(true);
      processQueue()
        .then(() => refreshQueueSize())
        .catch(() => refreshQueueSize())
        .finally(() => setIsProcessing(false));
    }
  }, [isConnected, refreshQueueSize]);

  // Initial load
  useEffect(() => {
    refreshQueueSize();
  }, [refreshQueueSize]);

  return { queueSize, isProcessing, refreshQueueSize };
}

'use client';

import { useEffect, useState } from 'react';

export function useWorkbenchElapsedTime(running: boolean, startedAt: number) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsedMs(0);
      return;
    }
    if (!running) return;

    setElapsedMs(performance.now() - startedAt);
    const timer = window.setInterval(() => setElapsedMs(performance.now() - startedAt), 1000);
    return () => window.clearInterval(timer);
  }, [running, startedAt]);

  return elapsedMs;
}

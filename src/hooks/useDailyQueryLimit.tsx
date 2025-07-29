import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface DailyQueryData {
  date: string;
  count: number;
}

export const useDailyQueryLimit = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [queriesUsed, setQueriesUsed] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Get limits based on user status
  const maxQueries = isSignedIn ? 100 : 30;
  const queriesLeft = Math.max(0, maxQueries - queriesUsed);

  const getTodayKey = () => {
    const today = new Date();
    return `prism_queries_${today.toDateString()}`;
  };

  const loadTodaysQueries = () => {
    if (!isLoaded) return;

    const todayKey = getTodayKey();
    const stored = localStorage.getItem(todayKey);
    
    if (stored) {
      try {
        const data: DailyQueryData = JSON.parse(stored);
        setQueriesUsed(data.count);
        setIsLimitReached(data.count >= maxQueries);
      } catch {
        setQueriesUsed(0);
        setIsLimitReached(false);
      }
    } else {
      setQueriesUsed(0);
      setIsLimitReached(false);
    }
  };

  const incrementQueryCount = () => {
    if (!isLoaded) return false;

    const todayKey = getTodayKey();
    const newCount = queriesUsed + 1;
    
    if (newCount > maxQueries) {
      setIsLimitReached(true);
      return false;
    }

    const data: DailyQueryData = {
      date: new Date().toDateString(),
      count: newCount
    };

    localStorage.setItem(todayKey, JSON.stringify(data));
    setQueriesUsed(newCount);
    setIsLimitReached(newCount >= maxQueries);

    return true;
  };

  useEffect(() => {
    loadTodaysQueries();
  }, [isLoaded, isSignedIn]);

  // Clean up old query data (keep only last 7 days)
  useEffect(() => {
    const cleanupOldData = () => {
      const keys = Object.keys(localStorage);
      const queryKeys = keys.filter(key => key.startsWith('prism_queries_'));
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      queryKeys.forEach(key => {
        const dateStr = key.replace('prism_queries_', '');
        const date = new Date(dateStr);
        if (date < sevenDaysAgo) {
          localStorage.removeItem(key);
        }
      });
    };

    cleanupOldData();
  }, []);

  return {
    queriesUsed,
    queriesLeft,
    maxQueries,
    isLimitReached,
    incrementQueryCount,
    isLoaded
  };
};

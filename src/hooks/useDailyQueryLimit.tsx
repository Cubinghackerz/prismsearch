import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';

export type UsageCategory =
  | 'chatPrompts'
  | 'chatCommands'
  | 'codeGenerations'
  | 'researchWords'
  | 'mathTool'
  | 'physicsTool'
  | 'chemistryTool';

export type UsageSnapshot = Record<UsageCategory, number>;

const DEFAULT_USAGE: UsageSnapshot = {
  chatPrompts: 0,
  chatCommands: 0,
  codeGenerations: 0,
  researchWords: 0,
  mathTool: 0,
  physicsTool: 0,
  chemistryTool: 0,
};

const DAILY_LIMITS: Record<UsageCategory, number> = {
  chatPrompts: 20,
  chatCommands: 10,
  codeGenerations: 5,
  researchWords: 1000,
  mathTool: 5,
  physicsTool: 5,
  chemistryTool: 5,
};

const UNLIMITED_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

interface StoredUsageData {
  date: string;
  usage: UsageSnapshot;
}

const getTodayIdentifier = () => new Date().toDateString();

const createStorageKey = (userKey: string, dateKey: string) =>
  `prism_usage_${userKey}_${dateKey}`;

const createUnlimitedNoticeKey = (userKey: string, dateKey: string) =>
  `prism_unlimited_notice_${userKey}_${dateKey}`;

export const useDailyQueryLimit = () => {
  const { user, isLoaded } = useUser();
  const [usage, setUsage] = useState<UsageSnapshot>(DEFAULT_USAGE);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showUnlimitedDialog, setShowUnlimitedDialog] = useState(false);
  const userId = user?.id;

  const userKey = useMemo(() => {
    if (!isLoaded) {
      return 'guest';
    }
    return userId ?? 'guest';
  }, [isLoaded, userId]);

  const todayKey = getTodayIdentifier();

  const isUnlimitedUser = useMemo(() => {
    if (!isLoaded) {
      return false;
    }
    return userId ? UNLIMITED_USER_IDS.has(userId) : false;
  }, [isLoaded, userId]);

  const storageKey = useMemo(
    () => createStorageKey(userKey, todayKey),
    [userKey, todayKey],
  );

  const loadUsage = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setUsage(DEFAULT_USAGE);
      return;
    }

    try {
      const parsed: StoredUsageData = JSON.parse(stored);
      if (parsed.date !== todayKey) {
        setUsage(DEFAULT_USAGE);
        return;
      }
      setUsage({ ...DEFAULT_USAGE, ...parsed.usage });
    } catch {
      setUsage(DEFAULT_USAGE);
    }
  }, [storageKey, todayKey]);

  const persistUsage = useCallback(
    (next: UsageSnapshot) => {
      if (typeof window === 'undefined') {
        return;
      }

      const payload: StoredUsageData = {
        date: todayKey,
        usage: next,
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
    },
    [storageKey, todayKey],
  );

  const canUse = useCallback(
    (category: UsageCategory, amount = 1) => {
      if (isUnlimitedUser) {
        return true;
      }
      const limit = DAILY_LIMITS[category];
      const current = usage[category] ?? 0;
      return current + amount <= limit;
    },
    [isUnlimitedUser, usage],
  );

  const consume = useCallback(
    (category: UsageCategory, amount = 1) => {
      if (isUnlimitedUser) {
        return true;
      }

      const limit = DAILY_LIMITS[category];
      const current = usage[category] ?? 0;
      if (current + amount > limit) {
        return false;
      }

      const next: UsageSnapshot = {
        ...usage,
        [category]: current + amount,
      };

      setUsage(next);
      persistUsage(next);
      setUpdateTrigger((value) => value + 1);
      return true;
    },
    [isUnlimitedUser, persistUsage, usage],
  );

  const getRemaining = useCallback(
    (category: UsageCategory) => {
      if (isUnlimitedUser) {
        return Infinity;
      }
      const limit = DAILY_LIMITS[category];
      const current = usage[category] ?? 0;
      return Math.max(0, limit - current);
    },
    [isUnlimitedUser, usage],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    loadUsage();
  }, [isLoaded, loadUsage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const keys = Object.keys(localStorage);
    keys
      .filter((key) => key.startsWith('prism_usage_'))
      .forEach((key) => {
        const suffix = key.replace('prism_usage_', '');
        const lastUnderscore = suffix.lastIndexOf('_');
        if (lastUnderscore === -1) {
          return;
        }
        const datePart = suffix.slice(lastUnderscore + 1);
        const parsedDate = new Date(datePart);
        if (Number.isNaN(parsedDate.getTime())) {
          return;
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (parsedDate < sevenDaysAgo) {
          localStorage.removeItem(key);
        }
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') {
      setShowUnlimitedDialog(false);
      return;
    }

    if (!isUnlimitedUser) {
      setShowUnlimitedDialog(false);
      return;
    }

    const noticeKey = createUnlimitedNoticeKey(userKey, todayKey);
    const hasSeenNotice = localStorage.getItem(noticeKey);

    setShowUnlimitedDialog(!hasSeenNotice);
  }, [isLoaded, isUnlimitedUser, todayKey, userKey]);

  const acknowledgeUnlimitedAccess = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const noticeKey = createUnlimitedNoticeKey(userKey, todayKey);
    localStorage.setItem(noticeKey, 'true');
    setShowUnlimitedDialog(false);
  }, [todayKey, userKey]);

  return {
    usage,
    limits: DAILY_LIMITS,
    isUnlimitedUser,
    isLoaded,
    canUse,
    consume,
    getRemaining,
    updateTrigger,
    showUnlimitedDialog,
    acknowledgeUnlimitedAccess,
  };
};

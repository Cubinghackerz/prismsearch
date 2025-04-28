
import { useState, useEffect } from 'react';
import { ModelUsage, ChatModel } from './types';

const DAILY_LIMITS = {
  claude: 10,
  gpt: 10,
  gemini: null, // Unlimited
};

const USAGE_KEY = 'prism_search_ai_usage';
const LAST_USAGE_DATE_KEY = 'prism_search_last_usage_date';

export const useModelUsage = () => {
  const [modelUsage, setModelUsage] = useState<ModelUsage>({
    claude: DAILY_LIMITS.claude || 0,
    gpt: DAILY_LIMITS.gpt || 0,
    gemini: DAILY_LIMITS.gemini,
  });

  useEffect(() => {
    const loadUsageData = () => {
      const today = new Date().toDateString();
      const lastUsageDate = localStorage.getItem(LAST_USAGE_DATE_KEY);
      
      if (lastUsageDate !== today) {
        localStorage.setItem(LAST_USAGE_DATE_KEY, today);
        const resetUsage: ModelUsage = {
          claude: DAILY_LIMITS.claude || 0,
          gpt: DAILY_LIMITS.gpt || 0,
          gemini: DAILY_LIMITS.gemini,
        };
        localStorage.setItem(USAGE_KEY, JSON.stringify(resetUsage));
        setModelUsage(resetUsage);
        return;
      }
      
      const savedUsage = localStorage.getItem(USAGE_KEY);
      if (savedUsage) {
        setModelUsage(JSON.parse(savedUsage));
      }
    };
    
    loadUsageData();
  }, []);

  const updateUsage = (model: ChatModel, remaining: number | null) => {
    if (remaining === null) return;
    
    setModelUsage(prev => {
      const updated = { ...prev, [model]: remaining };
      localStorage.setItem(USAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { modelUsage, updateUsage };
};

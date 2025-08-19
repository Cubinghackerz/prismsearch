
import React, { useEffect, useState } from 'react';
import { Clock, Zap } from 'lucide-react';
import { AIModel } from './ModelSelector';

interface TimeEstimatorProps {
  prompt: string;
  model: AIModel;
  isVisible: boolean;
}

const MODEL_SPEEDS = {
  'gemini-2.5-pro-exp-03-25': { baseTime: 15, complexity: 1.2 },
  'gemini': { baseTime: 8, complexity: 1.0 },
  'groq-llama4-maverick': { baseTime: 12, complexity: 1.1 },
  'groq-llama4-scout': { baseTime: 6, complexity: 0.9 },
  'groq-llama31-8b-instant': { baseTime: 4, complexity: 0.8 },
};

const TimeEstimator: React.FC<TimeEstimatorProps> = ({ prompt, model, isVisible }) => {
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    if (!prompt.trim()) {
      setEstimatedTime(0);
      return;
    }

    const calculateEstimate = () => {
      const modelConfig = MODEL_SPEEDS[model];
      const wordCount = prompt.trim().split(/\s+/).length;
      
      // Base complexity factors
      let complexityMultiplier = 1;
      
      // UI/Design keywords increase time for better quality
      const designKeywords = ['beautiful', 'modern', 'responsive', 'animation', 'gradient', 'interactive', 'dashboard', 'chart', 'graph'];
      const hasDesignFocus = designKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );
      
      if (hasDesignFocus) complexityMultiplier += 0.3;
      
      // Feature complexity
      if (wordCount > 50) complexityMultiplier += 0.2;
      if (prompt.toLowerCase().includes('database')) complexityMultiplier += 0.4;
      if (prompt.toLowerCase().includes('api')) complexityMultiplier += 0.3;
      
      const baseTime = modelConfig.baseTime;
      const finalTime = Math.round(baseTime * modelConfig.complexity * complexityMultiplier);
      
      setEstimatedTime(Math.max(finalTime, 3)); // Minimum 3 seconds
    };

    calculateEstimate();
  }, [prompt, model]);

  if (!isVisible || estimatedTime === 0) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-prism-text-muted bg-prism-surface/20 px-3 py-2 rounded-lg">
      <Clock className="w-4 h-4" />
      <span>Estimated time: ~{estimatedTime}s</span>
      {estimatedTime <= 5 && <Zap className="w-4 h-4 text-yellow-500" />}
    </div>
  );
};

export default TimeEstimator;

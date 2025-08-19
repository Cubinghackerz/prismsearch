
import React, { useEffect, useState } from 'react';
import { Clock, Zap } from 'lucide-react';
import { AIModel } from './ModelSelector';

interface TimeEstimatorProps {
  selectedModel: AIModel;
  prompt: string;
  isGenerating: boolean;
}

const MODEL_SPEEDS = {
  'gemini-2.5-pro-exp-03-25': { baseTime: 8, complexityMultiplier: 1.3 },
  'gemini-2.0-flash-exp': { baseTime: 4, complexityMultiplier: 1.1 },
} as const;

const TimeEstimator: React.FC<TimeEstimatorProps> = ({ selectedModel, prompt, isGenerating }) => {
  const [estimate, setEstimate] = useState<number>(0);

  useEffect(() => {
    const calculateEstimate = () => {
      const modelSpeed = MODEL_SPEEDS[selectedModel] || { baseTime: 6, complexityMultiplier: 1.2 };
      const promptLength = prompt.length;
      const complexityFactor = Math.min(promptLength / 100, 3);
      
      return Math.ceil(modelSpeed.baseTime + (complexityFactor * modelSpeed.complexityMultiplier));
    };

    setEstimate(calculateEstimate());
  }, [selectedModel, prompt]);

  if (!prompt.trim()) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-prism-text-muted">
      {isGenerating ? (
        <>
          <Zap className="w-4 h-4 animate-pulse text-yellow-400" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4" />
          <span>Est. {estimate}s</span>
        </>
      )}
    </div>
  );
};

export default TimeEstimator;


import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type AIModel = 'gemini' | 'groq-llama4-maverick' | 'groq-llama4-scout' | 'groq-llama31-8b-instant' | 'gemini-cli' | 'qwen3-coder' | 'code-llama' | 'deepseek-coder-v2';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
}

const MODEL_OPTIONS = [
  { value: 'gemini' as AIModel, label: 'Gemini 2.5 Flash', description: 'Google\'s latest model - excellent for coding' },
  { value: 'gemini-cli' as AIModel, label: 'Gemini Pro (CLI)', description: 'Google\'s advanced model for code generation' },
  { value: 'qwen3-coder' as AIModel, label: 'Qwen3 Coder 480B', description: 'Open source coding specialist model' },
  { value: 'code-llama' as AIModel, label: 'Code Llama', description: 'Meta\'s specialized code generation model' },
  { value: 'deepseek-coder-v2' as AIModel, label: 'DeepSeek-Coder-V2', description: 'Advanced open source coding model' },
  { value: 'groq-llama4-maverick' as AIModel, label: 'Llama 4 Maverick', description: 'Meta\'s powerful coding model' },
  { value: 'groq-llama4-scout' as AIModel, label: 'Llama 4 Scout', description: 'Fast and efficient for development' },
  { value: 'groq-llama31-8b-instant' as AIModel, label: 'Llama 3.1 8B Instant', description: 'Ultra-fast code generation' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange, disabled }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="model-select" className="text-sm font-medium text-prism-text">
        AI Model
      </Label>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
        <SelectTrigger id="model-select" className="bg-prism-surface/10 border-prism-border">
          <SelectValue placeholder="Select AI model" />
        </SelectTrigger>
        <SelectContent>
          {MODEL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-prism-text-muted">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;

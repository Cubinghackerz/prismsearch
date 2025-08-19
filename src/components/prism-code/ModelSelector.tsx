
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type AIModel = 
  | 'gemini-2.5-pro-exp-03-25' 
  | 'gemini';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
}

const MODEL_OPTIONS = [
  { 
    value: 'gemini-2.5-pro-exp-03-25' as AIModel, 
    label: 'Gemini 2.5 Pro Experimental', 
    description: 'Latest experimental model - exceptional UI design and multi-framework capabilities' 
  },
  { 
    value: 'gemini' as AIModel, 
    label: 'Gemini 2.0 Flash', 
    description: 'Google\'s latest model - excellent for coding and TypeScript' 
  }
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

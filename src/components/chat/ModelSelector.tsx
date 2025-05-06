
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useChat, availableModels } from '@/context/ChatContext';

const ModelSelector = () => {
  const { selectedModel, setSelectedModel } = useChat();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-blue-100 mb-3">Select AI Model</h3>
      <RadioGroup 
        value={selectedModel} 
        onValueChange={setSelectedModel}
        className="space-y-2"
      >
        {availableModels.map(model => (
          <div 
            key={model.id}
            className="flex items-start space-x-2 p-2 rounded-md hover:bg-blue-500/10 transition-colors"
          >
            <RadioGroupItem value={model.id} id={`model-${model.id}`} className="mt-1" />
            <div className="grid gap-0.5">
              <Label htmlFor={`model-${model.id}`} className="text-blue-100 font-medium">
                {model.name}
              </Label>
              <p className="text-xs text-blue-300/70">
                {model.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ModelSelector;

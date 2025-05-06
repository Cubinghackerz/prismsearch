
import React from 'react';
import { Check, Bot, Zap } from 'lucide-react';
import { useChat, ChatModel } from '@/context/ChatContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ModelSelector: React.FC = () => {
  const { selectedModel, selectModel } = useChat();

  const models = [
    { 
      id: 'mistral' as ChatModel, 
      name: 'Mistral Medium', 
      description: 'The balanced model with strong reasoning capabilities',
      icon: Bot
    },
    { 
      id: 'groq' as ChatModel, 
      name: 'Llama-3-70B (Groq)', 
      description: 'Larger and more powerful model hosted on Groq',
      icon: Check
    },
    { 
      id: 'gemini' as ChatModel, 
      name: 'Gemini 2.5 Flash', 
      description: 'Google\'s fastest and most efficient model',
      icon: Zap
    }
  ];

  return (
    <div className="p-2">
      <h3 className="font-medium text-lg mb-4">Select Model</h3>
      <RadioGroup 
        value={selectedModel} 
        onValueChange={(value) => selectModel(value as ChatModel)}
        className="space-y-3"
      >
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <div
              key={model.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                selectedModel === model.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-200 hover:bg-gray-100/10'
              }`}
            >
              <RadioGroupItem value={model.id} id={model.id} className="sr-only" />
              <Label htmlFor={model.id} className="flex items-center gap-3 cursor-pointer flex-1">
                <div className={`p-2 rounded-full ${selectedModel === model.id ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <Icon className={`h-4 w-4 ${selectedModel === model.id ? 'text-white' : 'text-gray-700'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-500">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-blue-500" />
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default ModelSelector;

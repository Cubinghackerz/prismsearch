
import React from 'react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatModel } from '@/context/ChatContext';

interface ModelSelectorProps {
  selectedModel: ChatModel;
  onModelChange: (value: string) => void;
  onNewChat: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange, onNewChat }) => {
  const models = [
    {
      value: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Full development access with VS Code workspace integration and coding tools.',
      badge: { text: 'Pro', color: 'green' as const }
    },
    {
      value: 'gemini',
      name: 'Gemini 2.5 Flash',
      description: 'Fast, responsive model ideal for everyday assistance.',
      badge: { text: 'Active', color: 'green' as const }
    },
    {
      value: 'groq-llama4-maverick',
      name: 'Llama 4 Maverick',
      description: 'Meta\'s latest Llama 4 model with enhanced performance and speed.',
      badge: { text: 'New', color: 'orange' as const }
    },
    {
      value: 'groq-llama31-8b-instant',
      name: 'Llama 3.1 8B Instant',
      description: 'Ultra-fast responses with reliable performance for quick tasks.',
      badge: { text: 'Fast', color: 'yellow' as const }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">AI Model</h3>
        <Button onClick={onNewChat} size="sm" variant="outline" className="text-xs h-8 px-3 border-border/50">
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>
      
      <Alert className="border-border/50 bg-muted/30 backdrop-blur-sm">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs text-muted-foreground">
          Choose your preferred AI model for this conversation
        </AlertDescription>
      </Alert>

      <RadioGroup value={selectedModel} onValueChange={onModelChange} className="space-y-3">
        {models.map((model) => (
          <ModelOption
            key={model.value}
            value={model.value}
            name={model.name}
            description={model.description}
            badge={model.badge}
            isSelected={selectedModel === model.value}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

interface ModelOptionProps {
  value: string;
  name: string;
  description: string;
  badge: { text: string; color: "green" | "yellow" | "orange" };
  isSelected: boolean;
}

const ModelOption: React.FC<ModelOptionProps> = ({ value, name, description, badge, isSelected }) => {
  const getBadgeClass = (color: "green" | "yellow" | "orange") => {
    switch (color) {
      case 'green':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'yellow':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'orange':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: isSelected ? 1.01 : 1 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all backdrop-blur-sm
        ${isSelected 
          ? 'bg-primary/10 border-primary/40 shadow-sm' 
          : 'bg-card/30 border-border/40 hover:bg-card/50 hover:border-border/60'
        }
      `}
    >
      <RadioGroupItem value={value} id={value} className={`mt-0.5 ${isSelected ? 'border-primary text-primary' : 'border-border'}`} />
      <div className="flex-1 min-w-0">
        <Label htmlFor={value} className="cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground text-sm">{name}</span>
            <Badge variant="outline" className={`text-xs border ${getBadgeClass(badge.color)}`}>
              {badge.text}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </Label>
      </div>
    </motion.div>
  );
};

export default ModelSelector;

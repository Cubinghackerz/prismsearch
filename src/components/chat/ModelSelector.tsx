
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatModel } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface ModelSelectorProps {
  selectedModel: ChatModel;
  onModelChange: (value: string) => void;
  onNewChat: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  onNewChat 
}) => {
  return (
    <div className="p-3 border-b border-prism-border bg-prism-primary/5">
      <Alert className="mb-3 py-2 bg-prism-primary/10 border-prism-border text-prism-text-muted text-xs">
        <p>AI Model: {selectedModel}</p>
      </Alert>
      
      <RadioGroup 
        defaultValue={selectedModel} 
        value={selectedModel} 
        onValueChange={onModelChange} 
        className="grid grid-cols-1 gap-2"
      >
        <ModelOption
          value="gemini"
          name="Gemini 2.5"
          description="Google's latest AI model"
          badge={{ text: 'Active', color: 'green' }}
          isSelected={selectedModel === 'gemini'}
        />
        <ModelOption
          value="meta-llama/llama-4-maverick-17b-128e-instruct"
          name="Llama 4 Maverick"
          description="Groq 17B model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'meta-llama/llama-4-maverick-17b-128e-instruct'}
        />
        <ModelOption
          value="meta-llama/llama-4-scout-17b-16e-instruct"
          name="Llama 4 Scout"
          description="Groq 17B model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'meta-llama/llama-4-scout-17b-16e-instruct'}
        />
        <ModelOption
          value="meta-llama/llama-guard-4-12b"
          name="Llama Guard 4"
          description="Groq 12B model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'meta-llama/llama-guard-4-12b'}
        />
        <ModelOption
          value="mistral-saba-24b"
          name="Mistral Saba"
          description="Mistral 24B model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'mistral-saba-24b'}
        />
        <ModelOption
          value="llama3-70b-8192"
          name="Llama3 70B"
          description="Groq 70B model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'llama3-70b-8192'}
        />
        <ModelOption
          value="llama-3.3-70b-versatile"
          name="Llama 3.3 70B"
          description="Groq versatile"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'llama-3.3-70b-versatile'}
        />
        <ModelOption
          value="llama-3.1-8b-instant"
          name="Llama 3.1 8B"
          description="Instant model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'llama-3.1-8b-instant'}
        />
        <ModelOption
          value="llama3-8b-8192"
          name="Llama3 8B"
          description="Groq 8B model"
          badge={{ text: 'Beta', color: 'yellow' }}
          isSelected={selectedModel === 'llama3-8b-8192'}
        />
      </RadioGroup>

      <div className="mt-3 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewChat} 
          className="border-prism-border text-prism-text-muted hover:border-prism-primary/60 transition-all duration-300 bg-transparent text-xs h-8"
        >
          <RefreshCw className="mr-1.5 h-3 w-3" /> New Chat
        </Button>
      </div>
    </div>
  );
};

interface ModelOptionProps {
  value: string;
  name: string;
  description: string;
  badge: {
    text: string;
    color: "green" | "yellow" | "orange";
  };
  isSelected: boolean;
}

const ModelOption: React.FC<ModelOptionProps> = ({ value, name, description, badge, isSelected }) => {
  const badgeColors = {
    green: "bg-green-500/30 text-green-300",
    yellow: "bg-yellow-500/30 text-yellow-300",
    orange: "bg-orange-500/20 text-orange-300",
  };

  return (
    <div className="relative flex items-center">
      <RadioGroupItem value={value} id={value} className="peer sr-only" />
      <motion.label 
        htmlFor={value} 
        animate={isSelected ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.2 }}
        className={`flex flex-col w-full p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'bg-prism-primary/30 border-prism-primary-light ring-1 ring-prism-primary-light/50 shadow-md'
            : 'bg-prism-surface/20 border-prism-border hover:bg-prism-surface/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-prism-text">{name}</span>
          <span className={`px-1.5 py-0.5 text-[10px] ${badgeColors[badge.color]} rounded-full`}>
            {badge.text}
          </span>
        </div>
        <span className="mt-1 text-xs text-prism-text-muted/70">{description}</span>
      </motion.label>
    </div>
  );
};

export default ModelSelector;


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
    <div className="p-3 border-b border-orange-500/40 bg-orange-900/5">
      <Alert className="mb-3 py-2 bg-orange-500/10 border-orange-500/30 text-orange-200 text-xs">
        <p>Select your preferred AI model</p>
      </Alert>
      
      <RadioGroup 
        defaultValue={selectedModel} 
        value={selectedModel} 
        onValueChange={onModelChange} 
        className="grid grid-cols-1 gap-2"
      >
        <ModelOption 
          value="mistral" 
          name="Mistral Medium" 
          description="Efficient AI assistant" 
          badge={{ text: "Recommended", color: "green" }} 
          isSelected={selectedModel === 'mistral'}
        />

        <ModelOption 
          value="mistral-medium-3" 
          name="Mistral Large (24.11)" 
          description="Latest flagship Mistral model" 
          badge={{ text: "New", color: "yellow" }} 
          isSelected={selectedModel === 'mistral-medium-3'}
        />

        <ModelOption 
          value="groq" 
          name="Llama-3-70B" 
          description="High-performance model" 
          badge={{ text: "Fast", color: "orange" }} 
          isSelected={selectedModel === 'groq'}
        />

        <ModelOption 
          value="groq-qwen-qwq" 
          name="Qwen-QwQ" 
          description="Specialized AI model on Groq" 
          badge={{ text: "New", color: "yellow" }} 
          isSelected={selectedModel === 'groq-qwen-qwq'}
        />

        <ModelOption 
          value="groq-llama4-scout" 
          name="Llama 4 Scout" 
          description="Latest Llama model on Groq" 
          badge={{ text: "New", color: "yellow" }} 
          isSelected={selectedModel === 'groq-llama4-scout'}
        />

        <ModelOption 
          value="gemini" 
          name="Gemini 2.5" 
          description="Google's latest AI model" 
          badge={{ text: "Accurate", color: "yellow" }} 
          isSelected={selectedModel === 'gemini'}
        />
        
        {/* Azure OpenAI models temporarily disabled
        <ModelOption 
          value="azure-gpt4-nano" 
          name="GPT-4.1 Nano" 
          description="Azure OpenAI - Efficient" 
          badge={{ text: "Azure", color: "orange" }} 
          isSelected={selectedModel === 'azure-gpt4-nano'}
        />
        
        <ModelOption 
          value="azure-o4-mini" 
          name="O4 Mini" 
          description="Azure OpenAI - Compact" 
          badge={{ text: "Azure", color: "orange" }} 
          isSelected={selectedModel === 'azure-o4-mini'}
        />
        */}
      </RadioGroup>

      <div className="mt-3 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewChat} 
          className="border-orange-500/50 text-orange-200 hover:border-orange-400/60 transition-all duration-300 bg-transparent text-xs h-8"
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
            ? 'bg-orange-600/30 border-orange-400 ring-1 ring-orange-400/50 shadow-md' 
            : 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-800/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-orange-200">{name}</span>
          <span className={`px-1.5 py-0.5 text-[10px] ${badgeColors[badge.color]} rounded-full`}>{badge.text}</span>
        </div>
        <span className="mt-1 text-xs text-orange-300/70">{description}</span>
      </motion.label>
    </div>
  );
};

export default ModelSelector;

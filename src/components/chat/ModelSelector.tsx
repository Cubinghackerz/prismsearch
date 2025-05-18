
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatModel } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

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
    <div className="p-3 border-b border-orange-500/40">
      <Alert className="mb-3 py-2 bg-orange-500/10 border-orange-500/30 text-orange-200 text-xs">
        <p>
          Select your preferred AI model below
        </p>
      </Alert>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-orange-300">Select AI Model:</label>
        <RadioGroup 
          defaultValue={selectedModel} 
          value={selectedModel} 
          onValueChange={onModelChange} 
          className="grid grid-cols-1 gap-2"
        >
          <div className="relative flex items-center">
            <RadioGroupItem value="mistral" id="mistral" className="peer sr-only" />
            <label 
              htmlFor="mistral" 
              className={`flex flex-col w-full p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModel === 'mistral' 
                  ? 'bg-orange-600/30 border-orange-400 ring-1 ring-orange-400/50' 
                  : 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-200">Mistral Medium</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-green-500/30 text-green-300 rounded-full">Recommended</span>
              </div>
              <span className="mt-1 text-xs text-orange-300/70">Efficient AI assistant</span>
            </label>
          </div>

          <div className="relative flex items-center">
            <RadioGroupItem value="groq" id="groq" className="peer sr-only" />
            <label 
              htmlFor="groq" 
              className={`flex flex-col w-full p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModel === 'groq' 
                  ? 'bg-orange-600/30 border-orange-400 ring-1 ring-orange-400/50' 
                  : 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-200">Llama-3-70B</span>
                <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded-full text-[10px]">Fast</span>
              </div>
              <span className="mt-1 text-xs text-orange-300/70">High-performance model</span>
            </label>
          </div>

          <div className="relative flex items-center">
            <RadioGroupItem value="gemini" id="gemini" className="peer sr-only" />
            <label 
              htmlFor="gemini" 
              className={`flex flex-col w-full p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModel === 'gemini' 
                  ? 'bg-orange-600/30 border-orange-400 ring-1 ring-orange-400/50' 
                  : 'bg-orange-900/20 border-orange-500/30 hover:bg-orange-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-200">Gemini 2.5</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/30 text-yellow-300 rounded-full">Accurate</span>
              </div>
              <span className="mt-1 text-xs text-orange-300/70">Google's latest AI model</span>
            </label>
          </div>
        </RadioGroup>
      </div>

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

export default ModelSelector;

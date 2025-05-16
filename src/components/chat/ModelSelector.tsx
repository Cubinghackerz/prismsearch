
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
    <div className="p-4 border-b border-blue-900/40">
      <Alert className="mb-4 bg-blue-500/10 border-blue-500/50 text-blue-300">
        <p className="text-sm">
          Chat mode is experimental and may be unstable. We appreciate your patience as we improve it.
        </p>
      </Alert>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-blue-300">Select AI Model:</label>
        <RadioGroup 
          defaultValue={selectedModel} 
          value={selectedModel} 
          onValueChange={onModelChange} 
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div className="relative flex items-center">
            <RadioGroupItem value="mistral" id="mistral" className="peer sr-only" />
            <label 
              htmlFor="mistral" 
              className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModel === 'mistral' 
                  ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' 
                  : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-200">Mistral Medium</span>
                <span className="px-2 py-1 text-xs bg-green-500/30 text-green-300 rounded-full">Recommended</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm text-blue-300/70">Efficient AI assistant</span>
              </div>
            </label>
          </div>

          <div className="relative flex items-center">
            <RadioGroupItem value="groq" id="groq" className="peer sr-only" />
            <label 
              htmlFor="groq" 
              className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModel === 'groq' 
                  ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' 
                  : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-200">Llama-3-70B (Groq)</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Fast</span>
              </div>
              <span className="mt-1 text-sm text-blue-300/70">High-performance model</span>
            </label>
          </div>

          <div className="relative flex items-center">
            <RadioGroupItem value="gemini" id="gemini" className="peer sr-only" />
            <label 
              htmlFor="gemini" 
              className={`flex flex-col w-full p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedModel === 'gemini' 
                  ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50' 
                  : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-200">Gemini 2.5 Flash Preview</span>
                <span className="px-2 py-1 text-xs bg-yellow-500/30 text-yellow-300 rounded-full">Fast and Accurate</span>
              </div>
              <span className="mt-1 text-sm text-blue-300/70">Google's latest AI model in the works</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewChat} 
          className="border-blue-500/50 text-blue-200 hover:border-blue-400/60 transition-all duration-300 bg-transparent"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
    </div>
  );
};

export default ModelSelector;

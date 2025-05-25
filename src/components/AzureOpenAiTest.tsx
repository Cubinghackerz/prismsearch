
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { generateTextWithAzureOpenAI, generateStreamingTextWithAzureOpenAI, Message } from '@/services/azureOpenAiService';

export default function AzureOpenAiTest() {
  const [prompt, setPrompt] = useState('I am going to Paris, what should I see?');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to generate text.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
        { role: 'user', content: prompt }
      ];
      
      const result = await generateTextWithAzureOpenAI(messages, 'o4-mini');
      setResponse(result);
      
      toast({
        title: "Success",
        description: "Azure OpenAI response generated successfully!",
      });
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error);
      toast({
        title: "Error",
        description: `Failed to generate text: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingTest = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to generate text.",
        variant: "destructive",
      });
      return;
    }
    
    setIsStreaming(true);
    setResponse('');
    
    try {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
        { role: 'user', content: prompt }
      ];
      
      await generateStreamingTextWithAzureOpenAI(
        messages,
        (chunk: string) => {
          setResponse(prev => prev + chunk);
        },
        'o4-mini'
      );
      
      toast({
        title: "Success",
        description: "Azure OpenAI streaming response completed!",
      });
    } catch (error) {
      console.error('Error calling Azure OpenAI streaming:', error);
      toast({
        title: "Error",
        description: `Failed to generate streaming text: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 backdrop-blur-md bg-orange-500/5 border-orange-500/20">
      <CardHeader>
        <CardTitle className="text-orange-200">Azure OpenAI O4-Mini Test</CardTitle>
        <CardDescription className="text-orange-300/70">
          Test the Azure OpenAI o4-mini model integration with your new endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-orange-200">
              Your Prompt
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32 bg-orange-950/30 border-orange-500/30 placeholder:text-orange-300/50 text-orange-100"
              placeholder="Enter your prompt here..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading || isStreaming || !prompt.trim()} 
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Response'
              )}
            </Button>
            
            <Button 
              type="button"
              onClick={handleStreamingTest}
              disabled={isLoading || isStreaming || !prompt.trim()} 
              variant="outline"
              className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Streaming...
                </>
              ) : (
                'Test Streaming'
              )}
            </Button>
          </div>
        </form>
        
        {response && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-orange-200">Generated Response</h3>
            <div className="p-4 rounded-md bg-orange-950/40 border border-orange-500/20 text-orange-100 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

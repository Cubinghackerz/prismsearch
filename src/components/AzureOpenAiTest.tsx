
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Settings, Key, TestTube } from 'lucide-react';
import AzureChatInterface from './chat/AzureChatInterface';
import { supabase } from '@/integrations/supabase/client';

export default function AzureOpenAiTest() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  // Load API key from Supabase secrets on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // In a real app, you'd get this from your backend/edge function
        // For now, we'll check if it's available through the existing edge function
        const { data, error } = await supabase.functions.invoke('azure-openai', {
          body: { 
            messages: [
              { role: 'system', content: 'Test connection' },
              { role: 'user', content: 'Hello' }
            ],
            model: 'o4-mini'
          }
        });

        if (!error) {
          // If the edge function works, we know the API key is set
          setApiKey('configured-in-supabase');
          setShowChat(true);
          toast({
            title: "API Key Loaded",
            description: "Azure OpenAI API key is configured and working.",
            duration: 3000,
          });
        } else {
          toast({
            title: "API Key Missing",
            description: "Azure OpenAI API key needs to be configured in Supabase secrets.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Failed to test API key:', error);
        toast({
          title: "Configuration Error",
          description: "Unable to test Azure OpenAI configuration.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, [toast]);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('azure-openai', {
        body: { 
          messages: [
            { role: 'system', content: 'You are a test assistant.' },
            { role: 'user', content: 'Say "Connection test successful" if you can read this.' }
          ],
          model: 'o4-mini'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.response?.includes('successful')) {
        setShowChat(true);
        setApiKey('configured-in-supabase');
        toast({
          title: "Connection Successful",
          description: "Azure OpenAI O4-Mini is working correctly!",
          duration: 3000,
        });
      } else {
        throw new Error('Unexpected response from Azure OpenAI');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: `Unable to connect to Azure OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-8 backdrop-blur-md bg-orange-500/5 border-orange-500/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-orange-200">Loading Azure OpenAI configuration...</div>
        </CardContent>
      </Card>
    );
  }

  if (!showChat) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-8 backdrop-blur-md bg-orange-500/5 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-orange-200 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Azure OpenAI O4-Mini Setup
          </CardTitle>
          <CardDescription className="text-orange-300/70">
            Configure and test your Azure OpenAI integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Key className="h-4 w-4" />
            <AlertDescription className="text-blue-200">
              Your Azure OpenAI API key should be configured as a Supabase secret named 'AZURE_OPENAI_API_KEY'.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-orange-200">Configuration Details:</h3>
            <div className="text-xs text-orange-300/80 space-y-1">
              <p>• Endpoint: https://punar-maz8m55t-eastus2.cognitiveservices.azure.com/</p>
              <p>• Model: o4-mini</p>
              <p>• API Version: 2025-01-01-preview</p>
            </div>
          </div>

          <Button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Alert className="bg-green-500/10 border-green-500/30 max-w-2xl mx-auto">
        <AlertDescription className="text-green-200">
          Azure OpenAI O4-Mini is connected and ready to use!
        </AlertDescription>
      </Alert>
      
      <AzureChatInterface apiKey={apiKey} />
    </div>
  );
}

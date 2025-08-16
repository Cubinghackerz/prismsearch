
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, Eye, Download, AlertTriangle, Sparkles, Maximize, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import FileViewer from "./FileViewer";

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

const WebAppGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const { toast } = useToast();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini', 'claude-sonnet', 'gpt-4o', 'claude-haiku', 'gpt-4o-mini'];

  const generateWebApp = async (modelToUse: AIModel = selectedModel, isRetry: boolean = false) => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please describe the web app you want to create.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-webapp', {
        body: { 
          prompt,
          model: modelToUse 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setGeneratedApp(data);
      setActiveRightTab('files'); // Switch to files tab after generation
      toast({
        title: "Web App Generated!",
        description: `Your web application has been created successfully using ${modelToUse}.`,
      });
    } catch (error) {
      console.error(`Error generating web app with ${modelToUse}:`, error);
      
      // Try fallback models if the current one fails
      const currentIndex = MODEL_FALLBACK_ORDER.indexOf(modelToUse);
      const nextModel = MODEL_FALLBACK_ORDER[currentIndex + 1];
      
      if (nextModel && !isRetry) {
        toast({
          title: "Trying Alternative Model",
          description: `${modelToUse} failed. Attempting with ${nextModel}...`,
        });
        await generateWebApp(nextModel, true);
        return;
      }
      
      toast({
        title: "Generation Failed",
        description: `Failed to generate web app with all available models: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadApp = () => {
    if (!generatedApp) return;

    const files = [
      { name: 'index.html', content: generatedApp.html },
      { name: 'styles.css', content: generatedApp.css },
      { name: 'script.js', content: generatedApp.javascript },
      { name: 'README.txt', content: `Generated Web App\n\nDescription: ${generatedApp.description}\n\nFeatures:\n${generatedApp.features.map(f => `- ${f}`).join('\n')}` }
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Files Downloaded",
      description: "All web app files have been downloaded to your device.",
    });
  };

  if (isFullscreen && generatedApp) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-prism-border">
            <h2 className="text-xl font-semibold text-prism-text">Fullscreen Preview</h2>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
          <div className="flex-1">
            <WebAppPreview
              html={generatedApp.html}
              css={generatedApp.css}
              javascript={generatedApp.javascript}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
          <Globe className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-fira-code">
              AI Web App Generator
            </h2>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30 font-fira-code">
              Beta
            </span>
          </div>
          <p className="text-prism-text-muted mt-2 font-inter">
            Generate fully functional web applications using multiple AI models
          </p>
        </div>
      </div>

      {/* Beta Warning */}
      <Alert className="border-orange-500/30 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-300">
          <strong>Beta Feature:</strong> This AI generator creates complete web applications with HTML, CSS, and JavaScript. 
          Always review generated code before deployment. This feature uses advanced AI models and may consume significant resources.
        </AlertDescription>
      </Alert>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview (Takes up 2/3 of the space) */}
        <div className="flex-1 lg:flex-[2]">
          {generatedApp ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-prism-text">Live Preview</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Fullscreen
                  </Button>
                  <Button onClick={downloadApp} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <WebAppPreview
                  html={generatedApp.html}
                  css={generatedApp.css}
                  javascript={generatedApp.javascript}
                />
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-20">
                <Globe className="w-16 h-16 text-prism-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-prism-text mb-2">No Web App Generated Yet</h3>
                <p className="text-prism-text-muted">Use the generator on the right to create your web application</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Tabs (Takes up 1/3 of the space) */}
        <div className="w-full lg:w-96 flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator" className="flex items-center space-x-1">
                <Wand2 className="w-4 h-4" />
                <span>Generator</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center space-x-1" disabled={!generatedApp}>
                <FileText className="w-4 h-4" />
                <span>Files</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="flex-1 flex flex-col mt-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5 text-prism-primary" />
                    <span>Describe Your Web App</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={isGenerating}
                  />

                  <div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the web application you want to create... For example: 'Create a todo list app with drag and drop functionality, dark mode toggle, and local storage. Include animations and a modern design.'"
                      className="min-h-[200px] resize-none bg-prism-surface/10 border-prism-border"
                      disabled={isGenerating}
                    />
                  </div>

                  <Button
                    onClick={() => generateWebApp()}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Web App
                      </>
                    )}
                  </Button>

                  {/* Generated App Info */}
                  {generatedApp && (
                    <div className="mt-4 p-3 bg-prism-surface/20 rounded-lg">
                      <h4 className="font-semibold text-prism-text mb-2 text-sm">Description:</h4>
                      <p className="text-prism-text-muted text-xs mb-3">{generatedApp.description}</p>

                      <h4 className="font-semibold text-prism-text mb-2 text-sm">Features:</h4>
                      <ul className="list-disc list-inside text-prism-text-muted text-xs space-y-1">
                        {generatedApp.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="flex-1 mt-4">
              {generatedApp ? (
                <FileViewer generatedApp={generatedApp} />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">Generate a web app to view files</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WebAppGenerator;

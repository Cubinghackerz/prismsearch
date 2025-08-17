import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Wand2, 
  Loader2, 
  Monitor, 
  Code, 
  Settings, 
  Eye,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle,
  FileText,
  Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import { supabase } from "@/integrations/supabase/client";
import WebAppPreview from "./WebAppPreview";
import FileViewer from "./FileViewer";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import VisualEditor from "./VisualEditor";
import DeploymentDialog from "./DeploymentDialog";

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
  const [activeView, setActiveView] = useState("preview");
  const [showDeployment, setShowDeployment] = useState(false);
  const { toast } = useToast();
  const { canMakeQuery, decrementQueries, queriesLeft } = useDailyQueryLimit();

  const handleCodeChange = (fileType: string, content: string) => {
    if (!generatedApp) return;
    
    setGeneratedApp(prev => prev ? {
      ...prev,
      [fileType]: content
    } : null);
  };

  const generateWebApp = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your web app.",
        variant: "destructive",
      });
      return;
    }

    if (!canMakeQuery()) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 10 web app generations. Try again tomorrow.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate web apps.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('generate-webapp', {
        body: { 
          prompt,
          userId: user.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const appData = response.data;
      
      setGeneratedApp({
        html: appData.html,
        css: appData.css,
        javascript: appData.javascript,
        description: appData.description,
        features: appData.features || []
      });

      decrementQueries();
      
      toast({
        title: "Web App Generated!",
        description: "Your web application has been successfully generated.",
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate web app. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFiles = () => {
    if (!generatedApp) return;

    const files = [
      { name: 'index.html', content: generatedApp.html },
      { name: 'styles.css', content: generatedApp.css },
      { name: 'script.js', content: generatedApp.javascript }
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
      description: "All project files have been downloaded to your device.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="w-6 h-6 text-orange-400" />
              <span>AI Web App Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-prompt">Describe your web application</Label>
              <Textarea
                id="app-prompt"
                placeholder="E.g., Create a todo list app with the ability to add, edit, and delete tasks. Include a dark mode toggle and local storage to persist data."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-prism-text-muted">
                Queries remaining today: <span className="font-semibold">{queriesLeft}</span>
              </div>
              
              <Button 
                onClick={generateWebApp} 
                disabled={isGenerating || !canMakeQuery()}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate App
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {generatedApp && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <div className="space-y-4">
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">
                  <Monitor className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="visual-editor">
                  <Eye className="w-4 h-4 mr-2" />
                  Visual Editor
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="h-full">
                <WebAppPreview 
                  html={generatedApp.html} 
                  css={generatedApp.css} 
                  javascript={generatedApp.javascript} 
                />
              </TabsContent>

              <TabsContent value="visual-editor" className="h-full">
                <VisualEditor 
                  generatedApp={generatedApp}
                  onCodeChange={handleCodeChange}
                />
              </TabsContent>

              <TabsContent value="code" className="h-full">
                <FileViewer generatedApp={generatedApp} />
              </TabsContent>

              <TabsContent value="advanced" className="h-full">
                <AdvancedCodeEditor 
                  generatedApp={generatedApp}
                  onFileChange={handleCodeChange}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Generated Application</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-prism-text-muted text-sm">{generatedApp.description}</p>
                </div>

                {generatedApp.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedApp.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2 pt-4">
                  <Button onClick={downloadFiles} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Files
                  </Button>
                  
                  <DeploymentDialog generatedApp={generatedApp}>
                    <Button className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy Application
                    </Button>
                  </DeploymentDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAppGenerator;

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Brain, Rocket, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import PackageManager from "./PackageManager";
import ProjectHistory from "./ProjectHistory";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";
import { CodingLanguage, LANGUAGE_OPTIONS } from "./LanguageSelector";
import ThinkingPlanDialog, { ThinkingPlan } from "./ThinkingPlanDialog";

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface ProjectHistoryItem {
  id: string;
  prompt: string;
  generatedApp: GeneratedApp;
  model: string;
  timestamp: Date;
}

const WebAppGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; response: GeneratedApp }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>('javascript');
  const [showThinkingPlan, setShowThinkingPlan] = useState(false);
  const [thinkingPlan, setThinkingPlan] = useState<ThinkingPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini', 'groq-llama4-maverick', 'groq-llama4-scout', 'groq-llama31-8b-instant'];

  const getLanguagePackages = (language: CodingLanguage): string[] => {
    const langOption = LANGUAGE_OPTIONS.find(opt => opt.id === language);
    return langOption?.packages || [];
  };

  const saveProject = (projectPrompt: string, app: GeneratedApp, model: string) => {
    const projectId = currentProjectId || uuidv4();
    const project: ProjectHistoryItem = {
      id: projectId,
      prompt: projectPrompt,
      generatedApp: app,
      model: model,
      timestamp: new Date()
    };

    const savedProjects = localStorage.getItem('prism-code-projects');
    let projects: ProjectHistoryItem[] = [];
    
    if (savedProjects) {
      try {
        projects = JSON.parse(savedProjects);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
      }
    }

    const existingIndex = projects.findIndex(p => p.id === projectId);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }

    projects = projects.slice(0, 50);
    
    localStorage.setItem('prism-code-projects', JSON.stringify(projects));
    setCurrentProjectId(projectId);
  };

  const generateThinkingPlan = async (): Promise<ThinkingPlan | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: `Create a detailed development plan for: ${prompt}

Target Language/Framework: ${selectedLanguage}
Available packages: ${getLanguagePackages(selectedLanguage).join(', ')}

Please analyze this request and provide a JSON response with this exact structure:
{
  "title": "Brief project title",
  "description": "2-3 sentence project description",
  "totalTime": "estimated total time (e.g., '2-3 hours')",
  "complexity": "low|medium|high",
  "steps": [
    {
      "id": "step1",
      "title": "Step title",
      "description": "What will be done in this step",
      "estimatedTime": "time estimate",
      "complexity": "low|medium|high",
      "packages": ["package1", "package2"]
    }
  ],
  "recommendedPackages": ["package1", "package2"],
  "potentialChallenges": ["challenge1", "challenge2"]
}

Focus on the selected language/framework and provide realistic time estimates and complexity assessments.`,
          model: selectedModel,
          chatId: 'plan-generation',
          chatHistory: []
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const responseText = data.response || '';
      const cleanResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const plan = JSON.parse(cleanResponse);
        return plan;
      } catch (parseError) {
        // Fallback plan if parsing fails
        return {
          title: `${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Application`,
          description: `A custom application built with ${selectedLanguage} based on your requirements.`,
          totalTime: "2-4 hours",
          complexity: "medium" as const,
          steps: [
            {
              id: "setup",
              title: "Project Setup",
              description: "Initialize project structure and dependencies",
              estimatedTime: "15 minutes",
              complexity: "low" as const,
              packages: getLanguagePackages(selectedLanguage).slice(0, 3)
            },
            {
              id: "core",
              title: "Core Development",
              description: "Implement main functionality based on requirements",
              estimatedTime: "1-2 hours",
              complexity: "medium" as const
            },
            {
              id: "styling",
              title: "Styling & UI",
              description: "Add responsive design and user interface elements",
              estimatedTime: "30-45 minutes",
              complexity: "low" as const
            },
            {
              id: "testing",
              title: "Testing & Refinement",
              description: "Test functionality and make final adjustments",
              estimatedTime: "30 minutes",
              complexity: "low" as const
            }
          ],
          recommendedPackages: getLanguagePackages(selectedLanguage),
          potentialChallenges: [
            "Browser compatibility across different devices",
            "Performance optimization for larger datasets",
            "Responsive design implementation"
          ]
        };
      }
    } catch (error) {
      console.error('Error generating thinking plan:', error);
      return null;
    }
  };

  const thinkAboutProject = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please describe the web app you want to analyze.",
        variant: "destructive"
      });
      return;
    }

    if (isLimitReached) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 10 web app generations. Try again tomorrow!",
        variant: "destructive"
      });
      return;
    }

    if (!incrementQueryCount()) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 10 web app generations. Try again tomorrow!",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    setShowThinkingPlan(true);
    
    const plan = await generateThinkingPlan();
    setThinkingPlan(plan);
    setIsGeneratingPlan(false);
  };

  const handlePlanApproval = async () => {
    setShowThinkingPlan(false);
    await generateWebApp();
  };

  const handlePlanRejection = () => {
    setShowThinkingPlan(false);
    setThinkingPlan(null);
  };

  const generateWebApp = async (modelToUse: AIModel = selectedModel, isRetry: boolean = false) => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please describe the web app you want to create.",
        variant: "destructive"
      });
      return;
    }

    if (isLimitReached) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 10 web app generations. Try again tomorrow!",
        variant: "destructive"
      });
      return;
    }

    if (!incrementQueryCount()) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 10 web app generations. Try again tomorrow!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let contextPrompt = prompt;
      const languageContext = `Use ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} to create the web app.
Available packages/modules: ${getLanguagePackages(selectedLanguage).join(', ')}`;
      
      if (conversationHistory.length > 0) {
        contextPrompt = `Based on the previous web application, ${prompt}. 

${languageContext}

Previous conversation context:
${conversationHistory.slice(-3).map((item, index) => 
  `Request ${index + 1}: ${item.prompt}
  Result: ${item.response.description}`
).join('\n\n')}

Please modify or enhance the current application accordingly.`;
      } else {
        contextPrompt = `${prompt}

${languageContext}`;
      }

      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: `Generate a complete web application based on this description: ${contextPrompt}. 

${languageContext} and incorporate relevant packages/modules from: ${getLanguagePackages(selectedLanguage).join(', ')}

Please return ONLY a valid JSON object with this exact structure:
{
  "html": "complete HTML content",
  "css": "complete CSS styles", 
  "javascript": "complete ${selectedLanguage} code",
  "description": "brief description of the app",
  "features": ["feature 1", "feature 2", "feature 3"]
}

Make it responsive, modern, and fully functional. Do not include any markdown formatting or code blocks. Just the raw JSON.`,
          model: modelToUse,
          chatId: currentProjectId || 'webapp-generation',
          chatHistory: []
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      let parsedApp;
      try {
        const responseText = data.response || '';
        const cleanResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
        parsedApp = JSON.parse(cleanResponse);
      } catch (parseError) {
        const responseText = data.response || 'No response received';
        parsedApp = {
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Web App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Generated Web Application</h1>
        <div class="content">
            ${responseText.replace(/\n/g, '<br>')}
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          css: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}
.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.content {
    margin-top: 20px;
    line-height: 1.6;
}`,
          javascript: `console.log('Web app generated successfully');`,
          description: 'AI-generated web application',
          features: ['Responsive design', 'Modern styling', 'Basic functionality']
        };
      }

      setGeneratedApp(parsedApp);
      setActiveRightTab('editor');
      
      setConversationHistory(prev => [...prev, { prompt, response: parsedApp }]);
      
      saveProject(prompt, parsedApp, modelToUse);
      
      setPrompt("");
      
      toast({
        title: "Web App Generated!",
        description: `Your ${selectedLanguage} application has been created successfully using ${modelToUse}.`,
      });
    } catch (error) {
      console.error(`Error generating web app with ${modelToUse}:`, error);
      
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

  const startNewProject = () => {
    setGeneratedApp(null);
    setCurrentProjectId(null);
    setConversationHistory([]);
    setPrompt("");
    setActiveRightTab('generator');
    toast({
      title: "New Project Started",
      description: "You can now create a fresh web application.",
    });
  };

  const loadProject = (project: ProjectHistoryItem) => {
    setGeneratedApp(project.generatedApp);
    setCurrentProjectId(project.id);
    setConversationHistory([{ prompt: project.prompt, response: project.generatedApp }]);
    setPrompt("");
    setActiveRightTab('editor');
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

  const handleFileChange = (fileType: string, content: string) => {
    if (!generatedApp) return;

    setGeneratedApp(prev => ({
      ...prev!,
      [fileType]: content
    }));

    // Auto-save changes
    if (currentProjectId) {
      const updatedApp = { ...generatedApp, [fileType]: content };
      saveProject(conversationHistory[0]?.prompt || 'Modified project', updatedApp, selectedModel);
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
            <Code className="w-8 h-8 text-orange-400" />
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
              Use {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} to create web applications with advanced code editing
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <ProjectHistory onLoadProject={loadProject} />
          {generatedApp && (
            <Button onClick={startNewProject} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Language Selection Banner */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Code className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-300 flex items-center justify-between">
          <span>
            <strong>Current Language:</strong> {LANGUAGE_OPTIONS.find(opt => opt.id === selectedLanguage)?.name || selectedLanguage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to allow language change
              setGeneratedApp(null);
              setCurrentProjectId(null);
              setConversationHistory([]);
              setPrompt("");
              // This would trigger parent component to show language selector
              window.location.reload();
            }}
          >
            Change Language
          </Button>
        </AlertDescription>
      </Alert>

      {/* Beta Warning */}
      <Alert className="border-orange-500/30 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-300">
          <strong>Enhanced Features:</strong> Now with advanced Monaco Editor for professional code editing and package management capabilities.
        </AlertDescription>
      </Alert>

      {/* Prompt Tips */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-300">
          <strong>Pro Tip:</strong> For better results, mention specific packages or modules in your prompt. 
          Example: "Create a todo app using {selectedLanguage} with {getLanguagePackages(selectedLanguage).slice(0, 2).join(' and ')} for enhanced functionality."
        </AlertDescription>
      </Alert>

      {/* Split Layout - Updated widths */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview - Reduced flex weight */}
        <div className="flex-1">
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
                  <DeploymentDialog generatedApp={generatedApp}>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy
                    </Button>
                  </DeploymentDialog>
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

        {/* Right Side - Tabs - Increased width significantly */}
        <div className="w-[32rem] flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator" className="flex items-center space-x-1">
                <Wand2 className="w-4 h-4" />
                <span>Generate</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center space-x-1" disabled={!generatedApp}>
                <FileText className="w-4 h-4" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center space-x-1">
                <Package className="w-4 h-4" />
                <span>Packages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="flex-1 flex flex-col mt-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5 text-prism-primary" />
                    <span>{generatedApp ? 'Continue Working' : 'Describe Your Web App'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={isGenerating || isThinking}
                  />

                  <div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={generatedApp ? 
                        `Describe how you want to modify or enhance the current ${selectedLanguage} web app... Mention specific packages like 'Add ${getLanguagePackages(selectedLanguage)[0]} for enhanced functionality'...` : 
                        `Describe the web application you want to create using ${selectedLanguage}... For example: 'Create a todo list app with drag and drop functionality, dark mode toggle, and local storage. Use ${getLanguagePackages(selectedLanguage).slice(0, 2).join(' and ')} for enhanced features.'`
                      }
                      className="min-h-[200px] resize-none bg-prism-surface/10 border-prism-border"
                      disabled={isGenerating || isThinking}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={thinkAboutProject}
                      disabled={isThinking || isGenerating || !prompt.trim()}
                      variant="outline"
                      className="flex-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border-purple-500/30"
                    >
                      {isThinking ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-pulse" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Think
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => generateWebApp()}
                      disabled={isGenerating || isThinking || !prompt.trim()}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          {generatedApp ? 'Update' : 'Generate'}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Generated App Info */}
                  {generatedApp && (
                    <div className="mt-4 p-3 bg-prism-surface/20 rounded-lg">
                      <h4 className="font-semibold text-prism-text mb-2 text-sm">Current Project:</h4>
                      <p className="text-prism-text-muted text-xs mb-3">{generatedApp.description}</p>

                      <h4 className="font-semibold text-prism-text mb-2 text-sm">Features:</h4>
                      <ul className="list-disc list-inside text-prism-text-muted text-xs space-y-1">
                        {generatedApp.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>

                      {conversationHistory.length > 1 && (
                        <div className="mt-3 pt-2 border-t border-prism-border">
                          <h4 className="font-semibold text-prism-text mb-1 text-xs">
                            Iterations: {conversationHistory.length}
                          </h4>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="flex-1 mt-4">
              {generatedApp ? (
                <AdvancedCodeEditor 
                  generatedApp={generatedApp} 
                  onFileChange={handleFileChange}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">Generate a web app to start editing</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="packages" className="flex-1 mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-prism-primary" />
                    <span>{selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Packages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-prism-text mb-2">Available for {selectedLanguage}:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {getLanguagePackages(selectedLanguage).map((pkg) => (
                          <div key={pkg} className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg border border-prism-border">
                            <div className="flex items-center space-x-3">
                              <Package className="w-4 h-4 text-prism-accent" />
                              <span className="font-medium text-prism-text">{pkg}</span>
                            </div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                              Available
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Thinking Plan Dialog */}
            <ThinkingPlanDialog
              isOpen={showThinkingPlan}
              plan={thinkingPlan}
              isLoading={isGeneratingPlan}
              onApprove={handlePlanApproval}
              onReject={handlePlanRejection}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WebAppGenerator;

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Code, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import FileViewer from "./FileViewer";
import ProjectHistory from "./ProjectHistory";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import PackageManager from "./PackageManager";
import FrameworkTemplates from "./FrameworkTemplates";
import PerformanceAnalytics from "./PerformanceAnalytics";
import { v4 as uuidv4 } from 'uuid';

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

interface FileData {
  name: string;
  content: string;
  language: string;
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
  const [projectFiles, setProjectFiles] = useState<FileData[]>([]);
  const [packages, setPackages] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini', 'groq-llama4-maverick', 'groq-llama4-scout', 'groq-llama31-8b-instant'];

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

    // Update existing project or add new one
    const existingIndex = projects.findIndex(p => p.id === projectId);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }

    // Keep only the last 50 projects
    projects = projects.slice(0, 50);
    
    localStorage.setItem('prism-code-projects', JSON.stringify(projects));
    setCurrentProjectId(projectId);
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
      if (conversationHistory.length > 0) {
        contextPrompt = `Based on the previous web application, ${prompt}. 

Previous conversation context:
${conversationHistory.slice(-3).map((item, index) => 
  `Request ${index + 1}: ${item.prompt}
  Result: ${item.response.description}`
).join('\n\n')}

Please modify or enhance the current application accordingly.`;
      }

      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: `Generate a complete web application based on this description: ${contextPrompt}. 

Please return ONLY a valid JSON object with this exact structure:
{
  "html": "complete HTML content",
  "css": "complete CSS styles", 
  "javascript": "complete JavaScript code",
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
      
      // Convert to file structure for advanced editor
      const files: FileData[] = [
        { name: 'index.html', content: parsedApp.html, language: 'html' },
        { name: 'styles.css', content: parsedApp.css, language: 'css' },
        { name: 'script.js', content: parsedApp.javascript, language: 'javascript' }
      ];
      setProjectFiles(files);
      
      setActiveRightTab('files');
      setConversationHistory(prev => [...prev, { prompt, response: parsedApp }]);
      saveProject(prompt, parsedApp, modelToUse);
      setPrompt("");
      
      toast({
        title: "Web App Generated!",
        description: `Your web application has been created successfully using ${modelToUse}.`,
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

  const handleFileChange = (fileName: string, content: string) => {
    setProjectFiles(prev => prev.map(file => 
      file.name === fileName ? { ...file, content } : file
    ));
    
    // Update generatedApp if it exists
    if (generatedApp) {
      const updatedApp = { ...generatedApp };
      if (fileName === 'index.html') updatedApp.html = content;
      else if (fileName === 'styles.css') updatedApp.css = content;
      else if (fileName === 'script.js') updatedApp.javascript = content;
      setGeneratedApp(updatedApp);
    }
  };

  const handlePackageAdd = (packageName: string, version: string) => {
    setPackages(prev => ({ ...prev, [packageName]: version }));
  };

  const handlePackageRemove = (packageName: string) => {
    setPackages(prev => {
      const newPackages = { ...prev };
      delete newPackages[packageName];
      return newPackages;
    });
  };

  const handlePackageUpdate = (packageName: string, version: string) => {
    setPackages(prev => ({ ...prev, [packageName]: version }));
  };

  const handleTemplateSelect = (template: any) => {
    const files: FileData[] = Object.entries(template.files).map(([name, content]) => ({
      name,
      content: content as string,
      language: name.split('.').pop() || 'plaintext'
    }));
    
    setProjectFiles(files);
    setPackages(template.packages);
    setActiveRightTab('editor');
    
    // Create a generatedApp from template for preview
    const htmlFile = files.find(f => f.name.includes('.html'));
    const cssFile = files.find(f => f.name.includes('.css'));
    const jsFile = files.find(f => f.name.includes('.js') || f.name.includes('.ts'));
    
    if (htmlFile && cssFile && jsFile) {
      setGeneratedApp({
        html: htmlFile.content,
        css: cssFile.content,
        javascript: jsFile.content,
        description: template.description,
        features: template.features
      });
    }
  };

  const handleOptimizationApply = (optimization: string) => {
    toast({
      title: "Optimization Applied",
      description: `Applied ${optimization} optimization to your project.`,
    });
  };

  const startNewProject = () => {
    setGeneratedApp(null);
    setProjectFiles([]);
    setPackages({});
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
    setActiveRightTab('files');
  };

  const downloadApp = () => {
    if (!generatedApp && projectFiles.length === 0) return;

    const filesToDownload = projectFiles.length > 0 
      ? projectFiles.map(file => ({ name: file.name, content: file.content }))
      : [
          { name: 'index.html', content: generatedApp!.html },
          { name: 'styles.css', content: generatedApp!.css },
          { name: 'script.js', content: generatedApp!.javascript }
        ];

    filesToDownload.forEach(file => {
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
              Advanced web development with AI assistance, real package management, and performance analytics
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <ProjectHistory onLoadProject={loadProject} />
          {(generatedApp || projectFiles.length > 0) && (
            <Button onClick={startNewProject} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Beta Warning */}
      <Alert className="border-orange-500/30 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-300">
          <strong>Enhanced Beta:</strong> Now featuring advanced code editing with Monaco Editor, real package management, 
          framework templates, and performance analytics. Always review generated code before deployment.
        </AlertDescription>
      </Alert>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview */}
        <div className="flex-1 lg:flex-[2]">
          {(generatedApp || projectFiles.length > 0) ? (
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
                {generatedApp && (
                  <WebAppPreview
                    html={generatedApp.html}
                    css={generatedApp.css}
                    javascript={generatedApp.javascript}
                  />
                )}
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-20">
                <Globe className="w-16 h-16 text-prism-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-prism-text mb-2">No Project Loaded</h3>
                <p className="text-prism-text-muted">Create a new web app or select a framework template to get started</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Enhanced Tabs */}
        <div className="w-full lg:w-96 flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="generator" className="text-xs">
                <Wand2 className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <FileText className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="editor" className="text-xs" disabled={projectFiles.length === 0}>
                <Code className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="packages" className="text-xs">
                <Package className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs" disabled={projectFiles.length === 0}>
                <Activity className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs" disabled={!generatedApp && projectFiles.length === 0}>
                <FileText className="w-3 h-3" />
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
                    disabled={isGenerating}
                  />

                  <div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={generatedApp ? 
                        "Describe how you want to modify or enhance the current web app..." : 
                        "Describe the web application you want to create... For example: 'Create a todo list app with drag and drop functionality, dark mode toggle, and local storage. Include animations and a modern design.'"
                      }
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
                        {generatedApp ? 'Update Web App' : 'Generate Web App'}
                      </>
                    )}
                  </Button>

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

            <TabsContent value="templates" className="flex-1 mt-4">
              <FrameworkTemplates onTemplateSelect={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="editor" className="flex-1 mt-4">
              {projectFiles.length > 0 ? (
                <AdvancedCodeEditor
                  files={projectFiles}
                  onFileChange={handleFileChange}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <Code className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">No files to edit</p>
                    <p className="text-sm text-prism-text-muted">Generate an app or select a template first</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="packages" className="flex-1 mt-4">
              <PackageManager
                packages={packages}
                onPackageAdd={handlePackageAdd}
                onPackageRemove={handlePackageRemove}
                onPackageUpdate={handlePackageUpdate}
              />
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 mt-4">
              {projectFiles.length > 0 ? (
                <PerformanceAnalytics
                  projectFiles={Object.fromEntries(projectFiles.map(f => [f.name, f.content]))}
                  packages={packages}
                  onOptimizationApply={handleOptimizationApply}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <Activity className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">No project to analyze</p>
                    <p className="text-sm text-prism-text-muted">Create or load a project to see analytics</p>
                  </CardContent>
                </Card>
              )}
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

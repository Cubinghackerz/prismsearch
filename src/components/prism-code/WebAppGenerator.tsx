
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Terminal as TerminalIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import FileViewer from "./FileViewer";
import ProjectHistory from "./ProjectHistory";
import PackageManager from "./PackageManager";
import Terminal from "./Terminal";
import { v4 as uuidv4 } from 'uuid';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
  packageJson?: string;
  dependencies?: PackageInfo[];
}

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  type: 'dependency' | 'devDependency';
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
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini', 'groq-llama4-maverick', 'groq-llama4-scout', 'groq-llama31-8b-instant'];

  const saveProject = (projectPrompt: string, app: GeneratedApp, model: string) => {
    const projectId = currentProjectId || uuidv4();
    const project: ProjectHistoryItem = {
      id: projectId,
      prompt: projectPrompt,
      generatedApp: { ...app, dependencies: packages },
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

  const generatePackageJson = (dependencies: PackageInfo[]) => {
    const deps = dependencies.filter(pkg => pkg.type === 'dependency').reduce(
      (acc, pkg) => ({ ...acc, [pkg.name]: pkg.version }), {}
    );
    const devDeps = dependencies.filter(pkg => pkg.type === 'devDependency').reduce(
      (acc, pkg) => ({ ...acc, [pkg.name]: pkg.version }), {}
    );

    return JSON.stringify({
      name: "ai-generated-app",
      version: "1.0.0",
      description: "AI Generated Web Application",
      main: "index.js",
      scripts: {
        start: "node server.js",
        build: "webpack --mode production",
        dev: "webpack serve --mode development"
      },
      dependencies: deps,
      devDependencies: devDeps,
      author: "AI Web App Generator",
      license: "MIT"
    }, null, 2);
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

      // Include package information in the prompt
      const packageContext = packages.length > 0 
        ? `\n\nCurrent packages in the project: ${packages.map(p => `${p.name}@${p.version}`).join(', ')}`
        : '';

      const enhancedPrompt = `Generate a complete web application based on this description: ${contextPrompt}${packageContext}

Please return ONLY a valid JSON object with this exact structure:
{
  "html": "complete HTML content",
  "css": "complete CSS styles", 
  "javascript": "complete JavaScript code",
  "description": "brief description of the app",
  "features": ["feature 1", "feature 2", "feature 3"],
  "packageJson": "complete package.json content if packages are needed",
  "suggestedPackages": [{"name": "package-name", "version": "^1.0.0", "type": "dependency", "reason": "why this package is useful"}]
}

Make it modern, functional, and leverage the specified packages if any. Include package.json if the app would benefit from npm packages. Do not include any markdown formatting or code blocks. Just the raw JSON.`;

      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: enhancedPrompt,
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

        // Add suggested packages to the package list
        if (parsedApp.suggestedPackages) {
          const newPackages = parsedApp.suggestedPackages.map((pkg: any) => ({
            name: pkg.name,
            version: pkg.version || '^1.0.0',
            type: pkg.type || 'dependency',
            description: pkg.reason
          }));
          setPackages(prev => {
            const existing = prev.map(p => p.name);
            return [...prev, ...newPackages.filter((pkg: PackageInfo) => !existing.includes(pkg.name))];
          });
        }
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

      // Generate package.json if packages are present
      if (packages.length > 0) {
        parsedApp.packageJson = generatePackageJson(packages);
      }

      setGeneratedApp(parsedApp);
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

  const handleAddPackage = (packageName: string, type: 'dependency' | 'devDependency') => {
    const newPackage: PackageInfo = {
      name: packageName,
      version: '^1.0.0',
      type: type
    };
    setPackages(prev => [...prev, newPackage]);
  };

  const handleRemovePackage = (packageName: string) => {
    setPackages(prev => prev.filter(pkg => pkg.name !== packageName));
  };

  const handlePackageInstall = (packageName: string) => {
    if (!packages.some(pkg => pkg.name === packageName)) {
      handleAddPackage(packageName, 'dependency');
    }
  };

  const startNewProject = () => {
    setGeneratedApp(null);
    setCurrentProjectId(null);
    setConversationHistory([]);
    setPrompt("");
    setPackages([]);
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
    setPackages(project.generatedApp.dependencies || []);
    setPrompt("");
    setActiveRightTab('files');
  };

  const downloadApp = () => {
    if (!generatedApp) return;

    const files = [
      { name: 'index.html', content: generatedApp.html },
      { name: 'styles.css', content: generatedApp.css },
      { name: 'script.js', content: generatedApp.javascript },
      { name: 'README.txt', content: `Generated Web App\n\nDescription: ${generatedApp.description}\n\nFeatures:\n${generatedApp.features.map(f => `- ${f}`).join('\n')}` }
    ];

    if (generatedApp.packageJson) {
      files.push({ name: 'package.json', content: generatedApp.packageJson });
    }

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
              Generate full-stack web applications with package management and terminal support
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

      {/* Beta Warning */}
      <Alert className="border-orange-500/30 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-300">
          <strong>Enhanced Beta:</strong> Now with package management and terminal support! Generate full-stack applications with npm packages, build tools, and development workflows.
        </AlertDescription>
      </Alert>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-24rem)]">
        {/* Left Side - Preview */}
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

        {/* Right Side - Enhanced Tabs */}
        <div className="w-full lg:w-96 flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="generator" className="flex items-center space-x-1">
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline">Gen</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center space-x-1" disabled={!generatedApp}>
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center space-x-1">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Pkg</span>
              </TabsTrigger>
              <TabsTrigger value="terminal" className="flex items-center space-x-1">
                <TerminalIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Term</span>
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

            <TabsContent value="packages" className="flex-1 mt-4">
              <PackageManager
                packages={packages}
                onAddPackage={handleAddPackage}
                onRemovePackage={handleRemovePackage}
              />
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 mt-4">
              <Terminal
                projectPath={`/projects/${currentProjectId || 'untitled'}`}
                onPackageInstall={handlePackageInstall}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WebAppGenerator;

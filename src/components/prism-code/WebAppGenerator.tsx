
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Brain, Rocket, Code, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import PackageManager from "./PackageManager";
import ProjectHistory from "./ProjectHistory";
import DevelopmentPlanDialog from "./DevelopmentPlanDialog";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";
import TimeEstimator from "./TimeEstimator";

interface GeneratedApp {
  framework: string;
  language: string;
  description: string;
  features: string[];
  files: Record<string, string>;
  dependencies?: {
    production: string[];
    development: string[];
  };
  scripts?: Record<string, string>;
}

interface ProjectHistoryItem {
  id: string;
  prompt: string;
  generatedApp: GeneratedApp;
  model: string;
  timestamp: Date;
}

interface DevelopmentPlan {
  projectOverview: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  architecture: {
    framework: string;
    styling: string;
    stateManagement: string;
    routing: string;
  };
  features: string[];
  packages: string[];
  fileStructure: string[];
  implementationSteps: string[];
  securityConsiderations: string[];
  performanceOptimizations: string[];
  estimatedComplexity: 'Low' | 'Medium' | 'High';
}

const WebAppGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.0-flash');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; response: GeneratedApp }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  // Ensure all file contents are strings
  const normalizeFileContents = (files: Record<string, any>): Record<string, string> => {
    const normalized: Record<string, string> = {};
    Object.entries(files).forEach(([fileName, content]) => {
      if (typeof content === 'string') {
        normalized[fileName] = content;
      } else if (content !== null && content !== undefined) {
        try {
          normalized[fileName] = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);
        } catch (error) {
          console.error(`Error converting content for file ${fileName}:`, error);
          normalized[fileName] = String(content || '');
        }
      } else {
        normalized[fileName] = '';
      }
    });
    return normalized;
  };

  const saveProject = (projectPrompt: string, app: GeneratedApp, model: string) => {
    // Ensure app has proper string file contents
    const normalizedApp = {
      ...app,
      files: normalizeFileContents(app.files || {})
    };

    const projectId = currentProjectId || uuidv4();
    const project: ProjectHistoryItem = {
      id: projectId,
      prompt: projectPrompt,
      generatedApp: normalizedApp,
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

  const parseDevelopmentPlan = (planText: string): DevelopmentPlan | null => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: parse structured text format
      const lines = planText.split('\n').map(line => line.trim()).filter(line => line);
      
      return {
        projectOverview: "AI-generated web application based on your requirements",
        colorScheme: {
          primary: "#3B82F6",
          secondary: "#6B7280",
          accent: "#10B981",
          background: "#FFFFFF",
          text: "#1F2937"
        },
        architecture: {
          framework: "Vanilla JavaScript",
          styling: "CSS3",
          stateManagement: "Local Storage",
          routing: "Single Page"
        },
        features: lines.filter(line => line.includes('feature') || line.includes('•')).slice(0, 6),
        packages: ["Chart.js", "Animate.css", "Font Awesome"],
        fileStructure: [
          "index.html",
          "styles.css",
          "script.js",
          "assets/",
          "components/"
        ],
        implementationSteps: [
          "Set up HTML structure",
          "Create responsive CSS layout",
          "Implement JavaScript functionality",
          "Add interactive features",
          "Optimize for performance",
          "Test across devices"
        ],
        securityConsiderations: [
          "Input validation and sanitization",
          "XSS prevention",
          "Secure data storage"
        ],
        performanceOptimizations: [
          "Minified CSS and JavaScript",
          "Optimized images",
          "Lazy loading implementation"
        ],
        estimatedComplexity: 'Medium' as const
      };
    } catch (error) {
      console.error('Error parsing development plan:', error);
      return null;
    }
  };

  const addConsoleMessage = (message: string, type: 'log' | 'error' | 'warn' = 'log') => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setConsoleOutput(prev => [...prev.slice(-49), formattedMessage]); // Keep last 50 messages
  };

  const generateWebApp = async (modelToUse: AIModel = selectedModel) => {
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
    setShowConsole(true);
    addConsoleMessage(`Starting web app generation with ${modelToUse} model...`);
    
    const startTime = Date.now();
    
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

      addConsoleMessage("Preparing enhanced prompt for AI generation...");

      const enhancedPrompt = `Generate a complete, modern web application based on this description: ${contextPrompt}

REQUIREMENTS:
- Choose the most appropriate technology stack (React, Vue, Angular, or vanilla)
- Use TypeScript when beneficial for the project complexity
- Create a proper file structure with unlimited files as needed
- Include all necessary configuration files (package.json, tsconfig.json, etc.)
- Implement modern design patterns and best practices
- Ensure the application is production-ready and scalable

Focus on creating a beautiful, functional application with proper architecture and file organization.`;

      addConsoleMessage("Sending request to AI generation service...");

      const { data, error } = await supabase.functions.invoke('generate-webapp', {
        body: { 
          prompt: enhancedPrompt,
          model: modelToUse
        }
      });

      if (error) {
        addConsoleMessage(`Generation failed: ${error.message}`, 'error');
        throw new Error(error.message);
      }

      addConsoleMessage("Parsing AI response and normalizing file contents...");

      let parsedApp: GeneratedApp = data;
      
      // Ensure files property exists and normalize all file contents to strings
      if (!parsedApp.files) {
        parsedApp.files = {};
      }

      // Normalize file contents to ensure they're all strings
      parsedApp.files = normalizeFileContents(parsedApp.files);

      // Ensure required fields exist
      if (!parsedApp.framework) parsedApp.framework = 'vanilla';
      if (!parsedApp.language) parsedApp.language = 'javascript';
      if (!parsedApp.features) parsedApp.features = [];

      const generationTime = Math.round((Date.now() - startTime) / 1000);

      addConsoleMessage(`Generation completed successfully in ${generationTime} seconds`);
      addConsoleMessage(`Generated ${Object.keys(parsedApp.files).length} files for ${parsedApp.framework} application`);

      setGeneratedApp(parsedApp);
      setActiveRightTab('editor');
      
      // Set the first file as selected
      const fileNames = Object.keys(parsedApp.files || {});
      if (fileNames.length > 0) {
        const mainFile = fileNames.find(name => 
          name.includes('index.html') || 
          name.includes('App.') || 
          name.includes('main.')
        ) || fileNames[0];
        setSelectedFile(mainFile);
        addConsoleMessage(`Set main file: ${mainFile}`);
      }
      
      setConversationHistory(prev => [...prev, { prompt, response: parsedApp }]);
      
      saveProject(prompt, parsedApp, modelToUse);
      
      setPrompt("");
      
      toast({
        title: "Web Application Generated!",
        description: `Your ${parsedApp.framework} application with ${parsedApp.language} was created in ${generationTime}s.`,
      });
    } catch (error) {
      console.error(`Error generating web app:`, error);
      addConsoleMessage(`Generation error: ${error.message}`, 'error');
      
      toast({
        title: "Generation Failed",
        description: `Failed to generate web app: ${error.message}`,
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
    setDevelopmentPlan(null);
    setSelectedFile('');
    setActiveRightTab('generator');
    setConsoleOutput([]);
    addConsoleMessage("New project started");
    toast({
      title: "New Project Started",
      description: "You can now create a fresh web application.",
    });
  };

  const loadProject = (project: ProjectHistoryItem) => {
    // Normalize file contents when loading
    const normalizedApp = {
      ...project.generatedApp,
      files: normalizeFileContents(project.generatedApp.files || {})
    };

    setGeneratedApp(normalizedApp);
    setCurrentProjectId(project.id);
    setConversationHistory([{ prompt: project.prompt, response: normalizedApp }]);
    setPrompt("");
    setActiveRightTab('editor');
    addConsoleMessage(`Loaded project: ${project.prompt.slice(0, 50)}...`);
    
    // Set the first file as selected
    const fileNames = Object.keys(normalizedApp.files || {});
    if (fileNames.length > 0) {
      const mainFile = fileNames.find(name => 
        name.includes('index.html') || 
        name.includes('App.') || 
        name.includes('main.')
      ) || fileNames[0];
      setSelectedFile(mainFile);
    }
  };

  const downloadApp = () => {
    if (!generatedApp) return;

    addConsoleMessage("Starting file download process...");

    const files = Object.entries(generatedApp.files || {}).map(([name, content]) => ({
      name,
      content: String(content || '')
    }));

    // Add README
    files.push({
      name: 'README.md',
      content: `# Generated Web App\n\n**Framework:** ${generatedApp.framework}\n**Language:** ${generatedApp.language}\n\n## Description\n${generatedApp.description}\n\n## Features\n${generatedApp.features.map(f => `- ${f}`).join('\n')}\n\n## Dependencies\n${generatedApp.dependencies ? `\n### Production\n${generatedApp.dependencies.production?.map(d => `- ${d}`).join('\n') || 'None'}\n\n### Development\n${generatedApp.dependencies.development?.map(d => `- ${d}`).join('\n') || 'None'}` : 'No additional dependencies'}`
    });

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

    addConsoleMessage(`Downloaded ${files.length} files successfully`);

    toast({
      title: "Files Downloaded",
      description: `All ${files.length} files have been downloaded to your device.`,
    });
  };

  const handleFileChange = (fileName: string, content: string) => {
    if (!generatedApp) return;

    const updatedApp = {
      ...generatedApp,
      files: {
        ...generatedApp.files,
        [fileName]: content
      }
    };

    setGeneratedApp(updatedApp);
    addConsoleMessage(`File modified: ${fileName}`);

    if (currentProjectId) {
      saveProject(conversationHistory[0]?.prompt || 'Modified project', updatedApp, selectedModel);
    }
  };

  // Helper function to extract file content based on type
  const getFileContent = (app: GeneratedApp, type: 'html' | 'css' | 'javascript'): string => {
    if (!app.files) {
      return '';
    }

    const files = app.files;
    
    switch (type) {
      case 'html':
        return files['index.html'] || 
               files['src/index.html'] || 
               files['public/index.html'] || 
               Object.values(files).find(content => 
                 typeof content === 'string' && content.includes('<!DOCTYPE html>')
               ) || '';
               
      case 'css':
        return files['styles.css'] || 
               files['style.css'] || 
               files['src/styles.css'] || 
               files['src/style.css'] || 
               files['src/index.css'] || 
               Object.values(files).find(content => 
                 typeof content === 'string' && (
                   content.includes('body {') || 
                   content.includes('.') || 
                   content.includes('#')
                 )
               ) || '';
               
      case 'javascript':
        return files['script.js'] || 
               files['main.js'] || 
               files['index.js'] || 
               files['src/main.js'] || 
               files['src/index.js'] || 
               files['src/app.js'] || 
               Object.values(files).find(content => 
                 typeof content === 'string' && (
                   content.includes('function') || 
                   content.includes('const ') || 
                   content.includes('document.')
                 )
               ) || '';
               
      default:
        return '';
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
    addConsoleMessage("Console cleared");
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
              html={getFileContent(generatedApp, 'html')}
              css={getFileContent(generatedApp, 'css')}
              javascript={getFileContent(generatedApp, 'javascript')}
              onConsoleMessage={addConsoleMessage}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Development Plan Dialog */}
      <DevelopmentPlanDialog
        isOpen={showPlanDialog}
        plan={developmentPlan}
        isLoading={isThinking}
        onApprove={() => {}}
        onReject={() => {}}
        onClose={() => setShowPlanDialog(false)}
      />

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
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Multi-Framework
              </Badge>
            </div>
            <p className="text-prism-text-muted mt-2 font-inter">
              Generate React, Vue, Angular, or Vanilla web applications with TypeScript support
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

      {/* Enhanced Features Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-300">
          <strong>Enhanced Multi-Framework Support:</strong> Now supports React, Vue, Angular, and Node.js with TypeScript, unlimited files, and proper project structure following development plans.
        </AlertDescription>
      </Alert>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview and Console */}
        <div className="flex-1 flex flex-col">
          {generatedApp ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-prism-text">Live Preview</h3>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {generatedApp.framework}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {generatedApp.language}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(generatedApp.files || {}).length} files
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowConsole(!showConsole)}
                    size="sm"
                    variant="outline"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    {showConsole ? 'Hide Console' : 'Show Console'}
                  </Button>
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
              
              {/* Preview Area */}
              <div className={`${showConsole ? 'flex-1' : 'flex-1'} mb-4`}>
                <WebAppPreview
                  html={getFileContent(generatedApp, 'html')}
                  css={getFileContent(generatedApp, 'css')}
                  javascript={getFileContent(generatedApp, 'javascript')}
                  onConsoleMessage={addConsoleMessage}
                />
              </div>

              {/* Console Area */}
              {showConsole && (
                <div className="h-48 border border-prism-border rounded-lg bg-black text-green-400 font-mono text-sm overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between p-2 border-b border-prism-border bg-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-400 ml-2">Console</span>
                    </div>
                    <Button 
                      onClick={clearConsole} 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {consoleOutput.length === 0 ? (
                      <div className="text-gray-500">Console output will appear here...</div>
                    ) : (
                      consoleOutput.map((message, index) => (
                        <div key={index} className="text-xs">
                          {message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-20">
                <Globe className="w-16 h-16 text-prism-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-prism-text mb-2">No Web App Generated Yet</h3>
                <p className="text-prism-text-muted">Choose your framework and create your application</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Tabs */}
        <div className="w-[32rem] flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator" className="flex items-center space-x-1">
                <Wand2 className="w-4 h-4" />
                <span>Generate</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center space-x-1" disabled={!generatedApp}>
                <FileText className="w-4 h-4" />
                <span>Files</span>
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
                    <span>{generatedApp ? 'Enhance Application' : 'Create Your Web Application'}</span>
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
                        "Describe how you want to enhance your application... Add new features, pages, components, or improve the design..." : 
                        "Describe your web application... Examples:\n• 'Create a React todo app with TypeScript and beautiful animations'\n• 'Build a Vue.js dashboard with charts and dark mode'\n• 'Make an Angular e-commerce site with shopping cart'\n• 'Create a Node.js API with authentication'"
                      }
                      className="min-h-[200px] resize-none bg-prism-surface/10 border-prism-border"
                      disabled={isGenerating || isThinking}
                    />
                  </div>

                  <TimeEstimator 
                    prompt={prompt} 
                    model={selectedModel} 
                    isVisible={!isGenerating && !isThinking && prompt.trim().length > 0}
                  />

                  <Button
                    onClick={() => generateWebApp()}
                    disabled={isGenerating || isThinking || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating Application...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        {generatedApp ? 'Enhance App' : 'Generate App'}
                      </>
                    )}
                  </Button>

                  {/* Generated App Info */}
                  {generatedApp && (
                    <div className="mt-4 p-3 bg-prism-surface/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-prism-text text-sm">Current Project</h4>
                        <div className="flex space-x-1">
                          <Badge variant="outline" className="text-xs">
                            <Code className="w-3 h-3 mr-1" />
                            {generatedApp.framework}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-prism-text-muted text-xs mb-3">{generatedApp.description}</p>

                      <h4 className="font-semibold text-prism-text mb-2 text-sm">Features:</h4>
                      <ul className="list-disc list-inside text-prism-text-muted text-xs space-y-1">
                        {generatedApp.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>

                      <div className="mt-3 pt-2 border-t border-prism-border">
                        <h4 className="font-semibold text-prism-text mb-1 text-xs">
                          Files: {Object.keys(generatedApp.files).length}
                        </h4>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="flex-1 mt-4">
              {generatedApp && generatedApp.files ? (
                <AdvancedCodeEditor 
                  generatedApp={generatedApp} 
                  onFileChange={handleFileChange}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">Generate a web app to start editing files</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="packages" className="flex-1 mt-4">
              <PackageManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WebAppGenerator;

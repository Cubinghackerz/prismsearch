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
  // Legacy support for old format
  html?: string;
  css?: string;
  javascript?: string;
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
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5-pro-exp-03-25');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; response: GeneratedApp }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

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

    setIsThinking(true);
    setShowPlanDialog(true);
    setDevelopmentPlan(null);
    
    try {
      const detailedPrompt = `Create a comprehensive development plan for this web application: "${prompt}"

Please provide a detailed JSON response with the following structure:
{
  "projectOverview": "Detailed description of the project including purpose, target audience, and key objectives",
  "colorScheme": {
    "primary": "#hex-color",
    "secondary": "#hex-color", 
    "accent": "#hex-color",
    "background": "#hex-color",
    "text": "#hex-color"
  },
  "architecture": {
    "framework": "recommended framework/library",
    "styling": "CSS approach (CSS3, Tailwind, etc)",
    "stateManagement": "state management approach",
    "routing": "routing strategy"
  },
  "features": ["feature 1", "feature 2", "feature 3", "..."],
  "packages": ["recommended npm packages/libraries"],
  "fileStructure": ["file1.html", "file2.css", "folder/", "..."],
  "implementationSteps": ["step 1", "step 2", "step 3", "..."],
  "securityConsiderations": ["security measure 1", "security measure 2", "..."],
  "performanceOptimizations": ["optimization 1", "optimization 2", "..."],
  "estimatedComplexity": "Low|Medium|High"
}

Focus on modern web development best practices, accessibility, and user experience.`;

      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: detailedPrompt,
          model: selectedModel,
          chatId: currentProjectId || 'webapp-planning',
          chatHistory: []
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const planText = data.response || '';
      const plan = parseDevelopmentPlan(planText);
      
      if (plan) {
        setDevelopmentPlan(plan);
        toast({
          title: "Plan Generated",
          description: "Review the development plan and approve to start generation.",
        });
      } else {
        throw new Error('Failed to parse development plan');
      }
      
    } catch (error) {
      console.error('Error creating development plan:', error);
      toast({
        title: "Planning Failed",
        description: `Failed to create development plan: ${error.message}`,
        variant: "destructive"
      });
      setShowPlanDialog(false);
    } finally {
      setIsThinking(false);
    }
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

      const enhancedPrompt = `Generate a complete, modern web application based on this description: ${contextPrompt}

REQUIREMENTS:
- Choose the most appropriate technology stack (React, Vue, Angular, or vanilla)
- Use TypeScript when beneficial for the project complexity
- Create a proper file structure with unlimited files as needed
- Include all necessary configuration files (package.json, tsconfig.json, etc.)
- Implement modern design patterns and best practices
- Ensure the application is production-ready and scalable

Focus on creating a beautiful, functional application with proper architecture and file organization.`;

      const { data, error } = await supabase.functions.invoke('generate-webapp', {
        body: { 
          prompt: enhancedPrompt,
          model: modelToUse
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const parsedApp: GeneratedApp = data;
      
      // Convert legacy format to new format if needed
      if (parsedApp.html && parsedApp.css && parsedApp.javascript && !parsedApp.files) {
        parsedApp.files = {
          'index.html': parsedApp.html,
          'styles.css': parsedApp.css,
          'script.js': parsedApp.javascript
        };
        parsedApp.framework = parsedApp.framework || 'vanilla';
        parsedApp.language = parsedApp.language || 'javascript';
      }

      const generationTime = Math.round((Date.now() - startTime) / 1000);

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
    
    // Set the first file as selected
    const fileNames = Object.keys(project.generatedApp.files || {});
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

    let files: { name: string; content: string }[] = [];

    if (generatedApp.files) {
      // New multi-file format
      files = Object.entries(generatedApp.files).map(([name, content]) => ({
        name,
        content
      }));
    } else {
      // Legacy format support
      files = [
        { name: 'index.html', content: generatedApp.html || '' },
        { name: 'styles.css', content: generatedApp.css || '' },
        { name: 'script.js', content: generatedApp.javascript || '' }
      ];
    }

    // Add README
    files.push({
      name: 'README.md',
      content: `# Generated Web App\n\n**Framework:** ${generatedApp.framework || 'Vanilla'}\n**Language:** ${generatedApp.language || 'JavaScript'}\n\n## Description\n${generatedApp.description}\n\n## Features\n${generatedApp.features.map(f => `- ${f}`).join('\n')}\n\n## Dependencies\n${generatedApp.dependencies ? `\n### Production\n${generatedApp.dependencies.production?.map(d => `- ${d}`).join('\n') || 'None'}\n\n### Development\n${generatedApp.dependencies.development?.map(d => `- ${d}`).join('\n') || 'None'}` : 'No additional dependencies'}`
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

    if (currentProjectId) {
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
              html={generatedApp.files?.['index.html'] || generatedApp.html || ''}
              css={generatedApp.files?.['styles.css'] || generatedApp.css || ''}
              javascript={generatedApp.files?.['script.js'] || generatedApp.javascript || ''}
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
        {/* Left Side - Preview */}
        <div className="flex-1">
          {generatedApp ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-prism-text">Live Preview</h3>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {generatedApp.framework || 'Vanilla'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {generatedApp.language || 'JavaScript'}
                    </Badge>
                    {generatedApp.files && (
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(generatedApp.files).length} files
                      </Badge>
                    )}
                  </div>
                </div>
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
                  html={generatedApp.files?.['index.html'] || generatedApp.html || ''}
                  css={generatedApp.files?.['styles.css'] || generatedApp.css || ''}
                  javascript={generatedApp.files?.['script.js'] || generatedApp.javascript || ''}
                />
              </div>
            </div>
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
                            {generatedApp.framework || 'Vanilla'}
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

                      {generatedApp.files && (
                        <div className="mt-3 pt-2 border-t border-prism-border">
                          <h4 className="font-semibold text-prism-text mb-1 text-xs">
                            Files: {Object.keys(generatedApp.files).length}
                          </h4>
                        </div>
                      )}
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

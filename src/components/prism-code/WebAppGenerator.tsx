import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, FileText, Package, Rocket, Download, Badge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import ModelSelector, { AIModel } from "./ModelSelector";
import PackageManager from "./PackageManager";
import ProjectHistory from "./ProjectHistory";
import DevelopmentPlanDialog from "./DevelopmentPlanDialog";
import FileManager from "./FileManager";
import { FileContent, GeneratedApp, ProjectHistoryItem, DevelopmentPlan } from "@/types/webApp";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";

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

  const createFilesFromStructure = (app: GeneratedApp, plan?: DevelopmentPlan): FileContent[] => {
    const files: FileContent[] = [];
    
    // Always include the main files
    files.push({
      name: 'index.html',
      content: app.html,
      type: 'html',
      path: 'index.html'
    });
    
    files.push({
      name: 'styles.css',
      content: app.css,
      type: 'css',
      path: 'styles.css'
    });
    
    // Determine if we should use TypeScript based on framework
    const useTypeScript = plan?.architecture.framework.toLowerCase().includes('react') || 
                         plan?.architecture.framework.toLowerCase().includes('vue') ||
                         plan?.architecture.framework.toLowerCase().includes('angular');
    
    files.push({
      name: useTypeScript ? 'script.ts' : 'script.js',
      content: app.javascript,
      type: useTypeScript ? 'typescript' : 'javascript',
      path: useTypeScript ? 'script.ts' : 'script.js'
    });

    // Add package.json if we have packages
    if (plan?.packages && plan.packages.length > 0) {
      const packageJson = {
        name: "generated-webapp",
        version: "1.0.0",
        description: app.description,
        main: useTypeScript ? "script.ts" : "script.js",
        scripts: {
          build: "npm run build",
          dev: "npm run dev",
          start: "npm run start"
        },
        dependencies: plan.packages.reduce((acc, pkg) => {
          acc[pkg] = "latest";
          return acc;
        }, {} as Record<string, string>),
        ...(useTypeScript && {
          devDependencies: {
            typescript: "latest",
            "@types/node": "latest"
          }
        })
      };
      
      files.push({
        name: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
        type: 'json',
        path: 'package.json'
      });
    }

    // Add TypeScript config if using TypeScript
    if (useTypeScript) {
      const tsConfig = {
        compilerOptions: {
          target: "ES2020",
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ["src"],
        references: [{ path: "./tsconfig.node.json" }]
      };
      
      files.push({
        name: 'tsconfig.json',
        content: JSON.stringify(tsConfig, null, 2),
        type: 'json',
        path: 'tsconfig.json'
      });
    }

    // Add README
    files.push({
      name: 'README.md',
      content: `# ${app.description}\n\n## Features\n${app.features.map(f => `- ${f}`).join('\n')}\n\n## Framework\n${plan?.architecture.framework || 'Vanilla JavaScript'}\n\n## Getting Started\n\n1. Install dependencies: \`npm install\`\n2. Start development: \`npm run dev\``,
      type: 'md',
      path: 'README.md'
    });

    return files;
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

      // Enhanced prompt with framework and TypeScript support
      const enhancedPrompt = `Generate a modern web application with the following requirements:

${contextPrompt}

${developmentPlan ? `
APPROVED DEVELOPMENT PLAN:
- Framework: ${developmentPlan.architecture.framework}
- Styling: ${developmentPlan.architecture.styling}  
- State Management: ${developmentPlan.architecture.stateManagement}
- Packages: ${developmentPlan.packages.join(', ')}
- File Structure: ${developmentPlan.fileStructure.join(', ')}
- Features: ${developmentPlan.features.join(', ')}
- Color Scheme: Primary: ${developmentPlan.colorScheme.primary}, Secondary: ${developmentPlan.colorScheme.secondary}

FOLLOW THIS PLAN EXACTLY. Use the specified framework and include all listed packages.
` : ''}

CRITICAL REQUIREMENTS:
- Generate modern, production-ready code with the latest best practices
- If using React/Vue/Angular, use TypeScript and modern component patterns
- Include proper package.json with all necessary dependencies
- Use modern CSS (CSS Grid, Flexbox, CSS Variables)
- Ensure responsive design and accessibility
- Include proper error handling and loading states
- Follow the file structure from the development plan if provided

SUPPORTED FRAMEWORKS: React, Vue, Angular, Svelte, Vanilla JS/TS, Next.js, Nuxt.js

Please return ONLY a valid JSON object with this structure:
{
  "html": "complete HTML content",
  "css": "modern CSS with responsive design", 
  "javascript": "modern JavaScript/TypeScript code",
  "description": "brief description of the application",
  "features": ["feature 1", "feature 2", "feature 3"],
  "files": [],
  "framework": "${developmentPlan?.architecture.framework || 'Vanilla JavaScript'}",
  "packages": ${JSON.stringify(developmentPlan?.packages || [])},
  "fileStructure": ${JSON.stringify(developmentPlan?.fileStructure || ['index.html', 'styles.css', 'script.js'])}
}`;

      const { data, error } = await supabase.functions.invoke('generate-webapp', {
        body: { 
          prompt: enhancedPrompt,
          model: modelToUse
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const parsedApp: GeneratedApp = {
        ...data,
        files: [],
        framework: developmentPlan?.architecture.framework || 'Vanilla JavaScript',
        packages: developmentPlan?.packages || [],
        fileStructure: developmentPlan?.fileStructure || ['index.html', 'styles.css', 'script.js']
      };

      // Create files based on the structure and framework
      const files = createFilesFromStructure(parsedApp, developmentPlan);
      parsedApp.files = files;

      const generationTime = Math.round((Date.now() - startTime) / 1000);

      setGeneratedApp(parsedApp);
      setActiveRightTab('editor');
      
      setConversationHistory(prev => [...prev, { prompt, response: parsedApp }]);
      
      saveProject(prompt, parsedApp, modelToUse);
      
      setPrompt("");
      
      toast({
        title: "Multi-File Web App Generated!",
        description: `Your ${parsedApp.framework} application with ${files.length} files was created in ${generationTime}s using ${modelToUse}.`,
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

  const handleFileChange = (filePath: string, content: string) => {
    if (!generatedApp) return;

    const updatedFiles = generatedApp.files.map(file => 
      file.path === filePath ? { ...file, content } : file
    );
    
    // Also update the main properties for backward compatibility
    const updatedApp = { ...generatedApp, files: updatedFiles };
    const mainFile = updatedFiles.find(f => f.name === 'index.html');
    const cssFile = updatedFiles.find(f => f.name === 'styles.css');
    const jsFile = updatedFiles.find(f => f.type === 'javascript' || f.type === 'typescript');
    
    if (mainFile) updatedApp.html = mainFile.content;
    if (cssFile) updatedApp.css = cssFile.content;
    if (jsFile) updatedApp.javascript = jsFile.content;

    setGeneratedApp(updatedApp);

    // Auto-save changes
    if (currentProjectId) {
      saveProject(conversationHistory[0]?.prompt || 'Modified project', updatedApp, selectedModel);
    }
  };

  const handleFileAdd = (file: FileContent) => {
    if (!generatedApp) return;

    const updatedApp = {
      ...generatedApp,
      files: [...generatedApp.files, file]
    };

    setGeneratedApp(updatedApp);
  };

  const handleFileDelete = (filePath: string) => {
    if (!generatedApp) return;

    const updatedApp = {
      ...generatedApp,
      files: generatedApp.files.filter(f => f.path !== filePath)
    };

    setGeneratedApp(updatedApp);
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
    "framework": "React|Vue|Angular|Svelte|Next.js|Nuxt.js|Vanilla JavaScript|Vanilla TypeScript",
    "styling": "CSS3|Tailwind CSS|Styled Components|SCSS|CSS Modules",
    "stateManagement": "Redux|Zustand|Pinia|Context API|Local Storage|None",
    "routing": "React Router|Vue Router|Angular Router|Page.js|Hash Router|None"
  },
  "features": ["feature 1", "feature 2", "feature 3", "..."],
  "packages": ["package1", "package2", "package3", "..."],
  "fileStructure": ["src/", "src/components/", "src/utils/", "index.html", "package.json", "..."],
  "implementationSteps": ["step 1", "step 2", "step 3", "..."],
  "securityConsiderations": ["security measure 1", "security measure 2", "..."],
  "performanceOptimizations": ["optimization 1", "optimization 2", "..."],
  "estimatedComplexity": "Low|Medium|High"
}

Focus on modern web development with TypeScript support, latest framework versions, and production-ready architecture.`;

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

  const handlePlanApproval = async () => {
    if (!developmentPlan) return;

    setShowPlanDialog(false);
    
    // The enhanced prompt will use the development plan
    await generateWebApp();
  };

  const handlePlanRejection = () => {
    setShowPlanDialog(false);
    setDevelopmentPlan(null);
    toast({
      title: "Plan Rejected",
      description: "You can modify your prompt and try thinking again.",
    });
  };

  const startNewProject = () => {
    setGeneratedApp(null);
    setCurrentProjectId(null);
    setConversationHistory([]);
    setPrompt("");
    setDevelopmentPlan(null);
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

    // Download all files
    generatedApp.files.forEach(file => {
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
      description: `All ${generatedApp.files.length} project files have been downloaded.`,
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
              <FileText className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-white">
            {/* Render the main HTML file content as preview */}
            <iframe
              title="Fullscreen Preview"
              srcDoc={generatedApp.html}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
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
        onApprove={handlePlanApproval}
        onReject={handlePlanRejection}
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
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30 font-fira-code">
                Beta
              </span>
            </div>
            <p className="text-prism-text-muted mt-2 font-inter">
              Generate fully functional web applications with advanced code editing and package management
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <ProjectHistory onLoadProject={loadProject} />
          {generatedApp && (
            <Button onClick={startNewProject} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview */}
        <div className="flex-1">
          {generatedApp ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-prism-text">Project Overview</h3>
                  <Badge variant="secondary">{generatedApp.framework}</Badge>
                  <Badge variant="outline">{generatedApp.files.length} files</Badge>
                </div>
                <div className="flex space-x-2">
                  <DeploymentDialog generatedApp={generatedApp}>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy
                    </Button>
                  </DeploymentDialog>
                  <Button onClick={downloadApp} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 bg-prism-surface/10 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-prism-text mb-2">Description</h4>
                    <p className="text-prism-text-muted">{generatedApp.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-prism-text mb-2">Features</h4>
                    <ul className="list-disc list-inside text-prism-text-muted space-y-1">
                      {generatedApp.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  {generatedApp.packages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-prism-text mb-2">Packages</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedApp.packages.map((pkg, index) => (
                          <Badge key={index} variant="outline">{pkg}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                    <span>{generatedApp ? 'Continue Working' : 'Describe Your Beautiful Web App'}</span>
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
                        "Describe how you want to enhance the visual design or add beautiful new features... Focus on UI improvements, animations, or modern design elements..." : 
                        "Describe the beautiful web application you want to create... For example: 'Create a stunning portfolio website with smooth scrolling animations, glassmorphism cards, gradient backgrounds, and interactive hover effects. Include a modern dark/light theme toggle with beautiful transitions.'"
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
                          <Wand2 className="w-4 h-4 mr-2 animate-pulse" />
                          Planning...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
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
                          <Wand2 className="w-4 h-4 mr-2 animate-spin" />
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="flex-1 mt-4">
              {generatedApp ? (
                <FileManager
                  files={generatedApp.files}
                  onFileChange={handleFileChange}
                  onFileAdd={handleFileAdd}
                  onFileDelete={handleFileDelete}
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

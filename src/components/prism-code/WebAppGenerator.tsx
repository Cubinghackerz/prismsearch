import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Brain, Rocket, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import PackageManager from "./PackageManager";
import ProjectHistory from "./ProjectHistory";
import DevelopmentPlanDialog from "./DevelopmentPlanDialog";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";
import {
  DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
  GeneratedApp,
  generateWebApp as runCodeGeneration,
} from '@/services/codeGenerationService';
import VSCodeWorkspace from './VSCodeWorkspace';
import RuntimeInstructionsPanel from './RuntimeInstructionsPanel';

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
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5-pro');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; response: GeneratedApp }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isVSCodeOpen, setIsVSCodeOpen] = useState(false);
  const workspaceFiles = useMemo(() => {
    if (!generatedApp) return [] as { path: string; language: string; content: string }[];

    const map = new Map<string, { path: string; language: string; content: string }>();
    map.set('index.html', { path: 'index.html', language: 'html', content: generatedApp.html });
    map.set('styles.css', { path: 'styles.css', language: 'css', content: generatedApp.css });
    map.set('script.js', { path: 'script.js', language: 'javascript', content: generatedApp.javascript });

    (generatedApp.files || []).forEach((file) => {
      if (!file.path) return;
      map.set(file.path, {
        path: file.path,
        language: file.language || 'plaintext',
        content: file.content,
      });
    });

    return Array.from(map.values());
  }, [generatedApp]);
  const { toast } = useToast();
  const { consume, limits } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] =
    DEFAULT_CODE_GENERATION_FALLBACK_ORDER as AIModel[];

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

    if (!consume('codeGenerations')) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${limits.codeGenerations} Prism Code generations. Try again tomorrow!`,
        variant: 'destructive',
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

  const handlePlanApproval = async () => {
    if (!developmentPlan) return;

    setShowPlanDialog(false);
    
    // Create enhanced prompt with approved plan details
    const enhancedPrompt = `Generate a web application based on this approved development plan:

Original Request: ${prompt}

Development Plan:
- Overview: ${developmentPlan.projectOverview}
- Color Scheme: Primary: ${developmentPlan.colorScheme.primary}, Secondary: ${developmentPlan.colorScheme.secondary}, Accent: ${developmentPlan.colorScheme.accent}, Background: ${developmentPlan.colorScheme.background}, Text: ${developmentPlan.colorScheme.text}
- Architecture: ${developmentPlan.architecture.framework} with ${developmentPlan.architecture.styling} for styling
- Key Features: ${developmentPlan.features.join(', ')}
- Recommended Packages: ${developmentPlan.packages.join(', ')}
- Implementation Steps: ${developmentPlan.implementationSteps.join(' -> ')}

Please create a complete, functional web application that follows this plan exactly, using the specified color scheme and implementing all listed features.`;

    // Use the existing generation function with the enhanced prompt
    const originalPrompt = prompt;
    setPrompt(enhancedPrompt);
    await generateWebApp();
    setPrompt(originalPrompt); // Restore original prompt for UI
  };

  const handlePlanRejection = () => {
    setShowPlanDialog(false);
    setDevelopmentPlan(null);
    toast({
      title: "Plan Rejected",
      description: "You can modify your prompt and try thinking again.",
    });
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

    if (!consume('codeGenerations')) {
      toast({
        title: 'Daily Limit Reached',
        description: `You've reached your daily limit of ${limits.codeGenerations} Prism Code generations. Try again tomorrow!`,
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let contextPrompt = prompt;
      if (conversationHistory.length > 0) {
        contextPrompt = `Based on the previous web application, ${prompt}.

Previous conversation context:
${conversationHistory
  .slice(-3)
  .map((item, index) =>
    `Request ${index + 1}: ${item.prompt}
  Result: ${item.response.description}`
  )
  .join('\n\n')}

Please modify or enhance the current application accordingly.`;
      }

      const { app, usedModel } = await runCodeGeneration({
        prompt: contextPrompt,
        model: modelToUse,
        chatId: currentProjectId || 'webapp-generation',
        fallbackModels: MODEL_FALLBACK_ORDER,
      });

      setGeneratedApp(app);
      setActiveRightTab('editor');

      setConversationHistory(prev => [...prev, { prompt, response: app }]);

      saveProject(prompt, app, usedModel);

      setPrompt("");

      toast({
        title: "Web App Generated!",
        description: usedModel !== modelToUse
          ? `Generation completed using fallback model ${usedModel}.`
          : `Your web application has been created successfully using ${usedModel}.`,
      });
    } catch (error) {
      console.error(`Error generating web app with ${modelToUse}:`, error);

      toast({
        title: "Generation Failed",
        description: `Failed to generate web app: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    setActiveRightTab('generator');
    setIsVSCodeOpen(false);
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
    setIsVSCodeOpen(false);
  };

  const downloadApp = () => {
    if (!generatedApp) return;

    const fileMap = new Map<string, string>();
    fileMap.set('index.html', generatedApp.html);
    fileMap.set('styles.css', generatedApp.css);
    fileMap.set('script.js', generatedApp.javascript);

    (generatedApp.files || []).forEach((file) => {
      if (!file.path) return;
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      fileMap.set(cleanPath, file.content);
    });

    const stackSummary = generatedApp.stack
      ? `\n\nStack:\n- Language: ${generatedApp.stack.language}\n- Framework: ${generatedApp.stack.framework}\n- Libraries: ${generatedApp.stack.libraries?.join(', ') || 'None'}\n- Tooling: ${generatedApp.stack.tooling?.join(', ') || 'None'}`
      : '';

    const runtimeSummary = generatedApp.runtime
      ? `\n\nRuntime:\n- Environment: ${generatedApp.runtime.environment || 'Not specified'}\n- Setup:\n${(generatedApp.runtime.setup || ['No setup commands provided'])
          .map((command) => `  - ${command}`)
          .join('\n')}\n- Start:\n${(generatedApp.runtime.start || ['No start commands provided'])
          .map((command) => `  - ${command}`)
          .join('\n')}${generatedApp.runtime.previewCommands && generatedApp.runtime.previewCommands.length > 0
          ? `\n- Preview Commands:\n${generatedApp.runtime.previewCommands.map((command) => `  - ${command}`).join('\n')}`
          : ''}${generatedApp.runtime.notes && generatedApp.runtime.notes.length > 0
          ? `\n- Notes:\n${generatedApp.runtime.notes.map((note) => `  - ${note}`).join('\n')}`
          : ''}`
      : '';

    fileMap.set(
      'README.txt',
      `Generated Web App\n\nDescription: ${generatedApp.description}\n\nFeatures:\n${generatedApp.features
        .map((feature) => `- ${feature}`)
        .join('\n')}${stackSummary}${runtimeSummary}`
    );

    fileMap.forEach((content, name) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
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

    let updatedApp: GeneratedApp | null = null;

    setGeneratedApp(prev => {
      if (!prev) return prev;

      let nextApp: GeneratedApp;

      if (fileType === 'html' || fileType === 'css' || fileType === 'javascript') {
        nextApp = {
          ...prev,
          [fileType]: content,
        };
      } else if (fileType === 'previewHtml') {
        nextApp = {
          ...prev,
          previewHtml: content,
        };
      } else if (fileType.startsWith('file:')) {
        const path = fileType.replace(/^file:/, '');
        const existingFiles = prev.files || [];
        const existingIndex = existingFiles.findIndex((file) => file.path === path);
        const sourceFile = existingFiles[existingIndex] || generatedApp.files?.find((file) => file.path === path);
        const updatedFile = {
          path,
          language: sourceFile?.language || 'plaintext',
          description: sourceFile?.description,
          content,
        };
        const files = existingIndex >= 0
          ? existingFiles.map((file, index) => (index === existingIndex ? updatedFile : file))
          : [...existingFiles, updatedFile];

        nextApp = {
          ...prev,
          files,
        };
      } else {
        nextApp = prev;
      }

      updatedApp = nextApp;
      return nextApp;
    });

    // Auto-save changes
    if (currentProjectId) {
      const appToSave = updatedApp || { ...generatedApp, [fileType]: content };
      saveProject(conversationHistory[0]?.prompt || 'Modified project', appToSave, selectedModel);
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
              previewHtml={generatedApp.previewHtml}
              previewMode={generatedApp.previewMode}
              previewNotes={generatedApp.previewNotes}
              stack={generatedApp.stack}
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
          <strong>Enhanced Features:</strong> Now with development planning, advanced Monaco Editor for professional code editing and package management capabilities.
        </AlertDescription>
      </Alert>

      {/* Prompt Tips */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-300">
          <strong>Pro Tip:</strong> Use the "Think" button to generate a detailed development plan with color schemes, architecture, and implementation steps before generating your app.
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
                  previewHtml={generatedApp.previewHtml}
                  previewMode={generatedApp.previewMode}
                  previewNotes={generatedApp.previewNotes}
                  stack={generatedApp.stack}
                  showAlert={false}
                />
              </div>
              <div className="mt-4">
                <RuntimeInstructionsPanel runtime={generatedApp.runtime} />
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
                        "Describe how you want to modify or enhance the current web app... Mention specific packages like 'Add Chart.js for data visualization' or 'Use Lodash for data manipulation'..." : 
                        "Describe the web application you want to create... For example: 'Create a todo list app with drag and drop functionality using React Beautiful DnD, dark mode toggle, and local storage. Include animations with Framer Motion and use Tailwind CSS for styling.'"
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
                          Planning...
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
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-prism-text">Source Files</h3>
                      <p className="text-xs text-prism-text-muted">Edit directly or jump into the full VS Code workspace.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setIsVSCodeOpen(true)}
                    >
                      <Code2 className="w-4 h-4" />
                      Open in VS Code
                    </Button>
                  </div>
                  <AdvancedCodeEditor
                    generatedApp={generatedApp}
                    onFileChange={handleFileChange}
                  />
                </div>
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
              <PackageManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {generatedApp && (
        <VSCodeWorkspace
          open={isVSCodeOpen}
          onOpenChange={setIsVSCodeOpen}
          files={workspaceFiles}
          onFileChange={(path, content) => {
            if (path === 'index.html') {
              handleFileChange('html', content);
            } else if (path === 'styles.css') {
              handleFileChange('css', content);
            } else if (path === 'script.js') {
              handleFileChange('javascript', content);
            } else {
              handleFileChange(`file:${path}`, content);
            }
          }}
        />
      )}
    </div>
  );
};

export default WebAppGenerator;

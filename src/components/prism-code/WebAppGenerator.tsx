import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Brain, Rocket, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import LivePreview from "./LivePreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import PackageManager from "./PackageManager";
import ProjectHistory from "./ProjectHistory";
import DevelopmentPlanDialog from "./DevelopmentPlanDialog";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";
import TimeEstimator from "./TimeEstimator";
import { GeneratedApp, DevelopmentPlan, ProjectHistoryItem } from "@/types/webApp";

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
  const [previewVisible, setPreviewVisible] = useState(true);
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini', 'groq-llama4-maverick', 'groq-llama4-scout', 'groq-llama31-8b-instant'];

  const handlePlanApproval = () => {
    setShowPlanDialog(false);
    generateWebApp();
  };

  const handlePlanRejection = () => {
    setShowPlanDialog(false);
    setDevelopmentPlan(null);
  };

  const thinkAboutProject = async () => {
    if (!prompt.trim()) return;
    
    setIsThinking(true);
    try {
      // Simulate thinking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const plan: DevelopmentPlan = {
        projectOverview: `AI-generated web application: ${prompt}`,
        colorScheme: {
          primary: "#3B82F6",
          secondary: "#6B7280", 
          accent: "#10B981",
          background: "#FFFFFF",
          text: "#1F2937"
        },
        architecture: {
          framework: "React with TypeScript",
          styling: "Tailwind CSS",
          stateManagement: "React Hooks",
          routing: "React Router"
        },
        features: ["Modern UI", "Responsive Design", "TypeScript Support"],
        packages: ["react", "typescript", "tailwindcss"],
        fileStructure: ["src/App.tsx", "src/components/", "package.json"],
        implementationSteps: ["Setup", "Components", "Styling", "Testing"],
        securityConsiderations: ["Input validation", "XSS protection"],
        performanceOptimizations: ["Code splitting", "Lazy loading"],
        estimatedComplexity: 'Medium' as const
      };
      
      setDevelopmentPlan(plan);
      setShowPlanDialog(true);
    } catch (error) {
      console.error('Error creating development plan:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const downloadApp = () => {
    if (!generatedApp || !generatedApp.files) return;
    
    // Create a zip-like structure by downloading each file
    generatedApp.files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.path.split('/').pop() || 'file.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
    
    toast({
      title: "Files Downloaded",
      description: `Downloaded ${generatedApp.files.length} files from your project.`,
    });
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

  const parseDevelopmentPlan = (planText: string): DevelopmentPlan | null => {
    try {
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

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
          framework: "React with TypeScript",
          styling: "Tailwind CSS",
          stateManagement: "React Hooks",
          routing: "React Router"
        },
        features: lines.filter(line => line.includes('feature') || line.includes('•')).slice(0, 6),
        packages: ["@types/react", "@types/node", "typescript", "tailwindcss"],
        fileStructure: [
          "src/App.tsx",
          "src/components/",
          "src/types/",
          "src/hooks/",
          "src/utils/",
          "package.json",
          "tsconfig.json",
          "tailwind.config.ts"
        ],
        implementationSteps: [
          "Set up TypeScript React project",
          "Configure Tailwind CSS",
          "Create component structure",
          "Implement core functionality",
          "Add type definitions",
          "Optimize for performance"
        ],
        securityConsiderations: [
          "Input validation and sanitization",
          "TypeScript strict mode",
          "Secure data handling"
        ],
        performanceOptimizations: [
          "Code splitting with React.lazy",
          "Memoization with useMemo/useCallback",
          "Optimized bundle size"
        ],
        estimatedComplexity: 'Medium' as const
      };
    } catch (error) {
      console.error('Error parsing development plan:', error);
      return null;
    }
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

      const enhancedPrompt = `Generate a stunning, modern web application with exceptional UI/UX design based on this description: ${contextPrompt}

${developmentPlan ? `
APPROVED DEVELOPMENT PLAN:
- Framework: ${developmentPlan.architecture.framework}
- Styling: ${developmentPlan.architecture.styling}
- File Structure: ${developmentPlan.fileStructure.join(', ')}
- Packages: ${developmentPlan.packages.join(', ')}
- Color Scheme: Primary: ${developmentPlan.colorScheme.primary}, Secondary: ${developmentPlan.colorScheme.secondary}
` : ''}

CRITICAL REQUIREMENTS:
1. Generate a COMPLETE file structure following modern development practices
2. Support TypeScript, React, Vue, Angular, or other modern frameworks as appropriate
3. Create all necessary files including:
   - Main application files (App.tsx, main.tsx, etc.)
   - Component files with proper TypeScript types
   - Configuration files (package.json, tsconfig.json, etc.)
   - Styling files (CSS, SCSS, or framework-specific)
   - Type definition files
   - Utility and helper files

DESIGN REQUIREMENTS:
- Create visually stunning, modern interfaces with beautiful aesthetics
- Use contemporary design principles and modern CSS techniques
- Implement smooth animations and micro-interactions
- Apply modern color schemes with gradients and depth
- Ensure responsive design for all devices
- Include hover effects and interactive feedback

TECHNICAL REQUIREMENTS:
- Generate clean, semantic code structure
- Use modern framework patterns and best practices
- Implement proper TypeScript types throughout
- Include proper error handling and validation
- Ensure optimal performance and accessibility

Please return ONLY a valid JSON object with this exact structure:
{
  "files": [
    {
      "path": "relative/file/path",
      "content": "file content",
      "type": "typescript|javascript|html|css|json|md|txt"
    }
  ],
  "description": "brief description emphasizing visual appeal and functionality",
  "features": ["feature 1", "feature 2", "feature 3"],
  "framework": "React|Vue|Angular|Vanilla",
  "packages": ["package1", "package2", "package3"]
}

Create a complete, production-ready application with proper file organization and modern development practices.`;

      const { data, error } = await supabase.functions.invoke('generate-webapp', {
        body: { 
          prompt: enhancedPrompt,
          model: modelToUse
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const generationTime = Math.round((Date.now() - startTime) / 1000);

      setGeneratedApp(data);
      setActiveRightTab('editor');
      
      setConversationHistory(prev => [...prev, { prompt, response: data }]);
      
      saveProject(prompt, data, modelToUse);
      
      setPrompt("");
      
      toast({
        title: "Beautiful Web App Generated!",
        description: `Your ${data.framework} application was created in ${generationTime}s using ${modelToUse}.`,
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

  const handleFileChange = (filePath: string, content: string) => {
    if (!generatedApp || !generatedApp.files) return;

    setGeneratedApp(prev => ({
      ...prev!,
      files: prev!.files.map(file => 
        file.path === filePath ? { ...file, content } : file
      )
    }));

    if (currentProjectId) {
      const updatedApp = { 
        ...generatedApp, 
        files: generatedApp.files.map(file => 
          file.path === filePath ? { ...file, content } : file
        )
      };
      saveProject(conversationHistory[0]?.prompt || 'Modified project', updatedApp, selectedModel);
    }
  };

  if (isFullscreen && generatedApp) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Fullscreen Preview</h2>
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
            <LivePreview generatedApp={generatedApp} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <p className="text-muted-foreground mt-2 font-inter">
              Generate full-stack TypeScript applications with unlimited files and modern frameworks
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
        <AlertDescription className="text-blue-600">
          <strong>Enhanced Features:</strong> Now supports TypeScript, React, Vue, Angular with unlimited files, package management, and complete project structures following development plans.
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
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    {generatedApp.framework} • {generatedApp.files?.length || 0} files
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setPreviewVisible(!previewVisible)}
                    size="sm"
                    variant="outline"
                  >
                    {previewVisible ? (
                      <><EyeOff className="w-4 h-4 mr-2" />Hide</>
                    ) : (
                      <><Eye className="w-4 h-4 mr-2" />Show</>
                    )}
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
              <div className="flex-1">
                <LivePreview 
                  generatedApp={generatedApp} 
                  isVisible={previewVisible}
                  onToggleVisibility={() => setPreviewVisible(!previewVisible)}
                />
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-20">
                <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Web App Generated Yet</h3>
                <p className="text-muted-foreground">Use the generator to create your TypeScript web application</p>
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
                    <Wand2 className="w-5 h-5 text-primary" />
                    <span>{generatedApp ? 'Continue Working' : 'Describe Your Modern Web Application'}</span>
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
                        "Describe how you want to enhance your application... Add new features, components, or modify the structure..." : 
                        "Describe the modern web application you want to create... For example: 'Create a TypeScript React dashboard with user authentication, data visualization charts, responsive design, and dark/light theme toggle. Use Tailwind CSS for styling and include proper type definitions.'"
                      }
                      className="min-h-[200px] resize-none"
                      disabled={isGenerating || isThinking}
                    />
                  </div>

                  <TimeEstimator 
                    prompt={prompt} 
                    model={selectedModel} 
                    isVisible={!isGenerating && !isThinking && prompt.trim().length > 0}
                  />

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
                  {generatedApp && generatedApp.files && (
                    <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                      <h4 className="font-semibold text-sm">Current Project:</h4>
                      <p className="text-muted-foreground text-xs mb-3">{generatedApp.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="font-semibold text-sm mb-1">Framework:</h5>
                          <p className="text-muted-foreground text-xs">{generatedApp.framework}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-1">Files:</h5>
                          <p className="text-muted-foreground text-xs">{generatedApp.files.length} files</p>
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm mb-2">Features:</h4>
                      <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1 mb-3">
                        {(generatedApp.features || []).map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>

                      <h4 className="font-semibold text-sm mb-2">Packages:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(generatedApp.packages || []).slice(0, 6).map((pkg, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                            {pkg}
                          </span>
                        ))}
                        {(generatedApp.packages || []).length > 6 && (
                          <span className="px-2 py-1 bg-muted/30 text-muted-foreground text-xs rounded">
                            +{generatedApp.packages.length - 6} more
                          </span>
                        )}
                      </div>

                      {conversationHistory.length > 1 && (
                        <div className="mt-3 pt-2 border-t border-muted">
                          <h4 className="font-semibold text-sm mb-1">
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
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Generate a web app to start editing</p>
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

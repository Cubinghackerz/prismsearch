import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, AlertTriangle, Package, Brain, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import FileExplorer from "./FileExplorer";
import PackageDisplay from "./PackageDisplay";
import ProjectHistory from "./ProjectHistory";
import DevelopmentPlanDialog from "./DevelopmentPlanDialog";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";
import { GeneratedApp, GeneratedFile, ProjectHistoryItem, DevelopmentPlan } from './types';

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
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini-2.5-pro-exp-03-25', 'gemini', 'groq-llama4-maverick', 'groq-llama4-scout', 'groq-llama31-8b-instant'];

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
  "files": [
    {
      "filename": "string (e.g., index.html, App.tsx, main.css)",
      "content": "string (complete file content)",
      "language": "string (html, css, javascript, typescript, jsx, tsx, vue, svelte)",
      "type": "string (component, style, config, asset, test)"
    }
  ],
  "description": "brief description of the app",
  "features": ["feature 1", "feature 2", "feature 3"],
  "framework": "string (vanilla, react, vue, svelte, angular)",
  "packages": ["package names that would be installed"],
  "devDependencies": ["dev package names"],
  "buildScript": "string (optional build command)",
  "startScript": "string (optional start command)"
}

Choose the most appropriate framework and file structure for the prompt. For simple apps use vanilla JS/HTML/CSS. For complex apps with state management use React/Vue/Svelte. Include all necessary files for a complete, functional application. Make it responsive, modern, and fully functional. Do not include any markdown formatting or code blocks. Just the raw JSON.`,
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
        // Fallback to old format
        const responseText = data.response || 'No response received';
        parsedApp = {
          files: [
            {
              filename: 'index.html',
              content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Web App</title>
    <style>
      body {
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
    </style>
</head>
<body>
    <div class="container">
        <h1>Generated Web Application</h1>
        <div class="content">
            ${responseText.replace(/\n/g, '<br>')}
        </div>
    </div>
    <script>
      console.log('Web app generated successfully');
    </script>
</body>
</html>`,
              language: 'html',
              type: 'component'
            }
          ],
          description: 'AI-generated web application',
          features: ['Responsive design', 'Modern styling', 'Basic functionality'],
          framework: 'vanilla',
          packages: [],
          devDependencies: []
        };
      }

      setGeneratedApp(parsedApp);
      setActiveRightTab('files');
      
      setConversationHistory(prev => [...prev, { prompt, response: parsedApp }]);
      
      saveProject(prompt, parsedApp, modelToUse);
      
      setPrompt("");
      
      toast({
        title: "Web App Generated!",
        description: `Your ${parsedApp.framework} application has been created successfully using ${modelToUse}.`,
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

  const handleFileSelect = (file: GeneratedFile) => {
    setSelectedFile(file);
    setShowCodeEditor(true);
  };

  const handleFileChange = (content: string) => {
    if (!generatedApp || !selectedFile) return;

    const updatedFiles = generatedApp.files.map(file => 
      file.filename === selectedFile.filename 
        ? { ...file, content }
        : file
    );

    const updatedApp = { ...generatedApp, files: updatedFiles };
    setGeneratedApp(updatedApp);
    setSelectedFile({ ...selectedFile, content });

    // Auto-save changes
    if (currentProjectId) {
      saveProject(conversationHistory[0]?.prompt || 'Modified project', updatedApp, selectedModel);
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

  const downloadApp = () => {
    if (!generatedApp) return;

    generatedApp.files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    // Also download package.json if packages exist
    if (generatedApp.packages.length > 0) {
      const packageJson = {
        name: "generated-web-app",
        version: "1.0.0",
        description: generatedApp.description,
        dependencies: generatedApp.packages.reduce((acc, pkg) => {
          acc[pkg] = "latest";
          return acc;
        }, {} as Record<string, string>),
        ...(generatedApp.devDependencies && generatedApp.devDependencies.length > 0 && {
          devDependencies: generatedApp.devDependencies.reduce((acc, pkg) => {
            acc[pkg] = "latest";   
            return acc;
          }, {} as Record<string, string>)
        }),
        scripts: {
          ...(generatedApp.startScript && { start: generatedApp.startScript }),
          ...(generatedApp.buildScript && { build: generatedApp.buildScript })
        }
      };

      const blob = new Blob([JSON.stringify(packageJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'package.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Files Downloaded",
      description: `All ${generatedApp.files.length} files have been downloaded to your device.`,
    });
  };

  // Helper function to get preview content for legacy WebAppPreview component
  const getPreviewContent = () => {
    if (!generatedApp) return { html: '', css: '', javascript: '' };
    
    const htmlFile = generatedApp.files.find(f => f.language === 'html' || f.filename.endsWith('.html'));
    const cssFile = generatedApp.files.find(f => f.language === 'css' || f.filename.endsWith('.css'));
    const jsFile = generatedApp.files.find(f => f.language === 'javascript' || f.filename.endsWith('.js'));
    
    return {
      html: htmlFile?.content || '',
      css: cssFile?.content || '',
      javascript: jsFile?.content || ''
    };
  };

  if (showCodeEditor && selectedFile) {
    return (
      <AdvancedCodeEditor
        file={selectedFile}
        onFileChange={handleFileChange}
        onClose={() => setShowCodeEditor(false)}
      />
    );
  }

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
            <WebAppPreview files={generatedApp.files} />
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

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview */}
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
                <WebAppPreview files={generatedApp.files} />
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
              <TabsTrigger value="files" className="flex items-center space-x-1" disabled={!generatedApp}>
                <FileText className="w-4 h-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center space-x-1" disabled={!generatedApp}>
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

            <TabsContent value="files" className="flex-1 mt-4">
              {generatedApp ? (
                <FileExplorer
                  files={generatedApp.files}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                />
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
              {generatedApp ? (
                <PackageDisplay
                  packages={generatedApp.packages}
                  devDependencies={generatedApp.devDependencies}
                  framework={generatedApp.framework}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <Package className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">Generate a web app to view packages</p>
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

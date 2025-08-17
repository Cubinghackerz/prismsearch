import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Code, AlertTriangle, FileText, Package, Terminal as TerminalIcon, Template, Cloud } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import FrameworkTemplates from "./FrameworkTemplates";
import ProjectCloudStorage from "./ProjectCloudStorage";
import PackageManager from "./PackageManager";
import Terminal from "./Terminal";
import ProjectHistory from "./ProjectHistory";
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
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; response: GeneratedApp }>>([]);
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [editorFiles, setEditorFiles] = useState<Array<{name: string; content: string; language: string; icon: any}>>([]);
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
      
      const files = [
        { name: 'index.html', content: parsedApp.html, language: 'html', icon: FileText },
        { name: 'styles.css', content: parsedApp.css, language: 'css', icon: Code },
        { name: 'script.js', content: parsedApp.javascript, language: 'javascript', icon: Code }
      ];
      setEditorFiles(files);

      setActiveRightTab('editor');
      
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

  const handleTemplateSelect = (template: any) => {
    const files = Object.entries(template.files).map(([filename, content]) => ({
      name: filename,
      content: content as string,
      language: getLanguageFromFilename(filename),
      icon: getIconFromFilename(filename)
    }));

    setEditorFiles(files);
    setPackages(template.packages.map((pkg: string) => ({
      name: pkg,
      version: '^1.0.0',
      type: 'dependency' as const
    })));

    const mockApp: GeneratedApp = {
      html: template.files['index.html'] || '',
      css: template.files['styles.css'] || template.files['app.css'] || '',
      javascript: template.files['app.js'] || template.files['script.js'] || template.files['server.js'] || '',
      description: template.description,
      features: template.features,
      dependencies: packages
    };

    setGeneratedApp(mockApp);
    setCurrentProjectId(uuidv4());
    setActiveRightTab('editor');
  };

  const handleFileChange = (fileName: string, content: string) => {
    setEditorFiles(prev => prev.map(file => 
      file.name === fileName ? { ...file, content } : file
    ));

    // Update generatedApp based on file changes
    if (generatedApp) {
      const updatedApp = { ...generatedApp };
      if (fileName === 'index.html') updatedApp.html = content;
      if (fileName === 'styles.css' || fileName === 'app.css') updatedApp.css = content;
      if (fileName.endsWith('.js')) updatedApp.javascript = content;
      setGeneratedApp(updatedApp);
    }
  };

  const getLanguageFromFilename = (filename: string) => {
    const ext = filename.split('.').pop();
    switch (ext) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'json': return 'json';
      default: return 'plaintext';
    }
  };

  const getIconFromFilename = (filename: string) => {
    const ext = filename.split('.').pop();
    switch (ext) {
      case 'html': return FileText;
      case 'css': return Code;
      case 'js': return Code;
      case 'json': return Package;
      default: return FileText;
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
    setEditorFiles([]);
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
    setActiveRightTab('editor');
  };

  const projectData = {
    id: currentProjectId || 'temp',
    name: generatedApp?.description || 'Untitled Project',
    files: editorFiles.reduce((acc, file) => ({ ...acc, [file.name]: file.content }), {}),
    packages,
    description: generatedApp?.description || '',
    features: generatedApp?.features || []
  };

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
                Enhanced
              </span>
            </div>
            <p className="text-prism-text-muted mt-2 font-inter">
              Generate full-stack applications with advanced code editing and cloud storage
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ProjectCloudStorage 
            projectData={projectData}
            onProjectLoad={(data) => {
              // Handle cloud project loading
              const files = Object.entries(data.files).map(([name, content]) => ({
                name,
                content: content as string,
                language: getLanguageFromFilename(name),
                icon: getIconFromFilename(name)
              }));
              setEditorFiles(files);
              setPackages(data.packages);
              setCurrentProjectId(data.id);
            }}
          />
          <FrameworkTemplates onTemplateSelect={handleTemplateSelect} />
          <ProjectHistory onLoadProject={loadProject} />
          <Button onClick={startNewProject} variant="outline" size="sm">
            New Project
          </Button>
        </div>
      </div>

      {/* Enhanced Alert */}
      <Alert className="border-orange-500/30 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-300">
          <strong>Phase 1 Enhanced:</strong> Now with Monaco code editor, framework templates, and cloud storage! 
          Generate professional applications with full IDE capabilities.
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
                <p className="text-prism-text-muted">Use templates or AI generation to create your application</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Enhanced Tabs */}
        <div className="w-full lg:w-96 flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="generator" className="flex items-center space-x-1">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center space-x-1" disabled={editorFiles.length === 0}>
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Code</span>
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center space-x-1">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Pkg</span>
              </TabsTrigger>
              <TabsTrigger value="terminal" className="flex items-center space-x-1">
                <TerminalIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Term</span>
              </TabsTrigger>
              <TabsTrigger value="cloud" className="flex items-center space-x-1">
                <Cloud className="w-4 h-4" />
                <span className="hidden sm:inline">Cloud</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="flex-1 flex flex-col mt-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-prism-primary" />
                    <span>AI Generator</span>
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
                      placeholder="Describe the web application you want to create..."
                      className="min-h-[200px] resize-none bg-prism-surface/10 border-prism-border"
                      disabled={isGenerating}
                    />
                  </div>

                  <Button
                    onClick={() => generateWebApp()}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Web App'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="flex-1 mt-4">
              {editorFiles.length > 0 ? (
                <AdvancedCodeEditor
                  files={editorFiles}
                  onFileChange={handleFileChange}
                  onSave={() => {
                    toast({
                      title: "Files Saved",
                      description: "All changes have been saved successfully.",
                    });
                  }}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">Generate or load a project to edit code</p>
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

            <TabsContent value="cloud" className="flex-1 mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <span>Cloud Storage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-prism-text-muted">
                    Save your projects to the cloud for backup and cross-device access.
                  </p>
                  <ProjectCloudStorage 
                    projectData={projectData}
                    onProjectLoad={(data) => {
                      const files = Object.entries(data.files).map(([name, content]) => ({
                        name,
                        content: content as string,
                        language: getLanguageFromFilename(name),
                        icon: getIconFromFilename(name)
                      }));
                      setEditorFiles(files);
                      setPackages(data.packages);
                      setCurrentProjectId(data.id);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WebAppGenerator;

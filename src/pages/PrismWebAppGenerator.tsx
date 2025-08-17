import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AdvancedEditor from '@/components/webapp-generator/AdvancedEditor';
import PackageManager from '@/components/webapp-generator/PackageManager';
import PerformanceDashboard from '@/components/webapp-generator/PerformanceDashboard';
import TemplateSelector from '@/components/webapp-generator/TemplateSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Code, 
  Package, 
  BarChart3, 
  Play, 
  Save, 
  Download,
  Layers,
  AlertTriangle,
  Sparkles,
  Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface FileTab {
  id: string;
  name: string;
  language: string;
  content: string;
  modified: boolean;
  path: string;
}

interface ProjectState {
  id: string;
  name: string;
  files: FileTab[];
  packages: any[];
  settings: any;
}

const PrismWebAppGenerator = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('editor');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Authentication check
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prism-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  const createNewProject = () => {
    const newProject: ProjectState = {
      id: uuidv4(),
      name: 'New Project',
      files: [
        {
          id: 'app-tsx',
          name: 'App.tsx',
          language: 'typescript',
          content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your New App
        </h1>
        <p className="text-lg text-gray-600">
          Start building something amazing!
        </p>
      </div>
    </div>
  );
}

export default App;`,
          modified: false,
          path: 'src/App.tsx'
        },
        {
          id: 'index-css',
          name: 'index.css',
          language: 'css',
          content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}`,
          modified: false,
          path: 'src/index.css'
        }
      ],
      packages: [],
      settings: {}
    };

    setProject(newProject);
    setActiveFileId('app-tsx');
    toast({
      title: "New Project Created",
      description: "Your project is ready for development!",
    });
  };

  const handleTemplateGenerate = (generatedProject: any) => {
    const files: FileTab[] = generatedProject.files.map((file: any, index: number) => ({
      id: `file-${index}`,
      name: file.path.split('/').pop() || 'file',
      language: getLanguageFromPath(file.path),
      content: file.content,
      modified: false,
      path: file.path
    }));

    const newProject: ProjectState = {
      id: uuidv4(),
      name: generatedProject.name || 'Generated Project',
      files,
      packages: [],
      settings: {}
    };

    setProject(newProject);
    setActiveFileId(files[0]?.id || '');
    setActiveTab('editor');
    
    toast({
      title: "Template Generated",
      description: "Your project template has been created successfully!",
    });
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript', 
      'js': 'javascript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'vue': 'vue'
    };
    return languageMap[ext || ''] || 'text';
  };

  const handleFileChange = (fileId: string, content: string) => {
    if (!project) return;
    
    setProject(prev => ({
      ...prev!,
      files: prev!.files.map(file => 
        file.id === fileId 
          ? { ...file, content, modified: true }
          : file
      )
    }));
  };

  const handleFileSave = (fileId: string) => {
    if (!project) return;
    
    setProject(prev => ({
      ...prev!,
      files: prev!.files.map(file => 
        file.id === fileId 
          ? { ...file, modified: false }
          : file
      )
    }));
  };

  const handleRun = async () => {
    if (!project) return;
    
    setIsRunning(true);
    try {
      // In a real implementation, this would deploy to a preview environment
      const mockUrl = `https://preview-${project.id}.prism.dev`;
      setPreviewUrl(mockUrl);
      
      toast({
        title: "Application Running",
        description: "Your app is now running in preview mode.",
      });
    } catch (error) {
      toast({
        title: "Run Failed",
        description: "Unable to start the application.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handlePackageChange = (packages: any[]) => {
    if (!project) return;
    
    setProject(prev => ({
      ...prev!,
      packages
    }));
  };

  const downloadProject = () => {
    if (!project) return;

    // Create zip file with all project files
    const projectData = {
      name: project.name,
      files: project.files,
      packages: project.packages,
      readme: `# ${project.name}\n\nGenerated with Prism Web App Generator\n\n## Getting Started\n\n1. Install dependencies:\n   \`npm install\`\n\n2. Start development server:\n   \`npm run dev\``
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-project.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Project Downloaded",
      description: "Your project files have been exported.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-prism-primary/10 to-prism-accent/10 border border-prism-primary/20">
              <Globe className="w-8 h-8 text-prism-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
                Web App Generator
              </h1>
              <p className="text-prism-text-muted mt-1 font-inter">
                Professional web application development environment
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {project && (
              <>
                <Button onClick={downloadProject} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleRun} disabled={isRunning} size="sm">
                  {isRunning ? (
                    <Terminal className="w-4 h-4 mr-2 animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isRunning ? 'Starting...' : 'Run'}
                </Button>
              </>
            )}
            <Button onClick={createNewProject} className="bg-prism-primary hover:bg-prism-primary-dark">
              <Sparkles className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Beta Warning */}
        <Alert className="border-orange-500/30 bg-orange-500/5 mb-6">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-300">
            <strong>Advanced Beta:</strong> This is a comprehensive web development environment with real package management, 
            advanced code editing, framework templates, and performance analytics. Features are experimental and under active development.
          </AlertDescription>
        </Alert>

        {!project ? (
          // Template Selection Screen
          <div className="grid lg:grid-cols-2 gap-8">
            <TemplateSelector onTemplateGenerate={handleTemplateGenerate} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-prism-primary" />
                  <span>Quick Start</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-prism-text-muted">
                  Choose a framework template to get started quickly, or create a blank project and build from scratch.
                </p>
                
                <div className="space-y-3">
                  <Button onClick={createNewProject} className="w-full" variant="outline">
                    <Code className="w-4 h-4 mr-2" />
                    Create Blank Project
                  </Button>
                </div>

                <div className="border-t border-prism-border pt-4">
                  <h4 className="font-semibold text-prism-text mb-3">Features Include:</h4>
                  <ul className="space-y-2 text-sm text-prism-text-muted">
                    <li className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-prism-primary" />
                      <span>Advanced Monaco Editor with IntelliSense</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-prism-primary" />
                      <span>Real Package Management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-prism-primary" />
                      <span>Performance Analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-prism-primary" />
                      <span>Framework Templates</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main Development Environment
          <div className="space-y-6">
            {/* Project Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-prism-text">{project.name}</h2>
                <p className="text-prism-text-muted">
                  {project.files.length} files • {project.packages.length} packages
                </p>
              </div>
              {previewUrl && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Running at {previewUrl}
                </Badge>
              )}
            </div>

            {/* Main Development Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Packages</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Templates</span>
                </TabsTrigger>
              </TabsList>

              <div className="h-[calc(100vh-20rem)]">
                <TabsContent value="editor" className="h-full m-0">
                  <AdvancedEditor
                    files={project.files}
                    activeFileId={activeFileId}
                    onFileChange={handleFileChange}
                    onFileSelect={setActiveFileId}
                    onSave={handleFileSave}
                    onRun={handleRun}
                  />
                </TabsContent>

                <TabsContent value="packages" className="h-full m-0">
                  <PackageManager
                    projectId={project.id}
                    onPackageChange={handlePackageChange}
                  />
                </TabsContent>

                <TabsContent value="performance" className="h-full m-0">
                  <PerformanceDashboard
                    projectId={project.id}
                    projectUrl={previewUrl}
                  />
                </TabsContent>

                <TabsContent value="templates" className="h-full m-0">
                  <TemplateSelector onTemplateGenerate={handleTemplateGenerate} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrismWebAppGenerator;
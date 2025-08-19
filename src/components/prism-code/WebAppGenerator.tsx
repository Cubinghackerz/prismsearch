
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Wand2, Download, Eye, EyeOff, FileText, Settings, Clock, Sparkles } from 'lucide-react';
import { GeneratedApp, FileContent, ProjectHistoryItem, DevelopmentPlan } from '@/types/webApp';
import { supabase } from '@/integrations/supabase/client';
import FileManager from './FileManager';
import ProjectHistory from './ProjectHistory';
import DevelopmentPlanDialog from './DevelopmentPlanDialog';
import TimeEstimator from './TimeEstimator';
import LivePreview from './LivePreview';

const WebAppGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro-exp-03-25');
  const [showPreview, setShowPreview] = useState(true);
  const [projectHistory, setProjectHistory] = useState<ProjectHistoryItem[]>([]);
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const models = [
    { 
      value: 'gemini-2.5-pro-exp-03-25', 
      label: 'Gemini 2.5 Pro (Experimental)', 
      description: 'Latest experimental model with enhanced capabilities'
    },
    { 
      value: 'gemini', 
      label: 'Gemini 2.0 Flash', 
      description: 'Fast and efficient for most web applications'
    },
    { 
      value: 'claude-sonnet', 
      label: 'Claude 3.5 Sonnet', 
      description: 'Excellent for complex applications and detailed code'
    },
    { 
      value: 'claude-haiku', 
      label: 'Claude 3.5 Haiku', 
      description: 'Fast and cost-effective for simpler applications'
    },
    { 
      value: 'gpt-4o', 
      label: 'GPT-4o', 
      description: 'OpenAI\'s flagship model with strong coding abilities'
    },
    { 
      value: 'gpt-4o-mini', 
      label: 'GPT-4o Mini', 
      description: 'Faster and more affordable version of GPT-4o'
    }
  ];

  const generateApp = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate your web application.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const { data, error } = await supabase.functions.invoke('generate-webapp', {
        body: {
          prompt,
          model: selectedModel
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data) {
        // Transform the response to match our FileContent structure
        const files: FileContent[] = [];
        
        // Add main files
        if (data.html) {
          files.push({
            name: 'index.html',
            content: data.html,
            type: 'html',
            path: 'index.html'
          });
        }
        
        if (data.css) {
          files.push({
            name: 'styles.css',
            content: data.css,
            type: 'css',
            path: 'styles.css'
          });
        }
        
        if (data.javascript) {
          const isTypeScript = data.framework?.toLowerCase().includes('typescript') || 
                              data.packages?.some((pkg: string) => pkg.includes('typescript'));
          files.push({
            name: isTypeScript ? 'script.ts' : 'script.js',
            content: data.javascript,
            type: isTypeScript ? 'typescript' : 'javascript',
            path: isTypeScript ? 'script.ts' : 'script.js'
          });
        }

        // Add additional files if present
        if (data.files && Array.isArray(data.files)) {
          files.push(...data.files);
        }

        const app: GeneratedApp = {
          html: data.html || '',
          css: data.css || '',
          javascript: data.javascript || '',
          description: data.description || 'Generated web application',
          features: data.features || [],
          files: files,
          framework: data.framework || 'Vanilla JavaScript',
          packages: data.packages || [],
          fileStructure: data.fileStructure || ['index.html', 'styles.css', 'script.js']
        };

        setGeneratedApp(app);

        // Add to project history
        const historyItem: ProjectHistoryItem = {
          id: Date.now().toString(),
          prompt,
          generatedApp: app,
          model: selectedModel,
          timestamp: new Date()
        };
        setProjectHistory(prev => [historyItem, ...prev]);

        toast({
          title: "Success!",
          description: "Your web application has been generated successfully.",
        });
      }
    } catch (error) {
      console.error('Error generating app:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate web application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleFileChange = (filePath: string, content: string) => {
    if (!generatedApp) return;

    const updatedFiles = generatedApp.files.map(file =>
      file.path === filePath ? { ...file, content } : file
    );

    // Update main content if it's a primary file
    const updatedApp = { ...generatedApp, files: updatedFiles };
    const file = updatedFiles.find(f => f.path === filePath);
    
    if (file) {
      if (file.type === 'html' && filePath === 'index.html') {
        updatedApp.html = content;
      } else if (file.type === 'css' && filePath === 'styles.css') {
        updatedApp.css = content;
      } else if ((file.type === 'javascript' || file.type === 'typescript') && 
                 (filePath === 'script.js' || filePath === 'script.ts')) {
        updatedApp.javascript = content;
      }
    }

    setGeneratedApp(updatedApp);
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

    const updatedFiles = generatedApp.files.filter(file => file.path !== filePath);
    setGeneratedApp({
      ...generatedApp,
      files: updatedFiles
    });
  };

  const loadProject = (project: ProjectHistoryItem) => {
    setGeneratedApp(project.generatedApp);
    setPrompt(project.prompt);
    setSelectedModel(project.model);
  };

  const downloadApp = () => {
    if (!generatedApp) return;

    // Create a zip-like structure (for now just download main files)
    generatedApp.files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Download Started",
      description: "Your application files are being downloaded.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-6 h-6 text-blue-400" />
            <span>AI Web App Generator</span>
            <Badge variant="secondary">Multi-Framework</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        <span className="text-xs text-prism-text-muted">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Estimated Time</span>
              </label>
              <TimeEstimator 
                prompt={prompt} 
                model={selectedModel}
                onEstimateChange={setEstimatedTime}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your web application</label>
            <Textarea
              placeholder="E.g., Create a React todo app with dark mode, local storage, and drag-and-drop functionality using TypeScript and Tailwind CSS..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={generateApp}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Application
                </>
              )}
            </Button>

            <DevelopmentPlanDialog
              prompt={prompt}
              model={selectedModel}
              onPlanGenerated={setDevelopmentPlan}
            />

            <ProjectHistory 
              projects={projectHistory}
              onLoadProject={loadProject}
            />
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating your application...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Plan Display */}
      {developmentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Development Plan</span>
              <Badge variant="outline">
                {developmentPlan.estimatedComplexity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Framework & Architecture</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Framework:</strong> {developmentPlan.architecture.framework}</p>
                    <p><strong>Styling:</strong> {developmentPlan.architecture.styling}</p>
                    <p><strong>State Management:</strong> {developmentPlan.architecture.stateManagement}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {developmentPlan.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Color Scheme</h4>
                  <div className="flex space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: developmentPlan.colorScheme.primary }}
                      title="Primary"
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: developmentPlan.colorScheme.secondary }}
                      title="Secondary"
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: developmentPlan.colorScheme.accent }}
                      title="Accent"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Packages</h4>
                  <div className="flex flex-wrap gap-1">
                    {developmentPlan.packages.slice(0, 6).map((pkg, index) => (
                      <Badge key={index} variant="outline">
                        {pkg}
                      </Badge>
                    ))}
                    {developmentPlan.packages.length > 6 && (
                      <Badge variant="outline">
                        +{developmentPlan.packages.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Application */}
      {generatedApp && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span>Generated Application</span>
                  <Badge variant="secondary">{generatedApp.framework}</Badge>
                  <Badge variant="outline">
                    {generatedApp.files.length} files
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadApp}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-prism-text-muted mb-2">{generatedApp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {generatedApp.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FileManager
                    files={generatedApp.files}
                    onFileChange={handleFileChange}
                    onFileAdd={handleFileAdd}
                    onFileDelete={handleFileDelete}
                  />
                </div>

                {showPreview && (
                  <div className="space-y-4">
                    <LivePreview app={generatedApp} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WebAppGenerator;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Layers, 
  Sparkles, 
  Download, 
  Settings, 
  Code, 
  Palette,
  TestTube,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { templateSystem } from '@/services/templateSystem';

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  framework: 'react' | 'vue' | 'express';
  configuration: {
    typescript?: boolean;
    eslint?: boolean;
    prettier?: boolean;
    testing?: 'jest' | 'vitest' | 'cypress';
    styling?: 'css' | 'scss' | 'tailwind' | 'styled-components';
    routing?: boolean;
    stateManagement?: 'redux' | 'zustand' | 'context';
  };
}

interface ProjectCustomizations {
  projectName: string;
  author?: string;
  description?: string;
  version?: string;
  license?: string;
  configuration: any;
}

interface TemplateSelectorProps {
  onTemplateGenerate: (project: any) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateGenerate }) => {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customizations, setCustomizations] = useState<ProjectCustomizations>({
    projectName: '',
    author: '',
    description: '',
    version: '1.0.0',
    license: 'MIT',
    configuration: {}
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const availableTemplates = templateSystem.getAvailableTemplates();
    setTemplates(availableTemplates);
  };

  const selectTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    setCustomizations(prev => ({
      ...prev,
      configuration: { ...template.configuration }
    }));
    setShowCustomization(true);
  };

  const generateProject = async () => {
    if (!selectedTemplate || !customizations.projectName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a project name and select a template.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const project = await templateSystem.generateProject(selectedTemplate.id, customizations);
      onTemplateGenerate(project);
      setShowCustomization(false);
      toast({
        title: "Project Generated!",
        description: `${customizations.projectName} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateConfiguration = (key: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value
      }
    }));
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'react': return '⚛️';
      case 'vue': return '💚';
      case 'express': return '🚀';
      default: return '📦';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'react': return 'from-blue-500 to-cyan-500';
      case 'vue': return 'from-green-500 to-emerald-500';
      case 'express': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-prism-primary" />
            <span>Framework Templates</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="grid gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="group cursor-pointer"
                onClick={() => selectTemplate(template)}
              >
                <div className="p-4 rounded-lg border border-prism-border bg-prism-surface/10 hover:bg-prism-surface/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getFrameworkColor(template.framework)} flex items-center justify-center text-xl`}>
                        {getFrameworkIcon(template.framework)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-prism-text">{template.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.framework}
                        </Badge>
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-prism-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <p className="text-sm text-prism-text-muted mb-3">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.configuration.typescript && (
                      <Badge variant="outline" className="text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        TypeScript
                      </Badge>
                    )}
                    {template.configuration.styling === 'tailwind' && (
                      <Badge variant="outline" className="text-xs">
                        <Palette className="w-3 h-3 mr-1" />
                        Tailwind
                      </Badge>
                    )}
                    {template.configuration.testing && (
                      <Badge variant="outline" className="text-xs">
                        <TestTube className="w-3 h-3 mr-1" />
                        {template.configuration.testing}
                      </Badge>
                    )}
                    {template.configuration.eslint && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        ESLint
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Dialog */}
      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-prism-primary" />
              <span>Customize {selectedTemplate?.name}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-prism-text">Project Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-name" className="text-sm font-medium">Project Name *</Label>
                    <Input
                      id="project-name"
                      value={customizations.projectName}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="my-awesome-app"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author" className="text-sm font-medium">Author</Label>
                    <Input
                      id="author"
                      value={customizations.author}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Your Name"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Input
                      id="description"
                      value={customizations.description}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="A brief description of your project"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-prism-text">Configuration</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-prism-surface/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Code className="w-4 h-4 text-prism-primary" />
                      <div>
                        <label className="font-medium text-prism-text">TypeScript</label>
                        <p className="text-xs text-prism-text-muted">Add type safety to your project</p>
                      </div>
                    </div>
                    <Switch
                      checked={customizations.configuration.typescript || false}
                      onCheckedChange={(checked) => updateConfiguration('typescript', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-prism-surface/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-prism-primary" />
                      <div>
                        <label className="font-medium text-prism-text">ESLint</label>
                        <p className="text-xs text-prism-text-muted">Code linting and quality checks</p>
                      </div>
                    </div>
                    <Switch
                      checked={customizations.configuration.eslint || false}
                      onCheckedChange={(checked) => updateConfiguration('eslint', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-prism-surface/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Palette className="w-4 h-4 text-prism-primary" />
                      <div>
                        <label className="font-medium text-prism-text">Prettier</label>
                        <p className="text-xs text-prism-text-muted">Automatic code formatting</p>
                      </div>
                    </div>
                    <Switch
                      checked={customizations.configuration.prettier || false}
                      onCheckedChange={(checked) => updateConfiguration('prettier', checked)}
                    />
                  </div>

                  {selectedTemplate.framework !== 'express' && (
                    <div className="flex items-center justify-between p-3 bg-prism-surface/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Palette className="w-4 h-4 text-prism-primary" />
                        <div>
                          <label className="font-medium text-prism-text">Tailwind CSS</label>
                          <p className="text-xs text-prism-text-muted">Utility-first CSS framework</p>
                        </div>
                      </div>
                      <Switch
                        checked={customizations.configuration.styling === 'tailwind'}
                        onCheckedChange={(checked) => updateConfiguration('styling', checked ? 'tailwind' : 'css')}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-prism-surface/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TestTube className="w-4 h-4 text-prism-primary" />
                      <div>
                        <label className="font-medium text-prism-text">Testing Framework</label>
                        <p className="text-xs text-prism-text-muted">Unit testing setup</p>
                      </div>
                    </div>
                    <Switch
                      checked={!!customizations.configuration.testing}
                      onCheckedChange={(checked) => updateConfiguration('testing', checked ? 'vitest' : undefined)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-prism-border">
                <Button
                  onClick={() => setShowCustomization(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateProject}
                  disabled={isGenerating || !customizations.projectName.trim()}
                  className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSelector;
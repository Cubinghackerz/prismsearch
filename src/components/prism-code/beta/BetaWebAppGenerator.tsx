import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, 
  AlertTriangle, Package, Brain, Rocket, Code, Smartphone, Monitor,
  Terminal, Database, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Language and Framework types
type SupportedLanguage = 'html-js' | 'react' | 'vue' | 'svelte' | 'angular' | 'python' | 'node' | 'rust' | 'go' | 'java';
type PreviewType = 'web' | 'desktop' | 'mobile' | 'terminal';

interface BetaGeneratedApp {
  language: SupportedLanguage;
  framework?: string;
  files: {
    [filename: string]: string;
  };
  dependencies?: string[];
  description: string;
  features: string[];
  previewType: PreviewType;
  buildCommands?: string[];
  runCommands?: string[];
}

interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  icon: React.ReactNode;
  color: string;
  previewType: PreviewType;
  description: string;
  extensions: string[];
}

const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: 'html-js',
    name: 'HTML/CSS/JS',
    icon: <Globe className="w-4 h-4" />,
    color: 'from-orange-500 to-red-500',
    previewType: 'web',
    description: 'Classic web development',
    extensions: ['.html', '.css', '.js']
  },
  {
    id: 'react',
    name: 'React',
    icon: <Code className="w-4 h-4" />,
    color: 'from-blue-500 to-cyan-500',
    previewType: 'web',
    description: 'Modern React applications',
    extensions: ['.jsx', '.tsx', '.css']
  },
  {
    id: 'vue',
    name: 'Vue.js',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'from-green-500 to-emerald-500',
    previewType: 'web',
    description: 'Progressive Vue framework',
    extensions: ['.vue', '.js', '.css']
  },
  {
    id: 'python',
    name: 'Python',
    icon: <Terminal className="w-4 h-4" />,
    color: 'from-yellow-500 to-green-500',
    previewType: 'terminal',
    description: 'Python applications & scripts',
    extensions: ['.py', '.txt']
  },
  {
    id: 'node',
    name: 'Node.js',
    icon: <Database className="w-4 h-4" />,
    color: 'from-green-500 to-lime-500',
    previewType: 'terminal',
    description: 'Server-side JavaScript',
    extensions: ['.js', '.json', '.md']
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: <Settings className="w-4 h-4" />,
    color: 'from-orange-500 to-amber-500',
    previewType: 'terminal',
    description: 'Systems programming language',
    extensions: ['.rs', '.toml']
  }
];

const BetaWebAppGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('react');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<BetaGeneratedApp | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const { toast } = useToast();

  const currentLanguageConfig = SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguage);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate your application.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate generation for now - will be replaced with actual API calls
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockApp: BetaGeneratedApp = {
        language: selectedLanguage,
        framework: selectedLanguage === 'react' ? 'React 18' : undefined,
        files: {
          'App.jsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated ${currentLanguageConfig?.name} App</h1>
        <p>${prompt}</p>
      </header>
    </div>
  );
}

export default App;`,
          'App.css': `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}`,
          'package.json': JSON.stringify({
            name: 'generated-app',
            version: '1.0.0',
            dependencies: {
              'react': '^18.0.0',
              'react-dom': '^18.0.0'
            }
          }, null, 2)
        },
        description: `Generated ${currentLanguageConfig?.name} application based on: ${prompt}`,
        features: ['Modern UI', 'Responsive Design', 'Component Architecture'],
        previewType: currentLanguageConfig?.previewType || 'web',
        dependencies: ['react', 'react-dom'],
        buildCommands: ['npm install', 'npm run build'],
        runCommands: ['npm start']
      };

      setGeneratedApp(mockApp);
      setActiveTab('preview');
      
      toast({
        title: "Success!",
        description: `${currentLanguageConfig?.name} application generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-purple-500/30 bg-purple-500/5">
        <Rocket className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-300">
          <strong>Beta Version:</strong> Multi-language support with enhanced previews and deployment options.
          Features are experimental and may change.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>AI Generator</span>
              <Badge variant="outline" className="ml-2">Beta</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Language/Framework</label>
              <Select value={selectedLanguage} onValueChange={(value: SupportedLanguage) => setSelectedLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      <div className="flex items-center space-x-2">
                        {lang.icon}
                        <span>{lang.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {lang.previewType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentLanguageConfig && (
                <p className="text-xs text-muted-foreground">
                  {currentLanguageConfig.description}
                </p>
              )}
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe your application</label>
              <Textarea
                placeholder={`Describe the ${currentLanguageConfig?.name} application you want to create...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate {currentLanguageConfig?.name} App
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <span>Preview</span>
              {generatedApp && (
                <Badge variant="outline">
                  {generatedApp.previewType}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedApp ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`bg-gradient-to-r ${currentLanguageConfig?.color} text-white`}>
                    {generatedApp.language}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Rocket className="w-4 h-4 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-secondary/20 min-h-[300px]">
                  {generatedApp.previewType === 'web' ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Monitor className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Web preview will appear here</p>
                      </div>
                    </div>
                  ) : generatedApp.previewType === 'terminal' ? (
                    <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
                      <div className="mb-2">$ npm start</div>
                      <div className="text-gray-400">Starting {generatedApp.language} application...</div>
                      <div className="text-blue-400">✓ Application ready</div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Smartphone className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Mobile preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Generated Files:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(generatedApp.files).map((filename) => (
                      <Badge key={filename} variant="secondary" className="justify-start">
                        <FileText className="w-3 h-3 mr-1" />
                        {filename}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Generate an application to see the preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BetaWebAppGenerator;
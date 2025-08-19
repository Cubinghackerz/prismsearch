
export interface FileContent {
  name: string;
  content: string;
  type: 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'json' | 'md' | 'txt';
  path: string;
}

export interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
  files: FileContent[];
  framework: string;
  packages: string[];
  fileStructure: string[];
}

export interface ProjectHistoryItem {
  id: string;
  prompt: string;
  generatedApp: GeneratedApp;
  model: string;
  timestamp: Date;
}

export interface DevelopmentPlan {
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


export interface GeneratedFile {
  filename: string;
  content: string;
  language: string;
  type: 'component' | 'style' | 'config' | 'asset' | 'test';
}

export interface GeneratedApp {
  files: GeneratedFile[];
  description: string;
  features: string[];
  framework: 'vanilla' | 'react' | 'vue' | 'svelte' | 'angular';
  packages: string[];
  devDependencies?: string[];
  buildScript?: string;
  startScript?: string;
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

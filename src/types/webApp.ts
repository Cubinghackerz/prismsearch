
export interface GeneratedFile {
  path: string;
  content: string;
  type: 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'json' | 'md' | 'txt';
}

export interface GeneratedApp {
  files: GeneratedFile[];
  description: string;
  features: string[];
  framework: string;
  packages: string[];
  // Legacy properties for backward compatibility
  html?: string;
  css?: string;
  javascript?: string;
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

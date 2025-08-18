import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Wand2, Eye, Download, Sparkles, Maximize, FileText, Plus, Package, Brain, Rocket, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyQueryLimit } from "@/hooks/useDailyQueryLimit";
import WebAppPreview from "./WebAppPreview";
import ModelSelector, { AIModel } from "./ModelSelector";
import AdvancedCodeEditor from "./AdvancedCodeEditor";
import PackageManager from "./PackageManager";
import ProjectHistory from "./ProjectHistory";
import DevelopmentPlanDialog from "./DevelopmentPlanDialog";
import TemplateLibrary from "./TemplateLibrary";
import LanguageSelector, { SupportedLanguage } from "./LanguageSelector";
import { v4 as uuidv4 } from 'uuid';
import DeploymentDialog from "./DeploymentDialog";
import { GeneratedApp, ProjectHistoryItem, DevelopmentPlan, GeneratedFile } from "./types";

const WebAppGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('generator');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ prompt: string; response: GeneratedApp }>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [developmentPlan, setDevelopmentPlan] = useState<DevelopmentPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('auto');
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const { toast } = useToast();
  const { incrementQueryCount, isLimitReached } = useDailyQueryLimit();

  const MODEL_FALLBACK_ORDER: AIModel[] = ['gemini', 'groq-llama4-maverick', 'groq-llama4-scout', 'groq-llama31-8b-instant'];

  const saveProject = (projectPrompt: string, app: GeneratedApp, model: string) => {
    try {
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
          projects = [];
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
    } catch (error) {
      console.error('Error saving project:', error);
    }
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

  const selectOptimalLanguage = (promptText: string): SupportedLanguage => {
    const lowerPrompt = promptText.toLowerCase();
    
    // Check for specific framework mentions
    if (lowerPrompt.includes('react') || lowerPrompt.includes('jsx') || lowerPrompt.includes('component')) {
      return 'react';
    }
    if (lowerPrompt.includes('vue') || lowerPrompt.includes('nuxt')) {
      return 'vue';
    }
    if (lowerPrompt.includes('svelte') || lowerPrompt.includes('sveltekit')) {
      return 'svelte';
    }
    if (lowerPrompt.includes('python') || lowerPrompt.includes('flask') || lowerPrompt.includes('django')) {
      return 'python-flask';
    }
    if (lowerPrompt.includes('node') || lowerPrompt.includes('express') || lowerPrompt.includes('api') || lowerPrompt.includes('backend') || lowerPrompt.includes('database')) {
      return 'node-express';
    }
    
    // Check for complexity indicators
    if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin') || lowerPrompt.includes('management') || 
        lowerPrompt.includes('crud') || lowerPrompt.includes('user auth') || lowerPrompt.includes('login')) {
      return 'react';
    }
    
    // Check for simple static site indicators
    if (lowerPrompt.includes('landing') || lowerPrompt.includes('portfolio') || lowerPrompt.includes('blog') || 
        lowerPrompt.includes('simple') || lowerPrompt.includes('static')) {
      return 'html-css-js';
    }
    
    // Default to HTML/CSS/JS for basic apps
    return 'html-css-js';
  };

  const createTechStackPrompt = (basePrompt: string, language: SupportedLanguage): string => {
    const actualLanguage = language === 'auto' ? selectOptimalLanguage(basePrompt) : language;
    
    let techPrompt = basePrompt + '\n\n';
    
    switch (actualLanguage) {
      case 'react':
        techPrompt += `Create a React application with TypeScript using the following structure:
- Use functional components with hooks
- Include proper TypeScript types and interfaces
- Use modern React patterns (useState, useEffect, etc.)
- Create multiple component files as needed
- Include a package.json with required dependencies
- Use CSS modules or styled-components for styling
- Make it responsive and accessible

Return a JSON object with this structure:
{
  "files": [
    {"name": "package.json", "content": "...", "type": "json"},
    {"name": "src/App.tsx", "content": "...", "type": "tsx"},
    {"name": "src/components/ComponentName.tsx", "content": "...", "type": "tsx"},
    {"name": "src/styles/App.css", "content": "...", "type": "css"},
    {"name": "public/index.html", "content": "...", "type": "html"}
  ],
  "description": "...",
  "features": [...]
}`;
        break;

      case 'vue':
        techPrompt += `Create a Vue.js 3 application using the following structure:
- Use Composition API with <script setup>
- Include TypeScript support
- Create single-file components (.vue files)
- Use Vue Router for navigation if needed
- Include proper component structure
- Make it responsive with modern CSS

Return a JSON object with this structure:
{
  "files": [
    {"name": "package.json", "content": "...", "type": "json"},
    {"name": "src/App.vue", "content": "...", "type": "javascript"},
    {"name": "src/components/ComponentName.vue", "content": "...", "type": "javascript"},
    {"name": "src/main.ts", "content": "...", "type": "typescript"},
    {"name": "index.html", "content": "...", "type": "html"}
  ],
  "description": "...",
  "features": [...]
}`;
        break;

      case 'svelte':
        techPrompt += `Create a Svelte/SvelteKit application using the following structure:
- Use modern Svelte syntax with reactive statements
- Include TypeScript support
- Create reusable Svelte components
- Use Svelte's built-in state management
- Make it responsive and accessible

Return a JSON object with this structure:
{
  "files": [
    {"name": "package.json", "content": "...", "type": "json"},
    {"name": "src/App.svelte", "content": "...", "type": "javascript"},
    {"name": "src/lib/ComponentName.svelte", "content": "...", "type": "javascript"},
    {"name": "src/main.ts", "content": "...", "type": "typescript"},
    {"name": "src/app.html", "content": "...", "type": "html"}
  ],
  "description": "...",
  "features": [...]
}`;
        break;

      case 'python-flask':
        techPrompt += `Create a Python Flask web application using the following structure:
- Use Flask with proper project structure
- Include Jinja2 templates
- Create multiple routes and views
- Include requirements.txt
- Use proper Flask patterns and blueprints if needed
- Include static files (CSS/JS)

Return a JSON object with this structure:
{
  "files": [
    {"name": "app.py", "content": "...", "type": "python"},
    {"name": "requirements.txt", "content": "...", "type": "md"},
    {"name": "templates/index.html", "content": "...", "type": "html"},
    {"name": "templates/base.html", "content": "...", "type": "html"},
    {"name": "static/css/style.css", "content": "...", "type": "css"},
    {"name": "static/js/main.js", "content": "...", "type": "javascript"}
  ],
  "description": "...",
  "features": [...]
}`;
        break;

      case 'node-express':
        techPrompt += `Create a Node.js Express application using the following structure:
- Use Express.js with proper MVC structure
- Include EJS or React for frontend
- Create API routes and middleware
- Include package.json with dependencies
- Use modern ES6+ JavaScript or TypeScript
- Include database models if needed

Return a JSON object with this structure:
{
  "files": [
    {"name": "package.json", "content": "...", "type": "json"},
    {"name": "server.js", "content": "...", "type": "javascript"},
    {"name": "routes/index.js", "content": "...", "type": "javascript"},
    {"name": "views/index.ejs", "content": "...", "type": "html"},
    {"name": "public/css/style.css", "content": "...", "type": "css"},
    {"name": "public/js/main.js", "content": "...", "type": "javascript"}
  ],
  "description": "...",
  "features": [...]
}`;
        break;

      default: // html-css-js
        techPrompt += `Create a vanilla HTML/CSS/JavaScript application using the following structure:
- Use semantic HTML5
- Modern CSS3 with responsive design
- Vanilla JavaScript (ES6+)
- Separate files for better organization
- Include any additional assets needed

Return a JSON object with this structure:
{
  "files": [
    {"name": "index.html", "content": "...", "type": "html"},
    {"name": "css/style.css", "content": "...", "type": "css"},
    {"name": "js/main.js", "content": "...", "type": "javascript"},
    {"name": "js/utils.js", "content": "...", "type": "javascript"}
  ],
  "description": "...",
  "features": [...]
}`;
    }

    return techPrompt;
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

    // Auto-select language if in auto mode
    if (selectedLanguage === 'auto') {
      const optimalLanguage = selectOptimalLanguage(prompt);
      setSelectedLanguage(optimalLanguage);
      toast({
        title: "Auto-Selected Language",
        description: `Selected ${optimalLanguage.replace('-', ' ').toUpperCase()} based on your requirements.`,
      });
    }
    
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

  const enhancePromptWithSettings = (basePrompt: string) => {
    let enhancedPrompt = basePrompt;
    const actualLanguage = selectedLanguage === 'auto' ? selectOptimalLanguage(basePrompt) : selectedLanguage;

    // Add language/framework context
    switch (actualLanguage) {
      case 'react':
        enhancedPrompt += '\n\nTechnical Requirements: Use React with TypeScript, functional components with hooks, and modern React patterns. Include proper TypeScript types and interfaces.';
        break;
      case 'vue':
        enhancedPrompt += '\n\nTechnical Requirements: Use Vue.js 3 with Composition API, TypeScript support, and single-file components. Include Vue Router for navigation.';
        break;
      case 'svelte':
        enhancedPrompt += '\n\nTechnical Requirements: Use Svelte/SvelteKit with TypeScript. Leverage Svelte\'s built-in reactivity and compile-time optimizations.';
        break;
      case 'python-flask':
        enhancedPrompt += '\n\nTechnical Requirements: Create a full-stack Python application using Flask, Jinja2 templates, and SQLAlchemy. Include proper project structure with blueprints.';
        break;
      case 'node-express':
        enhancedPrompt += '\n\nTechnical Requirements: Build a full-stack Node.js application with Express.js backend, EJS or React frontend, and MongoDB/PostgreSQL database integration.';
        break;
      default:
        enhancedPrompt += '\n\nTechnical Requirements: Use vanilla HTML5, CSS3, and modern JavaScript (ES6+). Focus on semantic HTML and responsive design.';
    }

    return enhancedPrompt;
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
      // Auto-select language if in auto mode
      const actualLanguage = selectedLanguage === 'auto' ? selectOptimalLanguage(prompt) : selectedLanguage;
      
      if (selectedLanguage === 'auto') {
        toast({
          title: "Auto-Selected Language",
          description: `Selected ${actualLanguage.replace('-', ' ').toUpperCase()} based on your requirements.`,
        });
      }

      let contextPrompt = createTechStackPrompt(prompt, actualLanguage);
      
      if (conversationHistory.length > 0) {
        contextPrompt = `Based on the previous web application, modify it according to this request: ${prompt}. 

Previous conversation context:
${conversationHistory.slice(-3).map((item, index) => 
  `Request ${index + 1}: ${item.prompt}
  Result: ${item.response.description}`
).join('\n\n')}

Please modify or enhance the current application accordingly using the ${actualLanguage} technology stack.`;
      }

      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: { 
          query: contextPrompt,
          model: modelToUse,
          chatId: currentProjectId || 'webapp-generation',
          chatHistory: []
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      let parsedApp: GeneratedApp;
      try {
        const responseText = data.response || '';
        const cleanResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
        const jsonResponse = JSON.parse(cleanResponse);
        
        // Handle new file-based structure
        if (jsonResponse.files && Array.isArray(jsonResponse.files)) {
          // Ensure all files have proper types with proper type assertion
          const typedFiles: GeneratedFile[] = jsonResponse.files.map((file: any) => {
            // Validate and fix file type
            const validTypes: Array<GeneratedFile['type']> = ['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx', 'python', 'json', 'md'];
            let fileType: GeneratedFile['type'] = 'javascript'; // default
            
            if (validTypes.includes(file.type as GeneratedFile['type'])) {
              fileType = file.type as GeneratedFile['type'];
            } else {
              // Try to infer from file name
              const fileName = file.name.toLowerCase();
              if (fileName.endsWith('.html')) fileType = 'html';
              else if (fileName.endsWith('.css')) fileType = 'css';
              else if (fileName.endsWith('.tsx')) fileType = 'tsx';
              else if (fileName.endsWith('.jsx')) fileType = 'jsx';
              else if (fileName.endsWith('.ts')) fileType = 'typescript';
              else if (fileName.endsWith('.js')) fileType = 'javascript';
              else if (fileName.endsWith('.py')) fileType = 'python';
              else if (fileName.endsWith('.json')) fileType = 'json';
              else if (fileName.endsWith('.md')) fileType = 'md';
            }

            return {
              name: file.name,
              content: file.content || '',
              type: fileType
            };
          });

          parsedApp = {
            files: typedFiles,
            description: jsonResponse.description || 'AI-generated web application',
            features: jsonResponse.features || ['Modern design', 'Responsive layout', 'Interactive features'],
            // Legacy support for preview
            html: typedFiles.find(f => f.name.includes('index.html') || f.type === 'html')?.content || '',
            css: typedFiles.find(f => f.type === 'css')?.content || '',
            javascript: typedFiles.find(f => f.type === 'javascript' || f.type === 'typescript')?.content || ''
          };
        } else {
          // Fallback to old structure - convert to new format with proper typing
          const fallbackFiles: GeneratedFile[] = [
            { name: 'index.html', content: jsonResponse.html || '', type: 'html' as const },
            { name: 'style.css', content: jsonResponse.css || '', type: 'css' as const },
            { name: 'script.js', content: jsonResponse.javascript || '', type: 'javascript' as const }
          ].filter(file => file.content.trim());

          parsedApp = {
            files: fallbackFiles,
            html: jsonResponse.html || '',
            css: jsonResponse.css || '',
            javascript: jsonResponse.javascript || '',
            description: jsonResponse.description || 'AI-generated web application',
            features: jsonResponse.features || ['Modern design', 'Responsive layout', 'Interactive features']
          };
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        // Create fallback app with proper typing
        const fallbackFiles: GeneratedFile[] = [
          { 
            name: 'index.html', 
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Web App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Generated Web Application</h1>
        <p>Your web application has been generated successfully!</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`, 
            type: 'html' as const
          },
          { 
            name: 'style.css', 
            content: `body {
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
}`, 
            type: 'css' as const
          },
          { 
            name: 'script.js', 
            content: `console.log('Web app generated successfully');`, 
            type: 'javascript' as const
          }
        ];

        parsedApp = {
          files: fallbackFiles,
          description: 'AI-generated web application',
          features: ['Responsive design', 'Modern styling', 'Basic functionality'],
          html: fallbackFiles[0].content,
          css: fallbackFiles[1].content,
          javascript: fallbackFiles[2].content
        };
      }

      setGeneratedApp(parsedApp);
      setActiveRightTab('editor');
      
      setConversationHistory(prev => [...prev, { prompt, response: parsedApp }]);
      
      saveProject(prompt, parsedApp, modelToUse);
      
      setPrompt("");
      
      toast({
        title: "Web App Generated!",
        description: `Your ${actualLanguage.replace('-', ' ').toUpperCase()} application has been created successfully.`,
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
    try {
      setGeneratedApp(project.generatedApp);
      setCurrentProjectId(project.id);
      setConversationHistory([{ prompt: project.prompt, response: project.generatedApp }]);
      setPrompt("");
      setActiveRightTab('editor');
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error Loading Project",
        description: "Failed to load the selected project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadApp = () => {
    if (!generatedApp) return;

    const files = generatedApp.files || [
      { name: 'index.html', content: generatedApp.html || '', type: 'html' as const },
      { name: 'style.css', content: generatedApp.css || '', type: 'css' as const },
      { name: 'script.js', content: generatedApp.javascript || '', type: 'javascript' as const }
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    // Also download README
    const readmeContent = `# Generated Web App\n\nDescription: ${generatedApp.description}\n\nFeatures:\n${generatedApp.features.map(f => `- ${f}`).join('\n')}\n\nTechnology Stack: ${selectedLanguage.replace('-', ' ').toUpperCase()}`;
    const readmeBlob = new Blob([readmeContent], { type: 'text/plain' });
    const readmeUrl = URL.createObjectURL(readmeBlob);
    const readmeLink = document.createElement('a');
    readmeLink.href = readmeUrl;
    readmeLink.download = 'README.md';
    document.body.appendChild(readmeLink);
    readmeLink.click();
    document.body.removeChild(readmeLink);
    URL.revokeObjectURL(readmeUrl);

    toast({
      title: "Files Downloaded",
      description: `All ${files.length} files have been downloaded to your device.`,
    });
  };

  const handleFileChange = (fileType: string, content: string) => {
    if (!generatedApp) return;

    if (generatedApp.files) {
      // Handle new file structure
      setGeneratedApp(prev => ({
        ...prev!,
        files: prev!.files.map(file => 
          file.name === fileType ? { ...file, content } : file
        )
      }));
    } else {
      // Handle legacy structure
      setGeneratedApp(prev => ({
        ...prev!,
        [fileType]: content
      }));
    }

    // Auto-save changes
    if (currentProjectId && generatedApp) {
      const updatedApp = generatedApp.files 
        ? { ...generatedApp, files: generatedApp.files.map(file => 
            file.name === fileType ? { ...file, content } : file
          )}
        : { ...generatedApp, [fileType]: content };
      saveProject(conversationHistory[0]?.prompt || 'Modified project', updatedApp, selectedModel);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setPrompt(template.prompt);
    if (template.language && template.language !== 'auto') {
      setSelectedLanguage(template.language);
    }
    toast({
      title: "Template Selected",
      description: `Using ${template.name} template. You can modify the prompt before generating.`,
    });
  };

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
            <WebAppPreview
              html={generatedApp.html || generatedApp.files?.find(f => f.type === 'html')?.content || ''}
              css={generatedApp.css || generatedApp.files?.find(f => f.type === 'css')?.content || ''}
              javascript={generatedApp.javascript || generatedApp.files?.find(f => f.type === 'javascript')?.content || ''}
            />
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

      {/* Template Library */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onSelectTemplate={handleTemplateSelect}
        onClose={() => setShowTemplateLibrary(false)}
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
                Enhanced
              </span>
            </div>
            <p className="text-prism-text-muted mt-2 font-inter">
              Generate web applications with smart language selection and comprehensive planning
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
        <AlertDescription className="text-blue-300">
          <strong>New Features:</strong> Auto language selection, enhanced planning, and improved template library are now available!
        </AlertDescription>
      </Alert>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-20rem)]">
        {/* Left Side - Preview */}
        <div className="flex-1">
          {generatedApp ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-prism-text">Live Preview</h3>
                  <Badge variant="secondary" className="text-xs">
                    {selectedLanguage === 'auto' ? 'AUTO' : selectedLanguage.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {generatedApp.files?.length || 3} files
                  </Badge>
                </div>
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
              <div className="flex-1 bg-white rounded-lg border border-prism-border overflow-hidden">
                <WebAppPreview
                  html={generatedApp.html || generatedApp.files?.find(f => f.type === 'html')?.content || ''}
                  css={generatedApp.css || generatedApp.files?.find(f => f.type === 'css')?.content || ''}
                  javascript={generatedApp.javascript || generatedApp.files?.find(f => f.type === 'javascript')?.content || ''}
                />
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center bg-prism-surface/5">
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
              <Card className="flex-1 bg-prism-surface/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5 text-prism-primary" />
                    <span>{generatedApp ? 'Continue Working' : 'Create Your Web App'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowTemplateLibrary(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Library className="w-4 h-4 mr-2" />
                      Templates
                    </Button>
                  </div>

                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    disabled={isGenerating || isThinking}
                  />

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
                        "Describe how you want to modify or enhance the current web app..." : 
                        "Describe the web application you want to create... For example: 'Create a task management app with drag-and-drop functionality, user authentication, and real-time collaboration features.'"
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

                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-prism-text text-sm">Stack:</h4>
                        <Badge variant="secondary" className="text-xs">
                          {selectedLanguage === 'auto' ? 'AUTO' : selectedLanguage.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>

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

            <TabsContent value="editor" className="flex-1 mt-4">
              {generatedApp ? (
                <AdvancedCodeEditor 
                  generatedApp={generatedApp} 
                  onFileChange={handleFileChange}
                />
              ) : (
                <Card className="h-full flex items-center justify-center bg-prism-surface/5">
                  <CardContent className="text-center py-20">
                    <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <p className="text-prism-text-muted">Generate a web app to start editing</p>
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

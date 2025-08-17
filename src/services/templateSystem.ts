// Framework Template System
interface TemplateFile {
  path: string;
  content: string;
  type: 'text' | 'binary';
  encoding?: string;
}

interface PackageDependency {
  name: string;
  version: string;
  dev?: boolean;
}

interface TemplateConfiguration {
  eslint?: boolean;
  prettier?: boolean;
  typescript?: boolean;
  testing?: 'jest' | 'vitest' | 'cypress';
  styling?: 'css' | 'scss' | 'tailwind' | 'styled-components';
  routing?: boolean;
  stateManagement?: 'redux' | 'zustand' | 'context';
}

interface ProjectCustomizations {
  projectName: string;
  author?: string;
  description?: string;
  version?: string;
  license?: string;
  configuration: TemplateConfiguration;
}

interface GeneratedProject {
  files: ProcessedFile[];
  structure: FolderStructure;
  scripts: Record<string, string>;
  readme: string;
}

interface ProcessedFile {
  path: string;
  content: string;
  type: 'text' | 'binary';
}

interface FolderStructure {
  [key: string]: FolderStructure | string;
}

export class TemplateSystem {
  private templates: Map<string, TemplateConfig> = new Map();
  
  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // React Template
    this.templates.set('react', {
      id: 'react',
      name: 'React Application',
      description: 'Modern React app with TypeScript and Vite',
      framework: 'react',
      files: this.getReactTemplateFiles(),
      dependencies: this.getReactDependencies(),
      scripts: {
        'dev': 'vite',
        'build': 'vite build',
        'preview': 'vite preview',
        'test': 'vitest',
        'lint': 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
      },
      configuration: {
        typescript: true,
        eslint: true,
        prettier: true,
        testing: 'vitest',
        styling: 'tailwind'
      }
    });

    // Vue Template
    this.templates.set('vue', {
      id: 'vue',
      name: 'Vue Application',
      description: 'Vue 3 application with Composition API',
      framework: 'vue',
      files: this.getVueTemplateFiles(),
      dependencies: this.getVueDependencies(),
      scripts: {
        'dev': 'vite',
        'build': 'vite build',
        'preview': 'vite preview',
        'test': 'vitest'
      },
      configuration: {
        typescript: true,
        eslint: true,
        prettier: true,
        testing: 'vitest'
      }
    });

    // Express Template
    this.templates.set('express', {
      id: 'express',
      name: 'Express API',
      description: 'Express.js REST API with TypeScript',
      framework: 'express',
      files: this.getExpressTemplateFiles(),
      dependencies: this.getExpressDependencies(),
      scripts: {
        'start': 'node dist/index.js',
        'dev': 'tsx watch src/index.ts',
        'build': 'tsc',
        'test': 'jest'
      },
      configuration: {
        typescript: true,
        eslint: true,
        testing: 'jest'
      }
    });
  }

  async generateProject(
    templateId: string, 
    customizations: ProjectCustomizations
  ): Promise<GeneratedProject> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const files = await this.processTemplateFiles(template.files, customizations);
    const packageJson = this.generatePackageJson(template, customizations);
    const configFiles = this.generateConfigFiles(template, customizations);
    const readme = this.generateReadme(template, customizations);

    return {
      files: [...files, packageJson, ...configFiles],
      structure: this.generateFolderStructure(template),
      scripts: template.scripts,
      readme
    };
  }

  private async processTemplateFiles(
    files: TemplateFile[], 
    customizations: ProjectCustomizations
  ): Promise<ProcessedFile[]> {
    return files.map(file => {
      let content = file.content;
      
      // Replace template variables
      content = content.replace(/{{projectName}}/g, customizations.projectName);
      content = content.replace(/{{author}}/g, customizations.author || 'Prism User');
      content = content.replace(/{{description}}/g, customizations.description || '');
      content = content.replace(/{{version}}/g, customizations.version || '1.0.0');
      
      return {
        path: file.path,
        content,
        type: file.type
      };
    });
  }

  private generatePackageJson(
    template: TemplateConfig, 
    customizations: ProjectCustomizations
  ): ProcessedFile {
    const packageJson = {
      name: customizations.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: customizations.version || '1.0.0',
      description: customizations.description || '',
      type: 'module',
      scripts: template.scripts,
      dependencies: template.dependencies.reduce((acc, dep) => {
        if (!dep.dev) acc[dep.name] = dep.version;
        return acc;
      }, {} as Record<string, string>),
      devDependencies: template.dependencies.reduce((acc, dep) => {
        if (dep.dev) acc[dep.name] = dep.version;
        return acc;
      }, {} as Record<string, string>),
      author: customizations.author || '',
      license: customizations.license || 'MIT'
    };

    return {
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
      type: 'text'
    };
  }

  private generateConfigFiles(
    template: TemplateConfig, 
    customizations: ProjectCustomizations
  ): ProcessedFile[] {
    const configs: ProcessedFile[] = [];

    if (customizations.configuration.typescript) {
      configs.push({
        path: 'tsconfig.json',
        content: this.getTsConfig(template.framework),
        type: 'text'
      });
    }

    if (customizations.configuration.eslint) {
      configs.push({
        path: '.eslintrc.json',
        content: this.getEslintConfig(template.framework),
        type: 'text'
      });
    }

    if (customizations.configuration.prettier) {
      configs.push({
        path: '.prettierrc',
        content: this.getPrettierConfig(),
        type: 'text'
      });
    }

    if (customizations.configuration.styling === 'tailwind') {
      configs.push({
        path: 'tailwind.config.js',
        content: this.getTailwindConfig(),
        type: 'text'
      });
    }

    return configs;
  }

  private generateReadme(
    template: TemplateConfig, 
    customizations: ProjectCustomizations
  ): string {
    return `# ${customizations.projectName}

${customizations.description || 'A web application built with Prism Pages'}

## Tech Stack

- **Framework**: ${template.name}
- **Language**: ${customizations.configuration.typescript ? 'TypeScript' : 'JavaScript'}
- **Styling**: ${customizations.configuration.styling || 'CSS'}
- **Testing**: ${customizations.configuration.testing || 'None'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Scripts

${Object.entries(template.scripts).map(([script, command]) => 
  `- \`npm run ${script}\`: ${command}`
).join('\n')}

## Generated with Prism Pages

This project was generated using Prism Pages - an AI-powered web application generator.

Visit [Prism](https://prism.com) to create your own applications!
`;
  }

  getAvailableTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): TemplateConfig | undefined {
    return this.templates.get(id);
  }

  // Template file definitions
  private getReactTemplateFiles(): TemplateFile[] {
    return [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>{{projectName}}</h1>
        <p>Welcome to your new React application!</p>
      </header>
    </div>
  );
}

export default App;`,
        type: 'text'
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
        type: 'text'
      },
      {
        path: 'src/App.css',
        content: `.App {
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
        type: 'text'
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        type: 'text'
      }
    ];
  }

  private getVueTemplateFiles(): TemplateFile[] {
    return [
      {
        path: 'src/App.vue',
        content: `<template>
  <div id="app">
    <header>
      <h1>{{ projectName }}</h1>
      <p>Welcome to your new Vue application!</p>
    </header>
  </div>
</template>

<script setup lang="ts">
const projectName = "{{projectName}}";
</script>

<style scoped>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

header {
  padding: 20px;
}
</style>`,
        type: 'text'
      },
      {
        path: 'src/main.ts',
        content: `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');`,
        type: 'text'
      }
    ];
  }

  private getExpressTemplateFiles(): TemplateFile[] {
    return [
      {
        path: 'src/index.ts',
        content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to {{projectName}} API!',
    version: '{{version}}'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`🚀 {{projectName}} server running on port \${port}\`);
});`,
        type: 'text'
      }
    ];
  }

  // Dependencies for each framework
  private getReactDependencies(): PackageDependency[] {
    return [
      { name: 'react', version: '^18.3.1' },
      { name: 'react-dom', version: '^18.3.1' },
      { name: '@types/react', version: '^18.3.3', dev: true },
      { name: '@types/react-dom', version: '^18.3.0', dev: true },
      { name: '@vitejs/plugin-react', version: '^4.3.1', dev: true },
      { name: 'vite', version: '^5.4.1', dev: true },
      { name: 'typescript', version: '^5.5.3', dev: true },
      { name: 'tailwindcss', version: '^3.4.1', dev: true },
      { name: 'autoprefixer', version: '^10.4.19', dev: true },
      { name: 'postcss', version: '^8.4.38', dev: true }
    ];
  }

  private getVueDependencies(): PackageDependency[] {
    return [
      { name: 'vue', version: '^3.4.21' },
      { name: '@vitejs/plugin-vue', version: '^5.0.4', dev: true },
      { name: 'vite', version: '^5.4.1', dev: true },
      { name: 'typescript', version: '^5.5.3', dev: true },
      { name: 'vue-tsc', version: '^2.0.21', dev: true }
    ];
  }

  private getExpressDependencies(): PackageDependency[] {
    return [
      { name: 'express', version: '^4.19.2' },
      { name: 'cors', version: '^2.8.5' },
      { name: 'helmet', version: '^7.1.0' },
      { name: '@types/express', version: '^4.17.21', dev: true },
      { name: '@types/cors', version: '^2.8.17', dev: true },
      { name: '@types/node', version: '^20.12.7', dev: true },
      { name: 'typescript', version: '^5.4.5', dev: true },
      { name: 'tsx', version: '^4.7.1', dev: true },
      { name: 'jest', version: '^29.7.0', dev: true },
      { name: '@types/jest', version: '^29.5.12', dev: true }
    ];
  }

  // Configuration file generators
  private getTsConfig(framework: string): string {
    const baseConfig = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    };

    if (framework === 'express') {
      baseConfig.compilerOptions.lib = ['ES2020'];
      baseConfig.compilerOptions.jsx = undefined as any;
      baseConfig.compilerOptions.noEmit = false;
      baseConfig.compilerOptions.outDir = 'dist';
      baseConfig.include = ['src/**/*'];
    }

    return JSON.stringify(baseConfig, null, 2);
  }

  private getEslintConfig(framework: string): string {
    const baseConfig = {
      root: true,
      env: { browser: true, es2020: true },
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
      ],
      ignorePatterns: ['dist', '.eslintrc.cjs'],
      parser: '@typescript-eslint/parser',
      plugins: ['react-refresh'],
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true }
        ]
      }
    };

    if (framework === 'express') {
      baseConfig.env = { node: true, es2020: true };
      baseConfig.plugins = [];
      baseConfig.rules = {};
    }

    return JSON.stringify(baseConfig, null, 2);
  }

  private getPrettierConfig(): string {
    return JSON.stringify({
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2
    }, null, 2);
  }

  private getTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  }

  private generateFolderStructure(template: TemplateConfig): FolderStructure {
    const structure: FolderStructure = {};
    
    if (template.framework === 'react' || template.framework === 'vue') {
      structure.src = {
        components: {},
        assets: {},
        utils: {},
        types: {}
      };
      structure.public = {};
    } else if (template.framework === 'express') {
      structure.src = {
        routes: {},
        middleware: {},
        controllers: {},
        models: {},
        utils: {},
        types: {}
      };
      structure.dist = {};
    }

    return structure;
  }
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  framework: 'react' | 'vue' | 'express';
  files: TemplateFile[];
  dependencies: PackageDependency[];
  scripts: Record<string, string>;
  configuration: TemplateConfiguration;
}

export const templateSystem = new TemplateSystem();
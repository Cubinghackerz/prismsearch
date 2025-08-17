
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  FolderOpen, 
  Download, 
  Star, 
  Code, 
  Globe, 
  Server, 
  Smartphone,
  Database,
  Zap,
  Layers
} from 'lucide-react';

interface FrameworkTemplate {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ComponentType<any>;
  technologies: string[];
  features: string[];
  files: Record<string, string>;
  packages: Record<string, string>;
  popular?: boolean;
  preview?: string;
}

interface FrameworkTemplatesProps {
  onTemplateSelect: (template: FrameworkTemplate) => void;
  className?: string;
}

const TEMPLATES: FrameworkTemplate[] = [
  {
    id: 'react-typescript',
    name: 'React + TypeScript',
    description: 'Modern React application with TypeScript, Vite, and Tailwind CSS',
    category: 'frontend',
    difficulty: 'intermediate',
    icon: Code,
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    features: ['Hot Module Replacement', 'TypeScript Support', 'Modern Build Tools', 'Responsive Design'],
    popular: true,
    files: {
      'package.json': `{
  "name": "react-typescript-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`,
      'src/App.tsx': `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          React + TypeScript
        </h1>
        <p className="text-gray-600 mb-6">
          Modern web development with type safety
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Count: {count}
        </button>
      </div>
    </div>
  );
}

export default App;`,
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + TypeScript App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    packages: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@types/react': '^18.2.15',
      '@types/react-dom': '^18.2.7',
      'typescript': '^5.0.2',
      'vite': '^4.4.5'
    }
  },
  {
    id: 'vue-composition',
    name: 'Vue 3 + Composition API',
    description: 'Vue 3 application with Composition API, TypeScript, and Vite',
    category: 'frontend',
    difficulty: 'intermediate',
    icon: Layers,
    technologies: ['Vue 3', 'TypeScript', 'Vite', 'Composition API'],
    features: ['Composition API', 'TypeScript Support', 'Single File Components', 'Reactive Data'],
    files: {
      'package.json': `{
  "name": "vue-composition-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "typescript": "^5.0.2",
    "vue-tsc": "^1.8.5",
    "vite": "^4.4.5"
  }
}`,
      'src/App.vue': `<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        Vue 3 + Composition API
      </h1>
      <p class="text-gray-600 mb-6">
        Modern Vue development with reactivity
      </p>
      <button
        @click="increment"
        class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Count: {{ count }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

const increment = () => {
  count.value++;
};
</script>`,
      'src/main.ts': `import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

createApp(App).mount('#app');`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue 3 + Composition API</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`
    },
    packages: {
      'vue': '^3.3.4',
      '@vitejs/plugin-vue': '^4.2.3',
      'typescript': '^5.0.2',
      'vue-tsc': '^1.8.5'
    }
  },
  {
    id: 'express-api',
    name: 'Express.js REST API',
    description: 'RESTful API server with Express.js, TypeScript, and middleware',
    category: 'backend',
    difficulty: 'intermediate',
    icon: Server,
    technologies: ['Express.js', 'TypeScript', 'Node.js', 'REST API'],
    features: ['RESTful Routes', 'Middleware Support', 'Error Handling', 'CORS Enabled'],
    files: {
      'package.json': `{
  "name": "express-api",
  "version": "1.0.0",
  "description": "Express.js REST API with TypeScript",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.4.5",
    "typescript": "^5.1.6",
    "ts-node-dev": "^2.0.0"
  }
}`,
      'src/index.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router as apiRouter } from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Express.js REST API Server',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      health: '/api/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
      'src/routes/api.ts': `import { Router } from 'express';

export const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Users endpoints
router.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json(users);
});

router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = { id: parseInt(id), name: 'John Doe', email: 'john@example.com' };
  res.json(user);
});

router.post('/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: Date.now(), name, email };
  res.status(201).json(newUser);
});`
    },
    packages: {
      'express': '^4.18.2',
      'cors': '^2.8.5',
      'helmet': '^7.0.0',
      '@types/express': '^4.17.17',
      '@types/cors': '^2.8.13',
      'typescript': '^5.1.6'
    }
  },
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack',
    description: 'Full-stack application with Next.js, API routes, and database integration',
    category: 'fullstack',
    difficulty: 'advanced',
    icon: Globe,
    technologies: ['Next.js', 'React', 'TypeScript', 'API Routes'],
    features: ['Server-Side Rendering', 'API Routes', 'File-based Routing', 'Static Generation'],
    popular: true,
    files: {
      'package.json': `{
  "name": "nextjs-fullstack-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "next": "13.4.12"
  },
  "devDependencies": {
    "typescript": "5.1.6",
    "@types/react": "18.2.15",
    "@types/react-dom": "18.2.7",
    "@types/node": "20.4.5"
  }
}`,
      'pages/index.tsx': `import { GetServerSideProps } from 'next';
import { useState } from 'react';

interface Props {
  initialCount: number;
}

export default function Home({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js Full-Stack App
          </h1>
          <p className="text-xl text-gray-600">
            Server-side rendering with API routes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Counter</h2>
            <button
              onClick={() => setCount(count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Count: {count}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">API Integration</h2>
            <button
              onClick={fetchUsers}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4"
            >
              Fetch Users
            </button>
            {users.length > 0 && (
              <ul className="space-y-2">
                {users.map((user: any) => (
                  <li key={user.id} className="p-2 bg-gray-50 rounded">
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      initialCount: Math.floor(Math.random() * 10)
    }
  };
};`,
      'pages/api/users.ts': `import { NextApiRequest, NextApiResponse } from 'next';

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Wilson', email: 'bob@example.com' },
  { id: 3, name: 'Carol Brown', email: 'carol@example.com' }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    const { name, email } = req.body;
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(\`Method \${req.method} Not Allowed\`);
  }
}`
    },
    packages: {
      'react': '18.2.0',
      'react-dom': '18.2.0',
      'next': '13.4.12',
      'typescript': '5.1.6',
      '@types/react': '18.2.15'
    }
  }
];

const FrameworkTemplates: React.FC<FrameworkTemplatesProps> = ({
  onTemplateSelect,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Templates', icon: FolderOpen },
    { id: 'frontend', name: 'Frontend', icon: Globe },
    { id: 'backend', name: 'Backend', icon: Server },
    { id: 'fullstack', name: 'Full-Stack', icon: Layers },
    { id: 'mobile', name: 'Mobile', icon: Smartphone }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(template => template.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTemplateSelect = (template: FrameworkTemplate) => {
    onTemplateSelect(template);
    toast({
      title: "Template Selected",
      description: `Loading ${template.name} template...`,
    });
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="w-5 h-5 text-prism-primary" />
          <span>Framework Templates</span>
          <Badge variant="secondary" className="ml-2">
            {filteredTemplates.length} templates
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <Icon className="w-3 h-3 mr-1" />
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="grid gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-prism-primary/10 rounded-lg">
                              <Icon className="w-5 h-5 text-prism-primary" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-prism-text">{template.name}</h3>
                                {template.popular && (
                                  <Badge variant="default" className="text-xs bg-orange-500">
                                    <Star className="w-3 h-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-prism-text-muted mt-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          <Badge className={`text-xs text-white ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-prism-text mb-2">Technologies</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.technologies.map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-prism-text mb-2">Features</h4>
                            <ul className="text-xs text-prism-text-muted space-y-1">
                              {template.features.slice(0, 3).map((feature) => (
                                <li key={feature} className="flex items-center">
                                  <Zap className="w-3 h-3 mr-1 text-prism-primary" />
                                  {feature}
                                </li>
                              ))}
                              {template.features.length > 3 && (
                                <li className="text-prism-text-muted">
                                  +{template.features.length - 3} more features
                                </li>
                              )}
                            </ul>
                          </div>

                          <Button
                            onClick={() => handleTemplateSelect(template)}
                            className="w-full"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FrameworkTemplates;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderOpen, Sparkles, Code, Globe, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FrameworkTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'frontend' | 'backend' | 'fullstack';
  files: {
    [key: string]: string;
  };
  packages: string[];
  features: string[];
}

interface FrameworkTemplatesProps {
  onTemplateSelect: (template: FrameworkTemplate) => void;
}

const FRAMEWORK_TEMPLATES: FrameworkTemplate[] = [
  {
    id: 'react-starter',
    name: 'React Starter',
    description: 'Modern React app with hooks and functional components',
    icon: Code,
    category: 'frontend',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="app.js"></script>
</body>
</html>`,
      'app.js': `const { useState, useEffect } = React;

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to React!');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>{message}</h1>
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        <button onClick={() => setMessage('React is awesome!')}>
          Change Message
        </button>
      </header>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`,
      'styles.css': `.app {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.counter {
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
}

button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}`
    },
    packages: ['react', 'react-dom'],
    features: ['Hooks', 'State Management', 'Effects', 'Modern Styling']
  },
  {
    id: 'vue-starter',
    name: 'Vue.js Starter',
    description: 'Vue 3 application with Composition API',
    icon: Globe,
    category: 'frontend',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue App</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div id="app"></div>
    <script src="app.js"></script>
</body>
</html>`,
      'app.js': `const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const count = ref(0);
    const message = ref('Welcome to Vue 3!');
    const doubleCount = computed(() => count.value * 2);

    onMounted(() => {
      console.log('Vue app mounted!');
    });

    const increment = () => count.value++;
    const decrement = () => count.value--;
    const changeMessage = () => {
      message.value = 'Vue 3 is fantastic!';
    };

    return {
      count,
      message,
      doubleCount,
      increment,
      decrement,
      changeMessage
    };
  },
  template: \`
    <div class="app">
      <div class="app-header">
        <h1>{{ message }}</h1>
        <div class="counter">
          <button @click="decrement">-</button>
          <span class="count">{{ count }}</span>
          <button @click="increment">+</button>
        </div>
        <p>Double count: {{ doubleCount }}</p>
        <button @click="changeMessage">Change Message</button>
      </div>
    </div>
  \`
}).mount('#app');`,
      'styles.css': `.app {
  text-align: center;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.counter {
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  min-width: 60px;
}

button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}`
    },
    packages: ['vue'],
    features: ['Composition API', 'Reactivity', 'Computed Properties', 'Lifecycle Hooks']
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API server with Express.js',
    icon: Server,
    category: 'backend',
    files: {
      'server.js': `const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory data store
let todos = [
  { id: 1, title: 'Learn Express.js', completed: false },
  { id: 2, title: 'Build an API', completed: true }
];

// Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  const newTodo = {
    id: Date.now(),
    title,
    completed: false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;
  
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Express API Demo</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Express API Demo</h1>
        <div class="api-info">
            <h2>Available Endpoints:</h2>
            <ul>
                <li><code>GET /api/todos</code> - Get all todos</li>
                <li><code>POST /api/todos</code> - Create a new todo</li>
                <li><code>PUT /api/todos/:id</code> - Update a todo</li>
                <li><code>DELETE /api/todos/:id</code> - Delete a todo</li>
            </ul>
        </div>
        <div class="demo-section">
            <h2>Quick Test</h2>
            <button onclick="fetchTodos()">Get Todos</button>
            <button onclick="addTodo()">Add Todo</button>
            <div id="result"></div>
        </div>
    </div>
    <script src="client.js"></script>
</body>
</html>`,
      'client.js': `async function fetchTodos() {
  try {
    const response = await fetch('/api/todos');
    const todos = await response.json();
    document.getElementById('result').innerHTML = 
      '<pre>' + JSON.stringify(todos, null, 2) + '</pre>';
  } catch (error) {
    console.error('Error:', error);
  }
}

async function addTodo() {
  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'New todo from demo'
      })
    });
    const todo = await response.json();
    document.getElementById('result').innerHTML = 
      '<pre>Added: ' + JSON.stringify(todo, null, 2) + '</pre>';
  } catch (error) {
    console.error('Error:', error);
  }
}`,
      'styles.css': `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.api-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin: 1rem 0;
}

code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

#result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  min-height: 50px;
}`
    },
    packages: ['express', 'cors'],
    features: ['RESTful API', 'CORS Support', 'JSON Middleware', 'Error Handling']
  }
];

const FrameworkTemplates: React.FC<FrameworkTemplatesProps> = ({ onTemplateSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const filteredTemplates = selectedCategory === 'all' 
    ? FRAMEWORK_TEMPLATES 
    : FRAMEWORK_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template: FrameworkTemplate) => {
    onTemplateSelect(template);
    setIsOpen(false);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been loaded successfully.`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend': return Code;
      case 'backend': return Server;
      case 'fullstack': return Globe;
      default: return FolderOpen;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-prism-primary" />
            <span>Framework Templates</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex space-x-2 mb-4">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'frontend' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('frontend')}
          >
            <Code className="w-4 h-4 mr-1" />
            Frontend
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'backend' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('backend')}
          >
            <Server className="w-4 h-4 mr-1" />
            Backend
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'fullstack' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('fullstack')}
          >
            <Globe className="w-4 h-4 mr-1" />
            Full-stack
          </Button>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon;
              const CategoryIcon = getCategoryIcon(template.category);
              
              return (
                <Card key={template.id} className="border-prism-border bg-prism-surface/5 hover:bg-prism-surface/10 transition-colors cursor-pointer" onClick={() => handleTemplateSelect(template)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                          <IconComponent className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-prism-text">
                            {template.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-prism-text-muted mb-3">
                      {template.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-xs font-medium text-prism-text mb-1">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {template.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-prism-text mb-1">Packages:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.packages.map((pkg, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {pkg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FrameworkTemplates;

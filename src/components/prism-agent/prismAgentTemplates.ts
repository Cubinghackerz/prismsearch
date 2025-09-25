import type { PrismAgentFramework } from '@/context/PrismAgentDatabase';

export type PrismAgentTemplateId = 'react-vite' | 'vanilla-vite';

export interface PrismAgentTemplateDefinition {
  id: PrismAgentTemplateId;
  name: string;
  description: string;
  framework: PrismAgentFramework;
  files: Record<string, string>;
  entryFile: string;
}

const reactPackageJson = `{
  "name": "prism-agent-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}`;

const reactTsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;

const reactTsconfigNode = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`;

const reactViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
});
`;

const reactIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prism Agent React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const reactMain = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

const reactApp = `import { useState } from 'react';
import viteLogo from '/vite.svg';
import prismLogo from './prism.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://prism.tools" target="_blank" rel="noreferrer">
          <img src={prismLogo} className="logo prism" alt="Prism logo" />
        </a>
      </div>
      <h1>Prism Agent React/Vite</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Edit <code>src/App.tsx</code> and save to test HMR</p>
      </div>
      <p className="read-the-docs">
        Click the Vite logo to learn more about Vite and the Prism logo for product docs.
      </p>
    </div>
  );
}

export default App;
`;

const reactAppCss = `.app {
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  color: #0f172a;
}

.logo {
  height: 6rem;
  padding: 1.5rem;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.prism:hover {
  filter: drop-shadow(0 0 2em #0ea5e9aa);
}

.card {
  padding: 2em;
  border-radius: 1rem;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
  text-align: center;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #0ea5e9;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0284c7;
}

.read-the-docs {
  color: #334155;
}
`;

const reactIndexCss = `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color: #0f172a;
  background-color: #f8fafc;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-height: 100vh;
}
`;

const reactPrismLogo = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M256 32L32 192L96 448H416L480 192L256 32Z" fill="url(#paint0_linear)"/>
<path d="M256 32L32 192L256 320L480 192L256 32Z" fill="url(#paint1_linear)" opacity="0.7"/>
<defs>
<linearGradient id="paint0_linear" x1="256" y1="32" x2="256" y2="448" gradientUnits="userSpaceOnUse">
<stop stop-color="#38bdf8"/>
<stop offset="1" stop-color="#0ea5e9"/>
</linearGradient>
<linearGradient id="paint1_linear" x1="256" y1="32" x2="256" y2="320" gradientUnits="userSpaceOnUse">
<stop stop-color="#38bdf8"/>
<stop offset="1" stop-color="#1d4ed8"/>
</linearGradient>
</defs>
</svg>
`;

const vanillaPackageJson = `{
  "name": "prism-agent-vanilla-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.1"
  }
}`;

const vanillaViteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
});
`;

const vanillaIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prism Agent Vanilla App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

const vanillaMain = `import './style.css';
import { render } from './render';

document.querySelector('#app').innerHTML = render({
  title: 'Prism Agent Vanilla/Vite',
  message: 'Edit src/main.js to start building.',
});
`;

const vanillaRender = String.raw`export const render = ({ title, message }) => [
  '<main class="container">',
  '  <section class="panel">',
  '    <h1>\${title}</h1>',
  '    <p>\${message}</p>',
  '    <button id="counter">Count: 0</button>',
  '  </section>',
  '</main>',
].join('\n');
`;

const vanillaCounter = String.raw`export const mountCounter = (selector) => {
  const button = document.querySelector(selector);
  if (!button) return;
  let count = 0;
  button.addEventListener('click', () => {
    count += 1;
    button.textContent = \`Count: \${count}\`;
  });
};
`;

const vanillaStyle = `body {
  margin: 0;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  background: radial-gradient(circle at top, #ecfeff, #f8fafc 45%);
  color: #0f172a;
}

main.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

section.panel {
  padding: 3rem;
  border-radius: 1.5rem;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.25);
}

button {
  margin-top: 2rem;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: white;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}

button:hover {
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
}
`;

export const PRISM_AGENT_TEMPLATES: PrismAgentTemplateDefinition[] = [
  {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'TypeScript React template powered by Vite and ready for Sandpack.',
    framework: 'react',
    entryFile: 'src/App.tsx',
    files: {
      'package.json': reactPackageJson,
      'tsconfig.json': reactTsConfig,
      'tsconfig.node.json': reactTsconfigNode,
      'vite.config.ts': reactViteConfig,
      'index.html': reactIndexHtml,
      'src/main.tsx': reactMain,
      'src/App.tsx': reactApp,
      'src/App.css': reactAppCss,
      'src/index.css': reactIndexCss,
      'src/prism.svg': reactPrismLogo,
    },
  },
  {
    id: 'vanilla-vite',
    name: 'Vanilla + Vite',
    description: 'Lightweight HTML/CSS/JS starter with live preview.',
    framework: 'vanilla',
    entryFile: 'src/main.js',
    files: {
      'package.json': vanillaPackageJson,
      'vite.config.ts': vanillaViteConfig,
      'index.html': vanillaIndexHtml,
      'src/main.js': vanillaMain,
      'src/render.js': vanillaRender,
      'src/counter.js': vanillaCounter,
      'src/style.css': vanillaStyle,
    },
  },
];

export const getTemplateById = (id: PrismAgentTemplateId) =>
  PRISM_AGENT_TEMPLATES.find((template) => template.id === id);

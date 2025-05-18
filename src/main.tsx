
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './components/search/searchStyles.css'

// Add Google Fonts for Montserrat and Inter with optimized weights
const fontLinks = document.createElement('link');
fontLinks.rel = 'stylesheet';
fontLinks.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';
document.head.appendChild(fontLinks);

// Add meta tag for improved font rendering
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
document.head.appendChild(metaTag);

// Add font-display optimization meta tag
const fontDisplayMeta = document.createElement('meta');
fontDisplayMeta.name = 'font-display';
fontDisplayMeta.content = 'swap';
document.head.appendChild(fontDisplayMeta);

// Add class for font smoothing
document.documentElement.classList.add('antialiased');

// Enable improved font rendering
const fontRenderingStyle = document.createElement('style');
fontRenderingStyle.textContent = `
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
`;
document.head.appendChild(fontRenderingStyle);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './components/search/searchStyles.css'

// Add Google Fonts for Montserrat, Inter and Playfair Display
const fontLinks = document.createElement('link');
fontLinks.rel = 'stylesheet';
fontLinks.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap';
document.head.appendChild(fontLinks);

// Add meta tag for improved font rendering
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
document.head.appendChild(metaTag);

// Add class for font smoothing
document.documentElement.classList.add('antialiased');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

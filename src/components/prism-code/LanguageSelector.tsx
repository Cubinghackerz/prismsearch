
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export type SupportedLanguage = 'html-css-js' | 'react' | 'vue' | 'svelte' | 'python-flask' | 'node-express';

interface Language {
  value: SupportedLanguage;
  label: string;
  description: string;
  features: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
}

const LANGUAGES: Language[] = [
  {
    value: 'html-css-js',
    label: 'HTML/CSS/JavaScript',
    description: 'Classic web technologies - perfect for beginners',
    features: ['Vanilla JS', 'Responsive CSS', 'No build tools'],
    complexity: 'Beginner'
  },
  {
    value: 'react',
    label: 'React + TypeScript',
    description: 'Modern React with TypeScript and popular libraries',
    features: ['React Hooks', 'TypeScript', 'Component-based', 'State management'],
    complexity: 'Intermediate'
  },
  {
    value: 'vue',
    label: 'Vue.js',
    description: 'Progressive framework with composition API',
    features: ['Composition API', 'Single File Components', 'Vue Router', 'Pinia'],
    complexity: 'Intermediate'
  },
  {
    value: 'svelte',
    label: 'Svelte/SvelteKit',
    description: 'Compile-time optimized framework',
    features: ['No virtual DOM', 'Built-in state', 'SvelteKit', 'Small bundles'],
    complexity: 'Intermediate'
  },
  {
    value: 'python-flask',
    label: 'Python + Flask',
    description: 'Full-stack Python web application',
    features: ['Flask backend', 'Jinja templates', 'SQLAlchemy', 'REST API'],
    complexity: 'Advanced'
  },
  {
    value: 'node-express',
    label: 'Node.js + Express',
    description: 'Full-stack JavaScript with Node.js backend',
    features: ['Express server', 'MongoDB/PostgreSQL', 'JWT auth', 'REST/GraphQL'],
    complexity: 'Advanced'
  }
];

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onLanguageChange, 
  disabled 
}) => {
  const selectedLang = LANGUAGES.find(lang => lang.value === selectedLanguage);

  return (
    <div className="space-y-3">
      <Label htmlFor="language-select" className="text-sm font-medium text-prism-text">
        Technology Stack
      </Label>
      
      <Select value={selectedLanguage} onValueChange={onLanguageChange} disabled={disabled}>
        <SelectTrigger id="language-select" className="bg-prism-surface/10 border-prism-border">
          <SelectValue placeholder="Select technology stack" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              <div className="flex flex-col space-y-1 py-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{language.label}</span>
                  <Badge 
                    variant={language.complexity === 'Beginner' ? 'default' : 
                            language.complexity === 'Intermediate' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {language.complexity}
                  </Badge>
                </div>
                <span className="text-xs text-prism-text-muted">{language.description}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {language.features.slice(0, 3).map(feature => (
                    <Badge key={feature} variant="outline" className="text-[10px] px-1 py-0">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedLang && (
        <div className="p-3 bg-prism-surface/10 rounded-lg border border-prism-border">
          <h4 className="text-sm font-medium text-prism-text mb-2">Selected Stack Features:</h4>
          <div className="flex flex-wrap gap-1">
            {selectedLang.features.map(feature => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

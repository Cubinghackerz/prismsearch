
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export type CodingLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python';

interface LanguageOption {
  id: CodingLanguage;
  name: string;
  description: string;
  color: string;
  badges: string[];
  packages: string[];
  frameworks: string[];
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'Build dynamic web applications with modern JavaScript',
    color: 'from-yellow-500 to-orange-500',
    badges: ['Frontend', 'Dynamic', 'Popular'],
    packages: ['lodash', 'axios', 'moment', 'chart.js', 'anime.js', 'jquery'],
    frameworks: ['React', 'Vue.js', 'Angular', 'Express.js', 'Node.js', 'Next.js']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Type-safe JavaScript development with enhanced tooling',
    color: 'from-blue-500 to-indigo-500',
    badges: ['Type-Safe', 'Scalable', 'Modern'],
    packages: ['@types/node', 'lodash', 'axios', 'zod', 'joi', 'mongoose'],
    frameworks: ['React', 'Angular', 'NestJS', 'Express.js', 'Next.js', 'Svelte']
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Versatile language for web development, data science, and automation',
    color: 'from-blue-600 to-yellow-500',
    badges: ['Versatile', 'Popular', 'AI-Ready'],
    packages: ['requests', 'pandas', 'numpy', 'sqlalchemy', 'pytest', 'beautifulsoup4'],
    frameworks: ['Django', 'Flask', 'FastAPI', 'Streamlit', 'Tornado', 'Pyramid']
  }
];

interface LanguageSelectorProps {
  onLanguageSelect: (language: CodingLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage | null>(null);

  const handleSelect = (language: CodingLanguage) => {
    setSelectedLanguage(language);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onLanguageSelect(selectedLanguage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
              <Code className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-fira-code mb-4">
            Choose Your Programming Language
          </h1>
          <p className="text-prism-text-muted text-lg max-w-2xl mx-auto">
            Select your preferred programming language to customize your development environment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = selectedLanguage === option.id;
            
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-orange-500 bg-orange-500/5' 
                      : 'hover:shadow-orange-500/10'
                  }`}
                  onClick={() => handleSelect(option.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-10`}>
                        <Code className="w-6 h-6 text-white" />
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold text-prism-text">
                      {option.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-prism-text-muted text-sm mb-4">
                      {option.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {option.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-prism-text-muted mb-1">Popular frameworks:</p>
                        <div className="flex flex-wrap gap-1">
                          {option.frameworks.slice(0, 3).map((framework) => (
                            <span key={framework} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                              {framework}
                            </span>
                          ))}
                          {option.frameworks.length > 3 && (
                            <span className="text-xs text-prism-text-muted">
                              +{option.frameworks.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-prism-text-muted mb-1">Popular packages:</p>
                        <div className="flex flex-wrap gap-1">
                          {option.packages.slice(0, 3).map((pkg) => (
                            <span key={pkg} className="text-xs bg-prism-surface/20 px-2 py-1 rounded">
                              {pkg}
                            </span>
                          ))}
                          {option.packages.length > 3 && (
                            <span className="text-xs text-prism-text-muted">
                              +{option.packages.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {selectedLanguage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3"
            >
              <Zap className="w-5 h-5 mr-2" />
              Continue with {LANGUAGE_OPTIONS.find(opt => opt.id === selectedLanguage)?.name}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;

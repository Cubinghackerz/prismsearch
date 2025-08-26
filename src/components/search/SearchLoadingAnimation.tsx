
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Bot, Search, Zap, Database, Atom, Globe } from 'lucide-react';
import LoadingAnimation from '../LoadingAnimation';

interface SearchLoadingAnimationProps {
  query: string;
  searchMode: 'quick' | 'comprehensive' | 'quantum';
}

const SearchLoadingAnimation = ({ query, searchMode }: SearchLoadingAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [currentPhase, setCurrentPhase] = useState('searching');

  const stages = [
    'Scanning web sources...',
    'Extracting content...',
    'Processing information...',
    'Analyzing data patterns...',
    'Generating AI summary...',
    'Finalizing results...'
  ];

  const documentContent = `Deep Search Analysis: "${query}"

## Sources Found
• Gathering information from multiple web sources
• Extracting relevant content and metadata  
• Cross-referencing data points
• Validating source credibility

## Content Processing
• Parsing HTML structures
• Extracting key information
• Identifying relevant sections
• Building knowledge graph

## AI Analysis Phase
• Natural language processing
• Content summarization
• Key insight extraction
• Source correlation analysis

## Summary Generation
The AI is now analyzing all gathered information to provide you with a comprehensive summary and curated source list...`;

  const modeConfig = {
    quick: { icon: Zap, color: 'text-green-500', name: 'Quick Search' },
    comprehensive: { icon: Database, color: 'text-blue-500', name: 'Comprehensive Search' },
    quantum: { icon: Atom, color: 'text-purple-500', name: 'Quantum Search' }
  };

  const config = modeConfig[searchMode];
  const ModeIcon = config.icon;

  useEffect(() => {
    // Stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => (prev + 1) % stages.length);
    }, 2000);

    // Phase progression
    const phaseTimer = setTimeout(() => {
      setCurrentPhase('analyzing');
      setTimeout(() => {
        setCurrentPhase('summarizing');
      }, 3000);
    }, 6000);

    return () => {
      clearInterval(stageInterval);
      clearTimeout(phaseTimer);
    };
  }, []);

  useEffect(() => {
    // Typing effect
    let index = 0;
    const typeTimer = setInterval(() => {
      if (index < documentContent.length) {
        setTypedText(documentContent.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeTimer);
      }
    }, 30);

    return () => clearInterval(typeTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Deep Search Processing
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-lg text-muted-foreground">
            <ModeIcon className={`h-5 w-5 ${config.color}`} />
            <span>{config.name}</span>
            <span>•</span>
            <span>"{query}"</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Animation */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Research Document</h3>
              <div className="ml-auto">
                <motion.div
                  className="w-2 h-4 bg-primary rounded-sm opacity-75"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 h-96 overflow-hidden font-mono text-sm">
              <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {typedText}
                <motion.span
                  className="bg-primary w-2 h-4 inline-block ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </pre>
            </div>
          </motion.div>

          {/* AI Analysis Panel */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <Bot className="h-5 w-5 text-secondary mr-2" />
              <h3 className="text-lg font-semibold">AI Analysis Engine</h3>
            </div>

            {/* AI Brain Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <LoadingAnimation 
                  variant="neural" 
                  size="large" 
                  color={searchMode === 'quick' ? 'teal' : searchMode === 'comprehensive' ? 'blue' : 'purple'} 
                />
                
                {/* Phase indicators */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm font-medium text-center"
                    >
                      {currentPhase === 'searching' && (
                        <span className="text-green-500">🔍 Searching Sources</span>
                      )}
                      {currentPhase === 'analyzing' && (
                        <span className="text-blue-500">🧠 Analyzing Content</span>
                      )}
                      {currentPhase === 'summarizing' && (
                        <span className="text-purple-500">✨ Generating Summary</span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {stages.map((stage, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0.3 }}
                  animate={{ 
                    opacity: index === currentStage ? 1 : 0.4,
                    scale: index === currentStage ? 1.02 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    index === currentStage ? 'bg-primary animate-pulse' : 'bg-muted'
                  }`} />
                  <span className={`text-sm ${
                    index === currentStage ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {stage}
                  </span>
                  {index === currentStage && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className="flex-1 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Status */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Scanning web sources</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>AI processing active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchLoadingAnimation;

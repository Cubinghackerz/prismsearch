import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, Search, BookOpen, Zap, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AIThinkingAnimationProps {
  isVisible: boolean;
  onClose: () => void;
  query: string;
}

const AIThinkingAnimation: React.FC<AIThinkingAnimationProps> = ({
  isVisible,
  onClose,
  query
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentThought, setCurrentThought] = useState('');

  const thinkingSteps = [
    { icon: Search, text: "Analyzing your question...", color: "text-blue-400" },
    { icon: BookOpen, text: "Searching knowledge base...", color: "text-green-400" },
    { icon: Brain, text: "Processing information...", color: "text-purple-400" },
    { icon: Lightbulb, text: "Generating insights...", color: "text-yellow-400" },
    { icon: Zap, text: "Crafting response...", color: "text-cyan-400" }
  ];

  const thoughts = [
    "Let me break this down step by step...",
    "This reminds me of several key concepts...",
    "I need to consider multiple perspectives here...",
    "Let me gather the most relevant information...",
    "I should provide a comprehensive answer...",
    "There are several approaches to this question...",
    "Let me think about the best way to explain this...",
    "I want to make sure I give you accurate information..."
  ];

  useEffect(() => {
    if (isVisible) {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % thinkingSteps.length);
      }, 1500);

      const thoughtInterval = setInterval(() => {
        setCurrentThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
      }, 2000);

      // Set initial thought
      setCurrentThought(thoughts[0]);

      return () => {
        clearInterval(stepInterval);
        clearInterval(thoughtInterval);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStepData = thinkingSteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-background/95 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">AI Thinking</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Query Display */}
              <div className="mb-6 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Processing:</p>
                <p className="text-foreground font-medium line-clamp-2">{query}</p>
              </div>

              {/* Thinking Animation */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  {/* Central brain with pulsing animation */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-primary/30 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      borderColor: ["rgba(var(--primary), 0.3)", "rgba(var(--primary), 0.6)", "rgba(var(--primary), 0.3)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="h-8 w-8 text-primary" />
                  </motion.div>

                  {/* Thought bubbles */}
                  {[0, 1, 2, 3].map((i) => {
                    const angle = (i * 90) * (Math.PI / 180);
                    const radius = 40;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                          scale: [0.5, 1, 0.5],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    );
                  })}

                  {/* Connecting lines */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={`line-${i}`}
                      className="absolute w-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                      style={{
                        left: '50%',
                        top: '50%',
                        height: '40px',
                        transformOrigin: 'top center',
                        transform: `rotate(${i * 90}deg)`
                      }}
                      animate={{
                        opacity: [0.2, 0.8, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Current Step */}
              <div className="text-center space-y-4">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <StepIcon className={`h-4 w-4 ${currentStepData.color}`} />
                  <span className="text-foreground font-medium">{currentStepData.text}</span>
                </motion.div>

                {/* Current Thought */}
                <motion.div
                  key={currentThought}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground italic"
                >
                  "{currentThought}"
                </motion.div>

                {/* Progress Dots */}
                <div className="flex justify-center space-x-2">
                  {thinkingSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                      animate={{
                        scale: index === currentStep ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: index === currentStep ? Infinity : 0
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIThinkingAnimation;
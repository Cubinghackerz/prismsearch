
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';
import MathAssistant from '@/components/math-assistant/MathAssistant';
import ToolLimitDisplay from '@/components/usage/ToolLimitDisplay';

const PrismMath = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-32 flex-1">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Calculator className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold font-fira-code">Mathematics Suite</h1>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Beta
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            Advanced mathematical tools and AI-powered problem solving
          </p>
        </div>
        
        <div className="mx-auto mb-8 max-w-4xl">
          <ToolLimitDisplay
            category="mathTool"
            label="Math Assistant daily usage"
            description="Each solve counts toward your Math Assistant daily quota."
          />
        </div>

        <MathAssistant />
      </main>
      
      <Footer />
    </div>
  );
};

export default PrismMath;

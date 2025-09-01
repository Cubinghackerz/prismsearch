
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Atom, Sparkles } from 'lucide-react';
import PhysicsAssistant from '@/components/physics-assistant/PhysicsAssistant';

const PrismPhysics = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5 flex flex-col">
      <Navigation />
      
      <motion.main 
        className="container mx-auto px-4 py-8 pt-32 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 mr-2" />
            Advanced Physics Engine
          </Badge>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
              <Atom className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Physics Engine
            </h1>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Beta
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comprehensive physics calculations and simulations with AI-powered analysis
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <PhysicsAssistant />
        </motion.div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default PrismPhysics;

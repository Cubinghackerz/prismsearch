
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart } from 'lucide-react';

const Analytics = () => {
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
      <div className="relative z-10 flex-1 flex flex-col">
        <Navigation />
        
        <motion.main 
          className="container mx-auto px-6 flex-1 pt-32 pb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <BarChart className="w-4 h-4 mr-2" />
                Performance Insights
              </Badge>
            </div>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive insights and performance metrics for your AI-powered workflow
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <AnalyticsDashboard />
          </motion.div>
        </motion.main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Analytics;

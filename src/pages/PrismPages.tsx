
import React from "react";
import { motion } from 'framer-motion';
import Navigation from "@/components/Navigation";
import PrismPagesHeader from "@/components/prism-pages/PrismPagesHeader";
import DocumentsList from "@/components/prism-pages/DocumentsList";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const PrismPages = () => {
  const { isSignedIn, isLoaded } = useAuth();

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5">
      <Navigation />
      <motion.div 
        className="container mx-auto px-6 py-8 pt-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 mr-2" />
            Collaborative Writing
          </Badge>
        </motion.div>
        <motion.div variants={itemVariants}>
          <PrismPagesHeader />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DocumentsList />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PrismPages;

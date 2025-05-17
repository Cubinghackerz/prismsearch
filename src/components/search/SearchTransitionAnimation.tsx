
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import '../search/searchStyles.css';

interface SearchTransitionAnimationProps {
  query: string;
  onComplete: () => void;
}

const SearchTransitionAnimation = ({ query, onComplete }: SearchTransitionAnimationProps) => {
  const [stage, setStage] = useState(0);
  
  // Progress through animation stages
  useEffect(() => {
    const stageTimers = [
      setTimeout(() => setStage(1), 500),  // Start expanding
      setTimeout(() => setStage(2), 1500), // Show particles
      setTimeout(() => setStage(3), 2500), // Fade out and complete
      setTimeout(() => onComplete(), 3000) // Trigger completion callback
    ];
    
    return () => {
      stageTimers.forEach(timer => clearTimeout(timer));
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Enhanced background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C]/90 to-[#151A26]/95 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Central orb with improved visual effects */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="transition-orb relative flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ 
            scale: stage >= 1 ? [1, 1.2, 1.1] : 0.5,
            opacity: stage >= 3 ? 0 : 1 
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut"
          }}
        >
          {/* Enhanced central logo */}
          <img 
            src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png"
            alt="Prism Search" 
            className="h-20 w-20 z-20 transition-all duration-300 drop-shadow-lg"
          />
          
          {/* Enhanced pulsing rings with better colors */}
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-orange-500/40 z-10"
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.2, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
          
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-orange-400/30 z-10"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.2, 0.4, 0],
            }}
            transition={{
              duration: 2.5,
              delay: 0.3,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />

          {/* Add an inner glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/20 to-orange-600/5 z-5"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
        
        {/* Enhanced dynamic particles */}
        {stage >= 1 && (
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute left-1/2 top-1/2 fiery-spark"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0.9,
                  scale: 0.2
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  opacity: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
              >
                <div className="h-3 w-3 rounded-full bg-gradient-to-b from-orange-300 via-orange-500 to-yellow-500 glow-particle"></div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Enhanced query text with better typography */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: stage >= 3 ? 0 : 1, 
            y: 0 
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm text-orange-300/90 mb-2 font-medium tracking-wide">
            Searching across the web for
          </p>
          <motion.h2 
            className="text-xl md:text-2xl font-bold color-changing-text"
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            "{query}"
          </motion.h2>
        </motion.div>
        
        {/* Enhanced progress indicator */}
        <motion.div
          className="mt-10 w-48 progress-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 3 ? 0 : 0.9 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300" 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2.5,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchTransitionAnimation;


import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import '../../components/search/searchStyles.css';

interface SearchTransitionAnimationProps {
  query: string;
  onComplete: () => void;
}

const SearchTransitionAnimation = ({ query, onComplete }: SearchTransitionAnimationProps) => {
  const [stage, setStage] = useState(0);
  
  // Enhanced animation progression with better timing
  useEffect(() => {
    const stageTimers = [
      setTimeout(() => setStage(1), 400),  // Start expanding
      setTimeout(() => setStage(2), 900),  // Show particles
      setTimeout(() => setStage(3), 2200), // Begin fade out
      setTimeout(() => onComplete(), 2600) // Trigger completion callback
    ];
    
    return () => {
      stageTimers.forEach(timer => clearTimeout(timer));
    };
  }, [onComplete]);

  // Function to create random spark animations
  const renderSparks = () => {
    return Array.from({ length: 32 }).map((_, i) => {
      const size = Math.random() * 6 + 3; // Random size between 3-9px
      const delay = Math.random() * 0.5;
      const duration = 1 + Math.random() * 1.5;
      const angle = Math.random() * 360;
      
      return (
        <motion.div
          key={`particle-${i}`}
          className="absolute left-1/2 top-1/2 fiery-spark"
          style={{
            width: size,
            height: size,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0.8,
            scale: 0.2,
            rotate: 0
          }}
          animate={{ 
            x: Math.cos(angle) * (Math.random() * 160 + 60),
            y: Math.sin(angle) * (Math.random() * 140 + 40),
            opacity: 0,
            scale: Math.random() * 0.8 + 0.2,
            rotate: Math.random() * 360
          }}
          transition={{
            duration,
            ease: "easeOut",
            delay
          }}
        >
          <div 
            className="h-full w-full rounded-full glow-particle"
            style={{
              background: `rgba(255, ${Math.round(100 + Math.random() * 100)}, ${Math.round(Math.random() * 80)}, ${0.7 + Math.random() * 0.3})`
            }}
          />
        </motion.div>
      );
    });
  };

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Enhanced background with subtle gradient movement */}
      <motion.div 
        className="absolute inset-0 bg-[#1A1F2C]/95 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl bg-gradient-to-br from-orange-500/20 via-orange-300/10 to-teal-400/10 animate-pulse-light"></div>
        </div>
      </motion.div>

      {/* Central animation container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Enhanced orb with rotating border */}
        <motion.div
          className="transition-orb relative flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ 
            scale: stage >= 1 ? [1, 1.1, 1.05] : 0.5,
            opacity: stage >= 3 ? 0 : 1 
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut"
          }}
        >
          {/* Central logo with subtle floating effect */}
          <motion.img 
            src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png"
            alt="Prism Search" 
            className="h-20 w-20 z-20 transition-all duration-300"
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          
          {/* Enhanced pulsing rings */}
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-orange-500/30 z-10"
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.1, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-teal-400/20 z-10"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.1, 0.3, 0],
            }}
            transition={{
              duration: 2.5,
              delay: 0.3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
          
          {/* Inner glow */}
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-200/5 blur-sm z-5"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Enhanced dynamic particles with better randomization */}
        {stage >= 1 && (
          <div className="absolute inset-0 z-0">
            {renderSparks()}
          </div>
        )}
        
        {/* Enhanced query text with better typography */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: stage >= 3 ? 0 : 1, 
            y: 0 
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.p 
            className="text-sm text-orange-300/90 mb-2 font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Searching across all engines for
          </motion.p>
          
          <motion.h2 
            className="text-xl md:text-2xl font-bold color-changing-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            "{query}"
          </motion.h2>
        </motion.div>
        
        {/* Enhanced progress indicator */}
        <motion.div
          className="mt-12 w-48 h-1.5 bg-orange-900/40 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 3 ? 0 : 0.8 }}
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
        
        {/* Added subtle search engine logos */}
        {stage >= 1 && (
          <motion.div 
            className="absolute bottom-[-80px] flex space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 0 : 0.6 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {['G', 'B', 'D', 'Y'].map((letter, i) => (
              <motion.div 
                key={letter}
                className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-200/70 text-xs font-bold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.4 }}
              >
                {letter}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchTransitionAnimation;


import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import '../../components/search/searchStyles.css';
import { Progress } from '@/components/ui/progress';

interface SearchTransitionAnimationProps {
  query: string;
  onComplete: () => void;
}

const SearchTransitionAnimation = ({ query, onComplete }: SearchTransitionAnimationProps) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showExplosion, setShowExplosion] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Text animation
  const words = query.split(' ');
  
  // Progress through animation stages
  useEffect(() => {
    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newValue = prev + 2; // Increment by 2% each time
        
        // When we reach 100%, trigger explosion
        if (newValue >= 100 && !showExplosion) {
          setShowExplosion(true);
          setTimeout(() => setStage(3), 800); // Set final stage after explosion animation
        }
        
        return newValue > 100 ? 100 : newValue;
      });
    }, 50); // Update every 50ms for smooth animation
    
    const stageTimers = [
      setTimeout(() => setStage(1), 500),  // Start expanding
      setTimeout(() => setStage(2), 1500), // Show particles
      setTimeout(() => onComplete(), 3800) // Trigger completion callback (slightly longer to see explosion)
    ];
    
    // Add perspective effect if mouse moves
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      
      // Calculate mouse position relative to center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) / centerX * 10; // Max 10 degrees
      const deltaY = (e.clientY - centerY) / centerY * 10; // Max 10 degrees
      
      // Apply rotation
      orbRef.current.style.transform = `perspective(1000px) rotateY(${deltaX}deg) rotateX(${-deltaY}deg)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      stageTimers.forEach(timer => clearTimeout(timer));
      clearInterval(progressInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onComplete, showExplosion]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background gradient */}
      <motion.div 
        className="absolute inset-0 bg-[#1A1F2C]/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* 3D effect container */}
      <div ref={orbRef} className="relative z-10 flex flex-col items-center perspective-1000">
        {/* Central orb with 3D depth effect */}
        <motion.div
          className="transition-orb relative flex items-center justify-center depth-shadow"
          initial={{ scale: 0.5, opacity: 0.8, rotateX: -10, rotateY: 15 }}
          animate={{ 
            scale: stage >= 1 ? [1, 1.2, 1.1] : 0.5,
            opacity: stage >= 3 ? 0 : 1,
            rotateX: 0,
            rotateY: 0
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut"
          }}
        >
          {/* Central logo with floating animation */}
          <motion.img 
            src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png"
            alt="Prism Search" 
            className="h-20 w-20 z-20 floating depth-layer depth-3"
            animate={{
              y: [0, -5, 0],
              rotate: [0, 2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {/* Pulsing rings with depth */}
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-orange-500/30 z-10 depth-layer depth-1"
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.1, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
          
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-orange-400/20 z-10 depth-layer depth-2"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.1, 0.3, 0],
            }}
            transition={{
              duration: 2.5,
              delay: 0.3,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        </motion.div>
        
        {/* Orbiting particles with different sizes */}
        {stage >= 1 && !showExplosion && (
          <div className="absolute inset-0 z-0">
            {/* Small orbiting particles */}
            {Array.from({ length: 12 }).map((_, i) => {
              const radius = 90 + (i % 3) * 30; // Varying orbit radius
              const speed = 6 + (i % 4); // Varying speeds
              const delay = i * 0.1; // Staggered start
              const size = 3 + (i % 3) * 2; // Varying sizes
              
              return (
                <motion.div
                  key={`orbit-small-${i}`}
                  className="absolute left-1/2 top-1/2 fiery-spark"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0,
                    scale: 0.2
                  }}
                  animate={{ 
                    opacity: 0.8,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1,
                    delay: delay,
                  }}
                >
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-gradient-to-b from-orange-200 to-orange-400 glow-particle spark-small"
                    style={{ width: size, height: size }}
                    animate={{
                      x: Array.from({ length: 20 }).map(() => radius * Math.cos(Math.random() * Math.PI * 2)),
                      y: Array.from({ length: 20 }).map(() => radius * Math.sin(Math.random() * Math.PI * 2)),
                    }}
                    transition={{
                      duration: speed,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                      times: Array.from({ length: 20 }).map((_, i) => i / 19),
                      delay: delay
                    }}
                  />
                </motion.div>
              );
            })}
            
            {/* Medium orbiting particles */}
            {Array.from({ length: 8 }).map((_, i) => {
              const radius = 120 + (i % 4) * 25; // Varying orbit radius
              const speed = 8 + (i % 5); // Varying speeds  
              const delay = i * 0.15; // Staggered start
              const size = 5 + (i % 3) * 2; // Varying sizes
              
              return (
                <motion.div
                  key={`orbit-medium-${i}`}
                  className="absolute left-1/2 top-1/2 fiery-spark"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    opacity: 0,
                    scale: 0.2
                  }}
                  animate={{ 
                    opacity: 0.9,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1,
                    delay: delay,
                  }}
                >
                  <motion.div 
                    className="h-4 w-4 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 glow-particle spark-medium"
                    style={{ width: size, height: size }}
                    animate={{
                      x: Array.from({ length: 20 }).map(() => radius * Math.cos(Math.random() * Math.PI * 2)),
                      y: Array.from({ length: 20 }).map(() => radius * Math.sin(Math.random() * Math.PI * 2)),
                    }}
                    transition={{
                      duration: speed,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                      times: Array.from({ length: 20 }).map((_, i) => i / 19),
                      delay: delay
                    }}
                  />
                </motion.div>
              );
            })}
            
            {/* Large orbiting particles */}
            {Array.from({ length: 6 }).map((_, i) => {
              const radius = 150 + (i % 3) * 30; // Varying orbit radius
              const speed = 10 + (i % 3); // Varying speeds
              const delay = i * 0.2; // Staggered start
              const size = 7 + (i % 3) * 2; // Varying sizes
              
              return (
                <motion.div
                  key={`orbit-large-${i}`}
                  className="absolute left-1/2 top-1/2 fiery-spark"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0,
                    scale: 0.2
                  }}
                  animate={{ 
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1,
                    delay: delay,
                  }}
                >
                  <motion.div 
                    className="h-6 w-6 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 glow-particle spark-large"
                    style={{ width: size, height: size }}
                    animate={{
                      x: Array.from({ length: 20 }).map(() => radius * Math.cos(Math.random() * Math.PI * 2)),
                      y: Array.from({ length: 20 }).map(() => radius * Math.sin(Math.random() * Math.PI * 2)),
                    }}
                    transition={{
                      duration: speed,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                      times: Array.from({ length: 20 }).map((_, i) => i / 19),
                      delay: delay
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Explosion effect particles */}
        {showExplosion && (
          <div className="absolute inset-0 z-30">
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 30;
              const distance = 300 + Math.random() * 200;
              const size = 3 + Math.random() * 5;
              const delay = Math.random() * 0.2;
              
              return (
                <motion.div
                  key={`explosion-${i}`}
                  className="absolute left-1/2 top-1/2 fiery-spark"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{ 
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: delay
                  }}
                >
                  <div 
                    className="rounded-full bg-gradient-to-b from-orange-300 to-orange-500 glow-particle explosion-particle"
                    style={{ 
                      width: size, 
                      height: size,
                      boxShadow: "0 0 15px rgba(255, 158, 44, 0.8)"
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Animated Query Text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: stage >= 3 ? 0 : 1, 
            y: 0 
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm text-orange-300 mb-2 text-reveal">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Searching across the web for
            </motion.span>
          </p>
          
          <h2 className="text-xl md:text-2xl font-bold color-changing-text">
            {words.map((word, index) => (
              <span key={`word-${index}`} className="inline-block mx-1">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={`char-${index}-${charIndex}`}
                    className="inline-block animated-character"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.5 + (index * 0.1) + (charIndex * 0.03)
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </h2>
        </motion.div>
        
        {/* Dynamic circular progress indicator */}
        <motion.div
          className="mt-10 relative"
          style={{ width: '120px', height: '120px' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: stage >= 3 ? 0 : 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <svg className="circular-progress w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle 
              className="progress-circle-bg" 
              cx="50" 
              cy="50" 
              r="45" 
              strokeWidth="5"
            />
            
            {/* Progress circle */}
            <motion.circle 
              className="progress-circle" 
              cx="50" 
              cy="50" 
              r="45" 
              strokeWidth="5"
              strokeDasharray="283"
              animate={{
                strokeDashoffset: 283 - (283 * progress) / 100
              }}
              transition={{
                duration: 0.1,
                ease: "linear"
              }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.p 
              className="text-orange-300 font-mono text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchTransitionAnimation;

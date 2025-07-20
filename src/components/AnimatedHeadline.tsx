
import React from 'react';

const words = [
  "Digital Intelligence",
  "Smart Search", 
  "AI Conversations",
  "Secure Storage",
  "Password Protection",
];

const AnimatedHeadline = () => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
        The Future of
      </span>
      <div className="h-12 md:h-16 overflow-hidden relative">
        <div className="flex flex-col animate-scroll-words">
          {words.map((word, index) => (
            <span 
              key={index} 
              className="h-12 md:h-16 text-5xl md:text-7xl font-bold text-accent flex items-center whitespace-nowrap"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeadline;

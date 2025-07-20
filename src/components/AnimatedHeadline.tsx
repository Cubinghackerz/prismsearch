
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
    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight py-0 flex items-center gap-2">
      <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
        The Future of
      </span>
      <div className="h-[3.5rem] md:h-[4.5rem] overflow-hidden relative">
        <div className="flex flex-col animate-scroll-words">
          {words.map((word, index) => (
            <span 
              key={index} 
              className="h-[3.5rem] md:h-[4.5rem] bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent font-bold flex items-center"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </h1>
  );
};

export default AnimatedHeadline;

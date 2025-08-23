
import React from 'react';
import RotatingText from './RotatingText';

const AnimatedHeadline = () => {
  const rotatingTexts = [
    'Digital Intelligence',
    'Agentic Coding',
    'Problem Solving',
    'Password Management',
    'Graphing Functions'
  ];

  return (
    <div className="animated-headline-wrapper">
      <span className="static-text">
        The Future of{' '}
        <RotatingText
          texts={rotatingTexts}
          mainClassName="inline-flex bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
          staggerFrom="first"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-120%", opacity: 0 }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={1500}
        />
      </span>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .animated-headline-wrapper {
            font-size: 2.5rem;
            font-weight: 700;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.2;
            margin-bottom: 0.5rem;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .static-text {
            background: linear-gradient(to right, #8B5CF6, #A855F7, #8B5CF6);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 200%;
            animation: gradientShift 4s ease infinite;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 600;
            letter-spacing: -0.025em;
          }

          @media (min-width: 768px) {
            .animated-headline-wrapper {
              font-size: 4.5rem;
              margin-bottom: 0.75rem;
            }
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `
      }} />
    </div>
  );
};

export default AnimatedHeadline;

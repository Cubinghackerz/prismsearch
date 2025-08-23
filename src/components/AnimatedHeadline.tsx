
import React, { memo } from 'react';
import RotatingText from './RotatingText';

const AnimatedHeadline = memo(() => {
  const rotatingTexts = [
    'Digital Intelligence',
    'Agentic Coding',
    'Problem Solving',
    'Password Management',
    'Graphing Functions'
  ];

  return (
    <div className="animated-headline-wrapper">
      <h1 className="static-text">
        The Future of{' '}
        <RotatingText
          texts={rotatingTexts}
          mainClassName="inline-block"
          staggerFrom="first"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-120%", opacity: 0 }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2500}
        />
      </h1>
      
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
            background: linear-gradient(45deg, #00C2A8, #9B5DE5, #A855F7, #00C2A8);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 300% 300%;
            animation: gradientShift 4s ease infinite;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 600;
            letter-spacing: -0.025em;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
          }

          .static-text .inline-block {
            background: linear-gradient(45deg, #A855F7, #EC4899, #EF4444, #9B5DE5) !important;
            background-clip: text !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-size: 300% 300% !important;
            animation: rotatingGradient 5s ease infinite !important;
          }

          @media (min-width: 768px) {
            .animated-headline-wrapper {
              font-size: 4.5rem;
              margin-bottom: 0.75rem;
            }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            25% { background-position: 100% 0%; }
            50% { background-position: 100% 100%; }
            75% { background-position: 0% 100%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes rotatingGradient {
            0% { background-position: 0% 0%; }
            25% { background-position: 100% 0%; }
            50% { background-position: 100% 100%; }
            75% { background-position: 0% 100%; }
            100% { background-position: 0% 0%; }
          }
        `
      }} />
    </div>
  );
});

AnimatedHeadline.displayName = 'AnimatedHeadline';

export default AnimatedHeadline;

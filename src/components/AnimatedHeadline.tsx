
import React, { memo } from 'react';

const AnimatedHeadline = memo(() => {
  return (
    <div className="animated-headline-wrapper">
      <h1 className="static-text">
        The Future of{' '}
        <span className="animated-word">
          Productivity
        </span>
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

          .animated-word {
            background: linear-gradient(45deg, #A855F7, #EC4899, #EF4444, #9B5DE5);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 300% 300%;
            animation: wordGlow 3s ease infinite, wordPulse 2s ease-in-out infinite alternate;
            position: relative;
            display: inline-block;
          }

          .animated-word::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, #A855F7, #EC4899, #EF4444, #9B5DE5);
            background-size: 300% 300%;
            filter: blur(8px);
            opacity: 0.3;
            z-index: -1;
            animation: wordGlow 3s ease infinite;
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

          @keyframes wordGlow {
            0% { background-position: 0% 0%; }
            25% { background-position: 100% 0%; }
            50% { background-position: 100% 100%; }
            75% { background-position: 0% 100%; }
            100% { background-position: 0% 0%; }
          }

          @keyframes wordPulse {
            0% { 
              transform: scale(1);
              filter: brightness(1);
            }
            100% { 
              transform: scale(1.02);
              filter: brightness(1.1);
            }
          }
        `
      }} />
    </div>
  );
});

AnimatedHeadline.displayName = 'AnimatedHeadline';

export default AnimatedHeadline;

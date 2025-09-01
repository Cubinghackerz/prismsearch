
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
            background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 200%;
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
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          }

          .animated-word {
            color: hsl(var(--accent));
            animation: wordPulse 2s ease-in-out infinite alternate;
            position: relative;
            display: inline-block;
            font-weight: 700;
            text-shadow: 0 0 20px hsla(var(--accent), 0.3);
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

          @keyframes wordPulse {
            0% { 
              transform: scale(1);
              filter: brightness(1);
            }
            100% { 
              transform: scale(1.02);
              filter: brightness(1.2);
            }
          }
        `
      }} />
    </div>
  );
});

AnimatedHeadline.displayName = 'AnimatedHeadline';

export default AnimatedHeadline;


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
            background: linear-gradient(135deg, #00D4AA 0%, #A855F7 25%, #EC4899 50%, #00D4AA 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 400% 400%;
            animation: gradientShift 5s ease infinite;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 700;
            letter-spacing: -0.025em;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            filter: brightness(1.1) contrast(1.1);
          }

          .animated-word {
            background: linear-gradient(135deg, #A855F7 0%, #EC4899 25%, #EF4444 50%, #F59E0B 75%, #A855F7 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 400% 400%;
            animation: wordGlow 4s ease infinite, wordPulse 3s ease-in-out infinite alternate;
            position: relative;
            display: inline-block;
            filter: brightness(1.2) contrast(1.1);
          }

          .animated-word::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #A855F7 0%, #EC4899 25%, #EF4444 50%, #F59E0B 75%, #A855F7 100%);
            background-size: 400% 400%;
            filter: blur(12px);
            opacity: 0.4;
            z-index: -1;
            animation: wordGlow 4s ease infinite;
          }

          @media (min-width: 768px) {
            .animated-headline-wrapper {
              font-size: 4.5rem;
              margin-bottom: 0.75rem;
            }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            25% { background-position: 100% 25%; }
            50% { background-position: 0% 75%; }
            75% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes wordGlow {
            0% { background-position: 0% 25%; }
            25% { background-position: 100% 0%; }
            50% { background-position: 0% 100%; }
            75% { background-position: 100% 75%; }
            100% { background-position: 0% 25%; }
          }

          @keyframes wordPulse {
            0% { 
              transform: scale(1);
              filter: brightness(1.2) contrast(1.1);
            }
            100% { 
              transform: scale(1.03);
              filter: brightness(1.3) contrast(1.2);
            }
          }
        `
      }} />
    </div>
  );
});

AnimatedHeadline.displayName = 'AnimatedHeadline';

export default AnimatedHeadline;

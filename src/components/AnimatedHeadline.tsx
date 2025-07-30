

import React from 'react';

const AnimatedHeadline = () => {
  return (
    <div className="animated-headline-wrapper">
      <span className="static-text">The Future of Digital Intelligence</span>
      
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
            font-family: 'Fira Code', monospace;
          }

          .static-text {
            background: linear-gradient(to right, #8B5CF6, #A855F7, #8B5CF6);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% 200%;
            animation: gradientShift 4s ease infinite;
            text-align: center;
            font-family: 'Fira Code', monospace;
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


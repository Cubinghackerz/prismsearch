import React from 'react';
const words = ["Digital Intelligence", "Smart Search", "AI Conversations", "Secure Storage", "Password Protection"];
const AnimatedHeadline = () => {
  return <div className="animated-headline-wrapper">
      <span className="static-text">The Future of
Digital Intelligence</span>
      <br />
      <div className="words-container">
        <div className="words">
          {words.map((word, index) => {})}
        </div>
      </div>
      
      <style jsx>{`
        .animated-headline-wrapper {
          font-size: 2.5rem;
          font-weight: 700;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .static-text {
          background: linear-gradient(to right, #8B5CF6, #A855F7, #8B5CF6);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }

        .words-container {
          height: 3rem;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .words {
          display: flex;
          flex-direction: column;
          animation: scrollWords 15s infinite;
        }

        .word {
          height: 3.2rem;
          background: linear-gradient(to right, #8B5CF6, #A855F7, #8B5CF6);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1.1;
        }

        @media (min-width: 768px) {
          .animated-headline-wrapper {
            font-size: 4.5rem;
            gap: 0.2rem;
          }
          
          .words-container {
            height: 5.2rem;
          }
          
          .word {
            height: 5.2rem;
            line-height: 1.1;
          }
        }

        @keyframes scrollWords {
          0%, 18%   { transform: translateY(0%); }
          20%, 38%  { transform: translateY(-100%); }
          40%, 58%  { transform: translateY(-200%); }
          60%, 78%  { transform: translateY(-300%); }
          80%, 98%  { transform: translateY(-400%); }
          100%      { transform: translateY(0%); }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>;
};
export default AnimatedHeadline;
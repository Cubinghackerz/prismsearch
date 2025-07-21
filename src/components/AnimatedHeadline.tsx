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
    <div className="animated-headline-wrapper">
      <span className="static-text">The Future of</span>
      <br />
      <div className="words-container">
        <div className="words">
          {words.map((word, index) => (
            <span className="word" key={index}>{word}</span>
          ))}
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
          animation: scrollWords 10s infinite;
        }

        .word {
          height: 3rem;
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
        }

        @media (min-width: 768px) {
          .animated-headline-wrapper {
            font-size: 4.5rem;
          }
          
          .words-container {
            height: 5rem;
          }
          
          .word {
            height: 5rem;
          }
        }

        @keyframes scrollWords {
          0%, 15%   { transform: translateY(0%); }
          20%, 35%  { transform: translateY(-100%); }
          40%, 55%  { transform: translateY(-200%); }
          60%, 75%  { transform: translateY(-300%); }
          80%, 95%  { transform: translateY(-400%); }
          100%      { transform: translateY(0%); }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedHeadline;
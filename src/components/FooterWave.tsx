
import React from 'react';

interface FooterWaveProps {
  color?: string;
}

const FooterWave = ({ color = '#3b82f6' }: FooterWaveProps) => {
  // Create a slightly lighter variation of the color for the gradient
  const lighterColor = color === '#3b82f6' ? '#60a5fa' : '#c4b5fd';

  return (
    <div className="absolute left-0 right-0 bottom-0 h-24 overflow-hidden">
      <svg
        className="absolute left-0 bottom-0 w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="50%" stopColor={lighterColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGradient)"
          fillOpacity="1"
          d="M0,160L48,138.7C96,117,192,75,288,69.3C384,64,480,96,576,106.7C672,117,768,107,864,101.3C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </div>
  );
};

export default FooterWave;

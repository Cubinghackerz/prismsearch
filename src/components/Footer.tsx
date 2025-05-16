
import React from 'react';

interface FooterProps {
  color?: string;
}

const Footer = ({
  color = '#FF9E2C'  // Updated to match the orange theme
}: FooterProps) => {
  return (
    <div className="py-6 text-center border-t border-orange-500/20 backdrop-blur-md bg-gradient-to-b from-orange-900/10 to-orange-800/30">
      <p 
        className="text-orange-200 opacity-90 text-base font-inter animate-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-teal-300 to-orange-400"
      >
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;


import React from 'react';

interface FooterProps {
  color?: string;
}

const Footer = ({
  color = '#9b87f5'  // Keep the default color matching the purple theme
}: FooterProps) => {
  return (
    <div className="py-6 text-center border-t border-purple-500/20 backdrop-blur-md bg-purple-900/10">
      <p 
        className="text-purple-200 opacity-80 text-base font-inter animate-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-purple-400 to-purple-600"
      >
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;

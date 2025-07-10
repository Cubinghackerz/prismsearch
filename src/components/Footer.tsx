
import React from 'react';

interface FooterProps {
  color?: string; 
}

const Footer = ({
  color = '#4F46E5'  // Updated to match the new blue theme
}: FooterProps) => {
  return (
    <div className="py-4 text-center border-t border-prism-blue-primary/20 backdrop-blur-md bg-gradient-to-b from-prism-dark-bg/10 to-prism-dark-bg-800/30">
      <p 
        className="text-prism-text-muted opacity-90 text-base font-inter animate-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-prism-blue-light via-prism-teal-light to-prism-purple-light"
      >
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;


import React from 'react';

interface FooterProps {
  color?: string;
}

const Footer = ({
  color = '#9b87f5'  // Changed default color to match the purple theme
}: FooterProps) => {
  return (
    <div className="py-4 text-center">
      <p 
        style={{
          color
        }} 
        className="opacity-80 text-base"
      >
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;

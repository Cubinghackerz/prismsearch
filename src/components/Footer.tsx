
import React from 'react';

interface FooterProps {
  color?: string;
}

const Footer = ({ color = '#3b82f6' }: FooterProps) => {
  return (
    <div className="py-4 text-center">
      <p className="text-sm opacity-70" style={{ color }}>
        © 2025 Prism Search. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;


import React from 'react';

interface FooterProps {
  color?: string;
}

const Footer = ({
  color = '#00C2A8' // Updated to match the new teal theme
}: FooterProps) => {
  return (
    <div className="mt-auto py-6 text-center border-t border-prism-border backdrop-blur-md bg-gradient-to-b from-prism-bg/10 to-prism-surface/30">
      <p className="text-prism-text-muted opacity-90 text-base font-inter animate-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-prism-primary-light via-prism-primary to-prism-accent-light">
        © 2025 Prism. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;

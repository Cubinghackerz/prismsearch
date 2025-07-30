
import React from 'react';

interface FooterProps {
  color?: string;
}

const Footer = ({
  color = '#00C2A8' // Updated to match the new teal theme
}: FooterProps) => {
  return (
    <div className="mt-auto py-6 text-center border-t border-prism-border backdrop-blur-md bg-gradient-to-b from-prism-bg/10 to-prism-surface/30">
      <p className="text-prism-text-muted opacity-90 text-base font-fira-code">
        &copy; 2025 Prism. Empowering intelligence, securing privacy.
      </p>
    </div>
  );
};

export default Footer;

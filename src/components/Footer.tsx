
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FooterProps {
  color?: string;
}

const Footer = ({
  color = '#FF9E2C'  // Orange theme
}: FooterProps) => {
  const year = new Date().getFullYear();
  
  return (
    <div className="py-5 text-center border-t border-orange-500/20 backdrop-blur-md bg-gradient-to-b from-orange-900/10 to-orange-800/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.p 
            className="text-orange-200 opacity-90 text-sm md:text-base font-inter animate-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-teal-300 to-orange-400"
            whileHover={{ scale: 1.01 }}
          >
            © {year} Prism Search. All rights reserved.
          </motion.p>
          
          <div className="flex items-center gap-6">
            <FooterLink href="/search">Search</FooterLink>
            <FooterLink href="/chat">Chat</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-orange-200/50">
          <p>Powered by advanced AI to bring you the best search experience</p>
        </div>
      </div>
    </div>
  );
};

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <Link 
    to={href}
    className="text-orange-200/80 hover:text-orange-200 transition-colors"
  >
    <motion.span 
      className="relative inline-block"
      whileHover={{ y: -1 }}
    >
      {children}
      <motion.span 
        className="absolute left-0 right-0 bottom-0 h-px bg-orange-400/50"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.span>
  </Link>
);

export default Footer;

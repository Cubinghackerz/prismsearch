import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}

const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, onToggle }) => {
  return (
    <div className="flex flex-col items-center justify-center mb-10">
      <div className="flex items-center justify-center space-x-4 bg-prism-surface/50 p-1 rounded-lg border border-prism-border">
        <button
          onClick={!isYearly ? onToggle : undefined}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            !isYearly 
              ? 'bg-prism-primary text-white shadow-md' 
              : 'text-prism-text-muted hover:text-prism-text'
          }`}
        >
          Monthly
        </button>
        
        <button
          onClick={isYearly ? onToggle : undefined}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
            isYearly 
              ? 'bg-prism-primary text-white shadow-md' 
              : 'text-prism-text-muted hover:text-prism-text'
          }`}
        >
          Yearly
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-3 -right-10 bg-prism-accent/90 text-white text-xs py-0.5 px-2 rounded-full flex items-center"
          >
            <Check className="w-3 h-3 mr-0.5" />
            <span>25% off</span>
          </motion.div>
        </button>
      </div>
      
      <p className="mt-4 text-sm text-prism-text-muted">
        {isYearly ? 'Save 25% with yearly billing' : 'Switch to yearly for 25% discount'}
      </p>
    </div>
  );
};

export default PricingToggle;
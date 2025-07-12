import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
interface PricingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}
const PricingToggle: React.FC<PricingToggleProps> = ({
  isYearly,
  onToggle
}) => {
  return <div className="flex flex-col items-center justify-center mb-10">
      <div className="flex items-center justify-center space-x-4 bg-prism-surface/50 p-1 rounded-lg border border-prism-border">
        <button onClick={!isYearly ? onToggle : undefined} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${!isYearly ? 'bg-prism-primary text-white shadow-md' : 'text-prism-text-muted hover:text-prism-text'}`}>
          Monthly
        </button>
        
        
      </div>
      
      <p className="mt-4 text-sm text-prism-text-muted">
        {isYearly ? 'Save 25% with yearly billing' : 'Switch to yearly for 25% discount'}
      </p>
    </div>;
};
export default PricingToggle;
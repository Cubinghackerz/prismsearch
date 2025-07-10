
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PricingPlan } from './PricingTable';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingCardProps {
  plan: PricingPlan;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "border rounded-lg overflow-hidden transition-all duration-200 backdrop-blur-md",
        plan.popular ? "border-prism-accent/40" : "border-prism-border",
        plan.popular ? "bg-prism-accent/20" : "bg-prism-surface/50",
      )}
    >
      {plan.popular && (
        <div className="bg-gradient-to-r from-prism-accent via-prism-accent-dark to-prism-accent animate-gradient-slow text-white text-center text-sm font-medium py-1 font-montserrat">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-prism-text font-montserrat">{plan.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-prism-primary-light via-prism-primary to-prism-accent font-montserrat">{plan.price}</span>
          {plan.period && (
            <span className="ml-1 text-prism-text-muted font-inter">{plan.period}</span>
          )}
        </div>
        
        <div className="mt-5">
          <h4 className="text-sm font-medium text-prism-text-muted font-montserrat">Usage Limits</h4>
          <div className="mt-2 text-sm text-prism-text-muted font-inter">
            {Array.isArray(plan.usage) ? (
              plan.usage.map((item, i) => <div key={i} className="mb-1">{item}</div>)
            ) : (
              plan.usage
            )}
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-prism-primary hover:text-prism-primary-light transition-colors">
            <span className="text-prism-primary hover:text-prism-primary-light">View details</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-medium text-prism-text-muted font-montserrat">Features</h4>
                <ul className="mt-2 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-prism-text-muted font-inter flex items-start">
                      <span className="mr-2 text-prism-primary-light">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-prism-text-muted font-montserrat">Support & SLA</h4>
                <div className="mt-2 text-sm text-prism-text-muted font-inter">
                  {plan.support}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-6">
          <Button
            onClick={plan.buttonAction}
            variant={plan.available ? "default" : "outline"}
            disabled={!plan.available}
            className={cn(
              "w-full transition-colors glow-button",
              plan.available 
                ? "bg-prism-primary hover:bg-prism-primary-dark text-white" 
                : "text-prism-primary border-prism-border hover:bg-prism-primary/10"
            )}
          >
            {plan.buttonText}
          </Button>
          {!plan.available && (
                        <div className="text-xs text-prism-primary mt-2 text-center font-inter">
              Currently unavailable
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

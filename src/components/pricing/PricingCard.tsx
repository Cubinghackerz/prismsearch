
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
        plan.popular ? "border-orange-500/40" : "border-orange-500/20",
        plan.popular ? "bg-orange-900/20" : "bg-orange-900/10",
      )}
    >
      {plan.popular && (
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 animate-gradient-slow text-white text-center text-sm font-medium py-1 font-montserrat">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-orange-100 font-montserrat">{plan.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600 font-montserrat">{plan.price}</span>
          {plan.period && (
            <span className="ml-1 text-orange-300 font-inter">{plan.period}</span>
          )}
        </div>
        
        <div className="mt-5">
          <h4 className="text-sm font-medium text-orange-200 font-montserrat">Usage Limits</h4>
          <div className="mt-2 text-sm text-orange-300 font-inter">
            {Array.isArray(plan.usage) ? (
              plan.usage.map((item, i) => <div key={i} className="mb-1">{item}</div>)
            ) : (
              plan.usage
            )}
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
            <span>View details</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-medium text-orange-200 font-montserrat">Features</h4>
                <ul className="mt-2 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-orange-300 font-inter flex items-start">
                      <span className="mr-2 text-orange-400">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-orange-200 font-montserrat">Support & SLA</h4>
                <div className="mt-2 text-sm text-orange-300 font-inter">
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
              "w-full transition-colors",
              plan.available 
                ? "bg-orange-500 hover:bg-orange-600 text-white glow-button" 
                : "text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
            )}
          >
            {plan.buttonText}
          </Button>
          {!plan.available && (
            <div className="text-xs text-orange-400 mt-2 text-center font-inter">
              Currently unavailable
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

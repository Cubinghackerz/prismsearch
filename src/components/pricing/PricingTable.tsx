import React from 'react';
import { Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
interface PricingFeature {
  name: string;
  basic: boolean | string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
  tooltip?: string;
}
export interface PricingPlan {
  name: string;
  price: string;
  currency?: string;
  period?: string;
  description: string;
  features: string[];
  usage: string | string[];
  support: string;
  available: boolean;
  popular?: boolean;
  buttonText: string;
  buttonAction: () => void;
}
interface PricingTableProps {
  plans: PricingPlan[];
}
export const PricingTable: React.FC<PricingTableProps> = ({
  plans
}) => {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="hidden md:block w-full overflow-x-auto rounded-xl">
      <div className="min-w-full border border-prism-border rounded-lg overflow-hidden backdrop-blur-md bg-prism-surface/50 mx-0 px-0 py-[10px]">
        <table className="min-w-full divide-y divide-prism-blue-primary/20">
          <thead>
            <tr className="bg-prism-primary/20">
              <th className="px-6 py-5 text-left text-sm font-bold text-prism-text font-montserrat">
                Plan
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-text font-montserrat">Price (USD/mo)</th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-text font-montserrat">
                Usage Limits
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-text font-montserrat">
                Features
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-text font-montserrat">
                Support & SLA
              </th>
              <th className="px-6 py-5 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-prism-border/50">
            {plans.map((plan, index) => <tr key={plan.name} className={cn("transition-all hover:bg-prism-primary/10", plan.popular && "bg-prism-accent/20 hover:bg-prism-accent/30")}>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-prism-text font-montserrat">{plan.name}</span>
                    {plan.popular && <span className="text-xs text-prism-accent-light font-montserrat mt-1">MOST POPULAR</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="font-semibold text-xl text-transparent bg-clip-text bg-gradient-to-r from-prism-primary-light via-prism-primary to-prism-accent font-montserrat">{plan.price}</div>
                  <div className="text-sm text-prism-text-muted font-inter">
                    {plan.period}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-prism-text-muted font-inter">
                    {Array.isArray(plan.usage) ? plan.usage.map((item, i) => <div key={i}>{item}</div>) : plan.usage}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-prism-text-muted font-inter">
                    {plan.features.map((feature, i) => <div key={i} className="mb-1">{feature}</div>)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-prism-text-muted font-inter">{plan.support}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Button onClick={plan.buttonAction} variant={plan.available ? "default" : "outline"} disabled={!plan.available} className={cn("transition-colors w-full", plan.available ? "bg-prism-primary hover:bg-prism-primary-dark text-white glow-button" : "text-prism-primary border-prism-border hover:bg-prism-primary/10")}>
                    {plan.buttonText}
                  </Button>
                  {!plan.available && <div className="text-xs text-prism-primary mt-2 font-inter">
                      Currently unavailable
                    </div>}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>;
};
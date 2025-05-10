import React from 'react';
import { Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

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

export const PricingTable: React.FC<PricingTableProps> = ({ plans }) => {
  return (
    <div className="hidden md:block w-full overflow-x-auto">
      <div className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-5 text-left text-sm font-bold text-prism-charcoal font-montserrat">
                Plan
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-charcoal font-montserrat">
                Price (AUD/mo)
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-charcoal font-montserrat">
                Usage Limits
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-charcoal font-montserrat">
                Features
              </th>
              <th className="px-6 py-5 text-center text-sm font-bold text-prism-charcoal font-montserrat">
                Support & SLA
              </th>
              <th className="px-6 py-5 text-center"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan, index) => (
              <tr 
                key={plan.name}
                className={cn(
                  "transition-all hover:bg-gray-50",
                  plan.popular && "bg-blue-50 hover:bg-blue-100"
                )}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-prism-charcoal font-montserrat">{plan.name}</span>
                    {plan.popular && (
                      <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-prism-violet text-white">
                        Popular
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="font-semibold text-xl font-montserrat">{plan.price}</div>
                  <div className="text-sm text-gray-500 font-inter">
                    {plan.period}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-900 font-inter">
                    {Array.isArray(plan.usage) ? (
                      plan.usage.map((item, i) => <div key={i}>{item}</div>)
                    ) : (
                      plan.usage
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-900 font-inter">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="mb-1">{feature}</div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-900 font-inter">{plan.support}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Button
                    onClick={plan.buttonAction}
                    variant={plan.available ? "default" : "outline"}
                    disabled={!plan.available}
                    className={cn(
                      "transition-colors w-full",
                      plan.available 
                        ? "bg-prism-violet hover:bg-prism-teal text-white" 
                        : "text-gray-400 border-gray-300"
                    )}
                  >
                    {plan.buttonText}
                  </Button>
                  {!plan.available && (
                    <div className="text-xs text-gray-500 mt-2 font-inter">
                      Currently unavailable
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

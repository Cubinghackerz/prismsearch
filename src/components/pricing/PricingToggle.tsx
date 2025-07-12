
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PricingToggleProps {
  isMonthly: boolean;
  togglePricing: () => void;
}

export const PricingToggle: React.FC<PricingToggleProps> = ({ isMonthly, togglePricing }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <Label htmlFor="pricing-toggle" className={`text-sm font-medium ${isMonthly ? 'text-purple-400' : 'text-slate-400'}`}>
        Monthly
      </Label>
      <Switch
        id="pricing-toggle"
        checked={!isMonthly}
        onCheckedChange={() => togglePricing()}
        className="data-[state=checked]:bg-purple-600"
      />
      <Label htmlFor="pricing-toggle" className={`text-sm font-medium ${!isMonthly ? 'text-purple-400' : 'text-slate-400'}`}>
        Yearly
        <span className="ml-1 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
          Save 20%
        </span>
      </Label>
    </div>
  );
};

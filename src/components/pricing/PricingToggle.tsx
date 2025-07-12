
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (checked: boolean) => void;
}

export const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, onToggle }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <Label htmlFor="pricing-toggle" className={`text-sm font-medium ${!isYearly ? 'text-purple-400' : 'text-slate-400'}`}>
        Monthly
      </Label>
      <Switch
        id="pricing-toggle"
        checked={isYearly}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-purple-600"
      />
      <Label htmlFor="pricing-toggle" className={`text-sm font-medium ${isYearly ? 'text-purple-400' : 'text-slate-400'}`}>
        Yearly
        <span className="ml-1 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
          Save 20%
        </span>
      </Label>
    </div>
  );
};

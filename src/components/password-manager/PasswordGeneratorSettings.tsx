
import React from 'react';
import { Label } from '@/components/ui/label';

interface PasswordGeneratorSettingsProps {
  passwordLength: number;
  setPasswordLength: (value: number) => void;
  includeUppercase: boolean;
  setIncludeUppercase: (value: boolean) => void;
  includeLowercase: boolean;
  setIncludeLowercase: (value: boolean) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (value: boolean) => void;
  includeSymbols: boolean;
  setIncludeSymbols: (value: boolean) => void;
}

export const PasswordGeneratorSettings: React.FC<PasswordGeneratorSettingsProps> = ({
  passwordLength,
  setPasswordLength,
  includeUppercase,
  setIncludeUppercase,
  includeLowercase,
  setIncludeLowercase,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols
}) => {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
      <h3 className="text-slate-200 font-medium mb-3">Password Generator Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-slate-300">Length: {passwordLength}</Label>
          <input
            type="range"
            min="8"
            max="64"
            value={passwordLength}
            onChange={(e) => setPasswordLength(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-300 text-sm">A-Z</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-300 text-sm">a-z</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-300 text-sm">0-9</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="rounded"
            />
            <span className="text-slate-300 text-sm">!@#$</span>
          </label>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { GaugeCircle, Infinity as InfinityIcon, AlertTriangle } from 'lucide-react';
import { useDailyQueryLimit, UsageCategory } from '@/hooks/useDailyQueryLimit';

interface ToolLimitDisplayProps {
  category: UsageCategory;
  label: string;
  description?: string;
}

const ToolLimitDisplay: React.FC<ToolLimitDisplayProps> = ({ category, label, description }) => {
  const { isLoaded, isUnlimitedUser, getRemaining, limits, updateTrigger } = useDailyQueryLimit();

  if (!isLoaded) {
    return null;
  }

  if (isUnlimitedUser) {
    return (
      <motion.div
        key={`${category}-unlimited-${updateTrigger}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
      >
        <div className="flex items-center gap-2">
          <InfinityIcon className="h-4 w-4" />
          <span>
            Unlimited access active — daily limits do not apply to you today.
          </span>
        </div>
      </motion.div>
    );
  }

  const limit = limits[category];
  const remaining = getRemaining(category);
  const used = Math.max(0, limit - remaining);
  const ratio = limit > 0 ? Math.min(1, used / limit) : 0;

  const isLow = remaining <= Math.max(1, Math.floor(limit * 0.2));
  const isEmpty = remaining === 0;

  const statusColor = isEmpty
    ? 'text-red-300'
    : isLow
      ? 'text-amber-300'
      : 'text-indigo-200';

  const barColor = isEmpty ? 'bg-red-500/70' : isLow ? 'bg-amber-400/70' : 'bg-indigo-500/70';

  const StatusIcon = isEmpty ? AlertTriangle : GaugeCircle;

  return (
    <motion.div
      key={`${category}-${used}-${updateTrigger}`}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-100">
          <GaugeCircle className="h-4 w-4 text-indigo-300" />
          {label}
        </div>
        <div className={`flex items-center gap-2 ${statusColor}`}>
          <StatusIcon className="h-4 w-4" />
          <span>
            {remaining} of {limit} uses left today
          </span>
        </div>
      </div>
      {description && <p className="mt-2 text-xs text-slate-400">{description}</p>}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
        <div className={`h-full ${barColor}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
    </motion.div>
  );
};

export default ToolLimitDisplay;

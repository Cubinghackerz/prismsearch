
import React from 'react';
import { Search, MessageCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: {
    id: number;
    type: 'search' | 'chat';
    query?: string;
    topic?: string;
    timestamp: string;
  };
  onRerun: () => void;
}

export function ActivityItem({ activity, onRerun }: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full",
          activity.type === 'search' ? "bg-blue-100" : "bg-indigo-100"
        )}>
          {activity.type === 'search' ? (
            <Search className="h-5 w-5 text-blue-600" />
          ) : (
            <MessageCircle className="h-5 w-5 text-indigo-600" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {activity.type === 'search' ? activity.query : activity.topic}
          </p>
          <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-sm"
        onClick={onRerun}
      >
        {activity.type === 'search' ? 'Re-run' : 'Resume'} 
        <RefreshCw className="ml-2 h-3 w-3" />
      </Button>
    </div>
  );
}

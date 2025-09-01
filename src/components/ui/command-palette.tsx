
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight } from 'lucide-react';
import { useCommandPalette, Command } from '@/hooks/useCommandPalette';
import { cn } from '@/lib/utils';

const CommandPalette = () => {
  const {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    filteredCommands,
    executeCommand,
  } = useCommandPalette();

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background border-border">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <Input
            placeholder="Search commands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 outline-0 focus-visible:ring-0 text-base"
          />
          <Badge variant="outline" className="ml-auto text-xs">
            Ctrl+K
          </Badge>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-4">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              {commands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-left",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  )}
                >
                  <span>{command.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground">
              No commands found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;

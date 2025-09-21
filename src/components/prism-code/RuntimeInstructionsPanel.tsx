import { useMemo, useState } from 'react';
import { CodeGenerationRuntime } from '@/services/codeGenerationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Copy, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RuntimeInstructionsPanelProps {
  runtime?: CodeGenerationRuntime;
  className?: string;
}

const commandSections: Array<{ key: keyof CodeGenerationRuntime; label: string }> = [
  { key: 'setup', label: 'Setup commands' },
  { key: 'start', label: 'Start commands' },
  { key: 'previewCommands', label: 'Preview commands' },
];

const RuntimeInstructionsPanel = ({ runtime, className }: RuntimeInstructionsPanelProps) => {
  const { toast } = useToast();
  const [showTerminal, setShowTerminal] = useState(false);

  const sections = useMemo(() => {
    if (!runtime) return [];

    return commandSections
      .map((section) => {
        const commands = runtime[section.key];
        if (!commands || commands.length === 0) return null;
        return {
          label: section.label,
          commands,
        };
      })
      .filter((section): section is { label: string; commands: string[] } => Boolean(section));
  }, [runtime]);

  const terminalLines = useMemo(() => {
    if (!runtime) return [];

    const lines: string[] = [];

    if (runtime.environment) {
      lines.push(`# Environment: ${runtime.environment}`);
    }

    sections.forEach((section) => {
      lines.push(`\n# ${section.label}`);
      section.commands.forEach((command) => {
        lines.push(`$ ${command}`);
        lines.push('...');
      });
    });

    if (runtime.notes && runtime.notes.length > 0) {
      lines.push('\n# Notes');
      runtime.notes.forEach((note) => {
        lines.push(`- ${note}`);
      });
    }

    return lines;
  }, [runtime, sections]);

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: 'Command copied',
        description: command,
      });
    } catch (error) {
      console.error('Failed to copy command', error);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy the command to your clipboard.',
        variant: 'destructive',
      });
    }
  };

  if (!runtime) {
    return null;
  }

  return (
    <Card className={cn('border-border/40 bg-muted/20', className)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Runtime</p>
            {runtime.environment && (
              <p className="text-sm text-foreground mt-1">{runtime.environment}</p>
            )}
          </div>
          {(sections.length > 0 || (runtime.notes && runtime.notes.length > 0)) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowTerminal(true)}
            >
              <Terminal className="w-4 h-4" />
              Open terminal view
            </Button>
          )}
        </div>

        {sections.length > 0 && (
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                    {section.label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {section.commands.map((command, index) => (
                    <div
                      key={`${section.label}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-background/60 px-3 py-2"
                    >
                      <code className="text-xs text-foreground break-all">{command}</code>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopy(command)}
                        className="h-8 w-8"
                        aria-label={`Copy command: ${command}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {runtime.notes && runtime.notes.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              {runtime.notes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <Dialog open={showTerminal} onOpenChange={setShowTerminal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Runtime console</DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-2 h-64 rounded-md border border-border/40 bg-black/90 p-4">
              <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed">
                {terminalLines.length > 0
                  ? terminalLines.join('\n')
                  : '# No runtime commands provided'}
              </pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RuntimeInstructionsPanel;

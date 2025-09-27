import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SavedResearchNotebook } from '@/services/researchNotebookStorage';
import { BookOpen, Download, FileText, Trash2 } from 'lucide-react';

export type NotebookExportFormat = 'markdown' | 'json';

interface SavedNotebooksDrawerProps {
  open: boolean;
  notebooks: SavedResearchNotebook[];
  onOpenChange: (open: boolean) => void;
  onLoad: (entry: SavedResearchNotebook) => void;
  onDelete: (id: string) => void;
  onExport: (entry: SavedResearchNotebook, format: NotebookExportFormat) => void;
}

const SavedNotebooksDrawer: React.FC<SavedNotebooksDrawerProps> = ({
  open,
  notebooks,
  onOpenChange,
  onLoad,
  onDelete,
  onExport,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-0">
          <DrawerTitle>Saved notebooks</DrawerTitle>
          <DrawerDescription>Manage notebooks stored locally on this device.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6">
          {notebooks.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No notebooks saved yet. Run a session and save it to revisit later.
            </div>
          ) : (
            <ScrollArea className="mt-4 max-h-[60vh] pr-3">
              <div className="space-y-3">
                {notebooks.map((entry) => {
                  const updatedLabel = (() => {
                    try {
                      return formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true });
                    } catch {
                      return 'recently';
                    }
                  })();

                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border/60 bg-background/80 p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                          <p className="text-xs text-muted-foreground">Updated {updatedLabel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="gap-1"
                            onClick={() => onLoad(entry)}
                          >
                            <BookOpen className="h-4 w-4" />
                            Load
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" size="sm" variant="outline" className="gap-1">
                                <Download className="h-4 w-4" />
                                Export
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[160px]">
                              <DropdownMenuItem onSelect={() => onExport(entry, 'markdown')}>
                                <FileText className="mr-2 h-4 w-4" /> Markdown (.md)
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onExport(entry, 'json')}>
                                <FileText className="mr-2 h-4 w-4" /> JSON (.json)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete(entry.id)}
                            aria-label={`Delete ${entry.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">{entry.notebook.overview}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SavedNotebooksDrawer;

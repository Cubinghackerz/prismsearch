import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackPredefinedTemplate,
} from '@codesandbox/sandpack-react';
import { Editor } from '@monaco-editor/react';
import {
  ArrowLeftRight,
  Download,
  FilePlus2,
  FolderPlus,
  MoreHorizontal,
  Plus,
  Redo2,
  RefreshCcw,
  Save,
  Trash,
  Undo2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type MathEngineTemplateId } from './mathEngineTemplates';
import { useMathEngine } from '@/context/MathEngineContext';
import { useToast } from '@/hooks/use-toast';

const AUTOSAVE_DELAY = 750;

const formatTimestamp = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch (error) {
    return iso;
  }
};

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const MathEngineWorkspace: React.FC = () => {
  const {
    projects,
    activeProjectId,
    isLoading,
    selectProject,
    createProject,
    duplicateProject,
    renameProject,
    deleteProject,
    createFile,
    updateFile,
    deleteFile,
    renameFile,
    undo,
    redo,
    exportProject,
    importProject,
    maxProjects,
    templates,
  } = useMathEngine();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MathEngineTemplateId>('react-vite');
  const [newProjectName, setNewProjectName] = useState('');
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const saveTimeout = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const files = activeProject?.files ?? [];

  useEffect(() => {
    if (!activeProject) {
      setActiveFilePath(null);
      setEditorValue('');
      return;
    }

    if (activeFilePath && files.some((file) => file.path === activeFilePath)) {
      return;
    }

    const preferredFile =
      activeProject.entryFile && files.some((file) => file.path === activeProject.entryFile)
        ? activeProject.entryFile
        : files[0]?.path ?? null;
    setActiveFilePath(preferredFile);
  }, [activeProject, files, activeFilePath]);

  const activeFile = useMemo(
    () => files.find((file) => file.path === activeFilePath) ?? null,
    [files, activeFilePath]
  );

  useEffect(() => {
    if (activeProject) {
      setLastSavedAt(activeProject.updatedAt);
    }
  }, [activeProject?.updatedAt]);

  useEffect(() => {
    if (!activeFile) {
      setEditorValue('');
      return;
    }
    setEditorValue(activeFile.content);
  }, [activeFile]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        window.clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  const handleCreateProject = useCallback(async () => {
    const created = await createProject(selectedTemplate, newProjectName);
    if (!created) {
      toast({
        title: 'Unable to create project',
        description:
          projects.length >= maxProjects
            ? 'You have reached the 10 project limit. Delete a project to create a new one.'
            : 'An unexpected error occurred creating the project.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreateOpen(false);
    setNewProjectName('');
    setLastSavedAt(created.updatedAt);
    toast({
      title: 'Project created',
      description: `${created.name} is ready in your workspace.`,
    });
  }, [createProject, maxProjects, newProjectName, projects.length, selectedTemplate, toast]);

  const handleDuplicate = useCallback(
    async (projectId: string) => {
      const duplicated = await duplicateProject(projectId);
      if (!duplicated) {
        toast({
          title: 'Unable to duplicate project',
          description: 'You may have reached the storage limit or the project is missing.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Project duplicated',
        description: `${duplicated.name} added to your workspace.`,
      });
    },
    [duplicateProject, toast]
  );

  const handleRename = useCallback(
    async (projectId: string) => {
      const project = projects.find((candidate) => candidate.id === projectId);
      if (!project) {
        return;
      }

      const nextName = window.prompt('Rename project', project.name);
      if (!nextName || nextName.trim() === project.name) {
        return;
      }

      await renameProject(projectId, nextName);
      toast({
        title: 'Project renamed',
        description: `${nextName.trim()} saved.`,
      });
    },
    [projects, renameProject, toast]
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      const project = projects.find((candidate) => candidate.id === projectId);
      if (!project) {
        return;
      }

      const confirmed = window.confirm(`Delete ${project.name}? This action cannot be undone.`);
      if (!confirmed) {
        return;
      }

      await deleteProject(projectId);
      toast({
        title: 'Project deleted',
        description: `${project.name} removed from local storage.`,
      });
    },
    [deleteProject, projects, toast]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (!activeProject || !activeFile) {
        return;
      }

      const nextValue = value ?? '';
      setEditorValue(nextValue);

      if (saveTimeout.current) {
        window.clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = window.setTimeout(async () => {
        if (!activeProject || !activeFile) {
          return;
        }

        if (nextValue === activeFile.content) {
          return;
        }

        setIsSaving(true);
        try {
          await updateFile(activeProject.id, activeFile.path, nextValue, {
            snapshotLabel: `Edited ${activeFile.path}`,
          });
          setLastSavedAt(new Date().toISOString());
        } catch (error) {
          console.error('Failed to save file', error);
          toast({
            title: 'Save failed',
            description: 'Unable to save changes. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsSaving(false);
        }
      }, AUTOSAVE_DELAY);
    },
    [activeFile, activeProject, toast, updateFile]
  );

  const handleManualSave = useCallback(async () => {
    if (!activeProject || !activeFile) {
      return;
    }

    if (editorValue === activeFile.content) {
      toast({ title: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    try {
      await updateFile(activeProject.id, activeFile.path, editorValue, {
        snapshotLabel: `Edited ${activeFile.path}`,
      });
      setLastSavedAt(new Date().toISOString());
      toast({ title: 'Changes saved' });
    } catch (error) {
      console.error('Failed to save file', error);
      toast({
        title: 'Save failed',
        description: 'Unable to save changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [activeFile, activeProject, editorValue, toast, updateFile]);

  const handleCreateFile = useCallback(async () => {
    if (!activeProject) {
      return;
    }

    const nextPath = window.prompt('Create file at path', 'src/new-file.ts');
    if (!nextPath) {
      return;
    }

    try {
      await createFile(activeProject.id, nextPath.trim());
      setActiveFilePath(nextPath.trim());
      toast({
        title: 'File created',
        description: `${nextPath.trim()} added to ${activeProject.name}.`,
      });
    } catch (error) {
      console.error('Failed to create file', error);
      toast({
        title: 'Could not create file',
        description: 'A file already exists at that path.',
        variant: 'destructive',
      });
    }
  }, [activeProject, createFile, toast]);

  const handleRenameFile = useCallback(async () => {
    if (!activeProject || !activeFile) {
      return;
    }

    const nextPath = window.prompt('Rename file', activeFile.path);
    if (!nextPath || nextPath.trim() === activeFile.path) {
      return;
    }

    try {
      await renameFile(activeProject.id, activeFile.path, nextPath.trim());
      setActiveFilePath(nextPath.trim());
      toast({
        title: 'File renamed',
        description: `${activeFile.path} is now ${nextPath.trim()}.`,
      });
    } catch (error) {
      console.error('Failed to rename file', error);
      toast({
        title: 'Rename failed',
        description: 'A file already exists with that name.',
        variant: 'destructive',
      });
    }
  }, [activeFile, activeProject, renameFile, toast]);

  const handleDeleteFile = useCallback(async () => {
    if (!activeProject || !activeFile) {
      return;
    }

    const confirmed = window.confirm(`Delete ${activeFile.path}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    await deleteFile(activeProject.id, activeFile.path);
    toast({
      title: 'File deleted',
      description: `${activeFile.path} removed from the project.`,
    });
  }, [activeFile, activeProject, deleteFile, toast]);

  const handleUndo = useCallback(async () => {
    if (!activeProject) {
      return;
    }

    const changed = await undo(activeProject.id);
    if (!changed) {
      toast({ title: 'Nothing to undo' });
      return;
    }

    setLastSavedAt(new Date().toISOString());
    toast({ title: 'Reverted changes' });
  }, [activeProject, toast, undo]);

  const handleRedo = useCallback(async () => {
    if (!activeProject) {
      return;
    }

    const changed = await redo(activeProject.id);
    if (!changed) {
      toast({ title: 'Nothing to redo' });
      return;
    }

    setLastSavedAt(new Date().toISOString());
    toast({ title: 'Reapplied changes' });
  }, [activeProject, redo, toast]);

  const handleExport = useCallback(async () => {
    if (!activeProject) {
      return;
    }

    const blob = await exportProject(activeProject.id);
    if (!blob) {
      toast({
        title: 'Export failed',
        description: 'Unable to generate archive for this project.',
        variant: 'destructive',
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeProject.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Project exported', description: 'Archive downloaded to your device.' });
  }, [activeProject, exportProject, toast]);

  const handleImport = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const imported = await importProject(file);
      event.target.value = '';
      if (!imported) {
        toast({
          title: 'Import failed',
          description: 'Ensure the archive is a valid Math Engine export.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Project imported',
        description: `${imported.name} added to your workspace.`,
      });
    },
    [importProject, toast]
  );

  const sandpackFiles = useMemo(() => {
    if (!activeProject) {
      return {};
    }

    return Object.fromEntries(
      activeProject.files.map((file) => [ensureLeadingSlash(file.path), file.content])
    );
  }, [activeProject]);

  const sandpackTemplate = useMemo<SandpackPredefinedTemplate>(() => {
    if (!activeProject) {
      return 'vite';
    }
    return activeProject.framework === 'react' ? 'vite-react-ts' : 'vite';
  }, [activeProject]);

  const sandpackActiveFile = ensureLeadingSlash(activeFile?.path ?? activeProject?.entryFile ?? 'index.html');

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
        Loading Math Engine workspace...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 gap-4 overflow-hidden">
      <aside className="flex w-64 flex-col rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div>
            <h3 className="text-sm font-semibold">Projects</h3>
            <p className="text-xs text-muted-foreground">Stored locally in your browser</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>
                  Choose a template to bootstrap your local workspace. Everything stays in your browser until you export it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        'rounded-lg border px-4 py-3 text-left transition',
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/10'
                          : 'hover:border-primary'
                      )}
                    >
                      <div className="font-medium">{template.name}</div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="project-name">
                    Project name
                  </label>
                  <Input
                    id="project-name"
                    placeholder="My Math Engine project"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProject} disabled={projects.length >= maxProjects}>
                  Create project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => selectProject(project.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition',
                  project.id === activeProjectId
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span>{project.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {project.framework}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatTimestamp(project.updatedAt)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Project actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleDuplicate(project.id)}>
                      <FolderPlus className="mr-2 h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleRename(project.id)}>
                      <ArrowLeftRight className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => handleDelete(project.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            ))}
            {!projects.length && (
              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                No projects yet. Create one to get started.
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-3 text-xs text-muted-foreground">
          <div>Projects stored: {projects.length} / {maxProjects}</div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateFile} disabled={!activeProject}>
            <FilePlus2 className="mr-2 h-4 w-4" /> New file
          </Button>
          <Button variant="outline" size="sm" onClick={handleRenameFile} disabled={!activeFile}>
            <ArrowLeftRight className="mr-2 h-4 w-4" /> Rename file
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteFile} disabled={!activeFile}>
            <Trash className="mr-2 h-4 w-4" /> Delete file
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={!activeProject}>
            <Undo2 className="mr-2 h-4 w-4" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={!activeProject}>
            <Redo2 className="mr-2 h-4 w-4" /> Redo
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={handleManualSave} disabled={!activeFile}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => activeFile && setEditorValue(activeFile.content)} disabled={!activeFile}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset file
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!activeProject}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
        <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(280px,0.5fr)]">
          <CardPane title="Files" subtitle="Double click to open">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setActiveFilePath(file.path)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition',
                      file.path === activeFile?.path
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span className="truncate" title={file.path}>
                      {file.path}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(file.updatedAt)}
                    </span>
                  </button>
                ))}
                {!files.length && (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    This project has no files yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardPane>
          <CardPane
            title={activeFile?.path ?? 'Select a file'}
            subtitle={activeProject ? `${activeProject.framework.toUpperCase()} • autosaves every ${AUTOSAVE_DELAY}ms` : ''}
          >
            {activeFile ? (
              <Editor
                key={activeFile.path}
                height="100%"
                language={(() => {
                  if (activeFile.path.endsWith('.ts') || activeFile.path.endsWith('.tsx')) {
                    return 'typescript';
                  }
                  if (activeFile.path.endsWith('.js') || activeFile.path.endsWith('.jsx')) {
                    return 'javascript';
                  }
                  if (activeFile.path.endsWith('.css')) {
                    return 'css';
                  }
                  if (activeFile.path.endsWith('.json')) {
                    return 'json';
                  }
                  if (activeFile.path.endsWith('.html')) {
                    return 'html';
                  }
                  return 'plaintext';
                })()}
                value={editorValue}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Choose a file to start editing.
              </div>
            )}
          </CardPane>
          <CardPane title="Live preview" subtitle="Sandpack runtime updates automatically">
            {activeProject ? (
              <SandpackProvider
                key={`${activeProject.id}-${activeProject.updatedAt}`}
                template={sandpackTemplate}
                files={sandpackFiles}
                options={{
                  activeFile: sandpackActiveFile,
                  autorun: true,
                  recompileMode: 'delayed',
                  recompileDelay: 500,
                }}
              >
                <SandpackLayout>
                  <SandpackPreview showRefreshButton showOpenInCodeSandbox={false} />
                </SandpackLayout>
              </SandpackProvider>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select or create a project to see the preview.
              </div>
            )}
          </CardPane>
        </div>
        <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Runtime:
              <strong className="ml-1">Sandpack</strong>
            </span>
            {activeProject && (
              <span>
                Framework:
                <strong className="ml-1 capitalize">{activeProject.framework}</strong>
              </span>
            )}
            {activeFile && lastSavedAt && (
              <span>
                Last saved at <strong>{formatTimestamp(lastSavedAt)}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Saving…
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                Autosaved
              </Badge>
            )}
            {activeProject && (
              <span>
                Snapshots:
                <strong className="ml-1">
                  {activeProject.snapshotIndex + 1} / {activeProject.snapshots.length}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CardPaneProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const CardPane: React.FC<CardPaneProps> = ({ title, subtitle, children }) => (
  <div className="flex min-h-0 flex-col rounded-lg border bg-background">
    <div className="border-b px-4 py-2">
      <div className="text-sm font-semibold">{title}</div>
      {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

export default MathEngineWorkspace;

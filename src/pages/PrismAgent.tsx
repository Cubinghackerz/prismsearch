import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  PrismAgentMode,
  PrismAgentMessage,
  PrismAgentProject,
  usePrismAgent,
} from '@/context/PrismAgentContext';
import PrismAgentPlanCard from '@/components/prism-agent/PrismAgentPlanCard';
import PrismAgentVersionHistory from '@/components/prism-agent/PrismAgentVersionHistory';
import PrismAgentTerminal from '@/components/prism-agent/PrismAgentTerminal';
import PrismAgentLivePreview from '@/components/prism-agent/PrismAgentLivePreview';
import { PrismAgentRuntimeProvider } from '@/context/PrismAgentRuntimeContext';
import CodeGenerationBubble from '@/components/chat/CodeGenerationBubble';
import {
  DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
  generateCodePlan,
  generateWebApp,
} from '@/services/codeGenerationService';
import { v4 as uuidv4 } from 'uuid';
import { Bot, FolderPlus, Pencil, Plus, Sparkles, Trash, Wand2 } from 'lucide-react';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const STATUS_TEXT = [
  'Unlocking environment',
  'Updating to latest version',
  'Checking dependencies',
  'Installing dependencies',
  'Launching environment',
];

const MODE_MODEL: Record<PrismAgentMode, string> = {
  fast: 'gemini-2.5-flash',
  thinking: 'gemini-2.5-pro',
};

const PrismAgent = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const {
    projects,
    activeProjectId,
    createProject,
    renameProject,
    deleteProject,
    selectProject,
    addMessage,
    addVersion,
    setActiveVersion,
    maxProjects,
  } = usePrismAgent();
  const { toast } = useToast();

  const [mode, setMode] = useState<PrismAgentMode>('thinking');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const rotation = setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_TEXT.length);
    }, 2000);

    const bootTimer = setTimeout(() => {
      setIsBooting(false);
      clearInterval(rotation);
    }, 10000);

    return () => {
      clearInterval(rotation);
      clearTimeout(bootTimer);
    };
  }, []);

  useEffect(() => {
    if (projects.length === 0 || activeProjectId) {
      return;
    }

    selectProject(projects[0].id);
  }, [projects, activeProjectId, selectProject]);

  const activeProject = useMemo<PrismAgentProject | undefined>(
    () => projects.find((project) => project.id === activeProjectId),
    [projects, activeProjectId]
  );

  const activeVersion = useMemo(() => {
    if (!activeProject?.activeVersionId) {
      return undefined;
    }

    return activeProject.versions.find((version) => version.id === activeProject.activeVersionId);
  }, [activeProject]);

  const hasAccess = useMemo(() => {
    if (!user) {
      return false;
    }
    return EXCLUSIVE_USER_IDS.has(user.id);
  }, [user]);

  const handleCreateProject = useCallback(() => {
    if (projects.length >= maxProjects) {
      toast({
        title: 'Project limit reached',
        description: 'You can store up to 10 Prism Agent projects. Delete one to create a new slot.',
        variant: 'destructive',
      });
      return;
    }

    const created = createProject();
    if (created) {
      toast({
        title: 'Project created',
        description: `${created.name} is ready to build.`,
      });
    }
  }, [createProject, maxProjects, projects.length, toast]);

  const handleRenameProject = useCallback(
    (project: PrismAgentProject) => {
      const nextName = window.prompt('Rename project', project.name);
      if (!nextName || nextName.trim() === project.name) {
        return;
      }

      renameProject(project.id, nextName);
      toast({
        title: 'Project renamed',
        description: `${nextName.trim()} saved.`,
      });
    },
    [renameProject, toast]
  );

  const handleDeleteProject = useCallback(
    (project: PrismAgentProject) => {
      if (!window.confirm(`Delete ${project.name}? This removes its versions locally.`)) {
        return;
      }

      deleteProject(project.id);
      toast({
        title: 'Project deleted',
        description: `${project.name} removed from this device.`,
      });
    },
    [deleteProject, toast]
  );

  const handleRestoreVersion = useCallback(
    (versionId: string) => {
      if (!activeProject) {
        return;
      }

      setActiveVersion(activeProject.id, versionId);
      toast({
        title: 'Version restored',
        description: 'Active preview updated to the selected version.',
      });
    },
    [activeProject, setActiveVersion, toast]
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();

      if (!activeProject) {
        toast({
          title: 'Create a project first',
          description: 'Start by adding a Prism Agent project to capture your builds.',
          variant: 'destructive',
        });
        return;
      }

      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) {
        return;
      }

      setIsProcessing(true);

      const userMessage: PrismAgentMessage = {
        id: uuidv4(),
        role: 'user',
        type: 'user',
        content: trimmedPrompt,
        createdAt: new Date().toISOString(),
        mode,
      };

      addMessage(activeProject.id, userMessage);
      setPrompt('');

      try {
        const activeVersion = activeProject.activeVersionId
          ? activeProject.versions.find((version) => version.id === activeProject.activeVersionId)
          : activeProject.versions[activeProject.versions.length - 1];

        const contextualPrompt = activeVersion
          ? `${trimmedPrompt}\n\nExisting implementation summary:\n${activeVersion.plan?.summary || 'No summary available.'}\nKey features:\n${
              (activeVersion.plan?.features || []).join(', ') || 'None listed'
            }`
          : trimmedPrompt;

        const planResult = await generateCodePlan({
          prompt: contextualPrompt,
          model: MODE_MODEL[mode],
          chatId: `prism-agent-plan-${activeProject.id}`,
          fallbackModels: DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
        });

        const planMessage: PrismAgentMessage = {
          id: uuidv4(),
          role: 'assistant',
          type: 'plan',
          content: planResult.plan.summary,
          createdAt: new Date().toISOString(),
          plan: planResult.plan,
          usedModel: planResult.usedModel,
          mode,
        };

        addMessage(activeProject.id, planMessage);

        const buildResult = await generateWebApp({
          prompt: contextualPrompt,
          model: MODE_MODEL[mode],
          chatId: `prism-agent-build-${activeProject.id}`,
          plan: planResult.plan,
          fallbackModels: DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
        });

        const versionId = uuidv4();
        const createdAt = new Date().toISOString();

        addVersion(activeProject.id, {
          id: versionId,
          prompt: trimmedPrompt,
          createdAt,
          mode,
          plan: planResult.plan,
          app: buildResult.app,
          usedModel: buildResult.usedModel,
          rawResponse: buildResult.rawResponse,
        });

        const resultMessage: PrismAgentMessage = {
          id: uuidv4(),
          role: 'assistant',
          type: 'result',
          content: buildResult.app.description || 'Generated application',
          createdAt,
          result: buildResult.app,
          usedModel: buildResult.usedModel,
          rawResponse: buildResult.rawResponse,
          versionId,
          mode,
        };

        addMessage(activeProject.id, resultMessage);
      } catch (error) {
        console.error('Failed to generate Prism Agent build', error);
        toast({
          title: 'Generation failed',
          description: error instanceof Error ? error.message : 'Unexpected error during build.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      activeProject,
      addMessage,
      addVersion,
      mode,
      prompt,
      toast,
    ]
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Navigation />
        <div className="container mx-auto px-6 pt-32 pb-16 flex flex-col items-center text-center space-y-6">
          <Badge variant="outline" className="text-xs uppercase tracking-wide text-primary border-primary/40">
            Exclusive access required
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Prism Agent is invite-only
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            The Prism Agent is currently limited to early access users. Reach out to the Prism team to request access or check back later.
          </p>
          <Button variant="ghost" asChild>
            <a href="/">Return to homepage</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      {isBooting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <LetterGlitch
              glitchColors={["#111111", "#1a1a1a", "#2a2a2a", "#3a3a3a"]}
              glitchSpeed={80}
              centerVignette={false}
              outerVignette
              smooth
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
          </div>
          <div className="relative z-10 text-center space-y-4">
            <div className="text-sm uppercase tracking-[0.3em] text-primary/60">Prism Agent</div>
            <h2 className="text-3xl md:text-5xl font-semibold text-white">Initializing workspace</h2>
            <p className="text-lg text-white/80 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 animate-spin" /> {STATUS_TEXT[statusIndex]}
            </p>
          </div>
        </div>
      )}

      <div className={`container mx-auto px-6 pt-24 pb-16 transition-opacity duration-500 ${isBooting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Prism Agent
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gemini 2.5 Pro powered coding agent with project history, version control, and VS Code workspace hand-offs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={mode === 'fast' ? 'default' : 'outline'} onClick={() => setMode('fast')} disabled={isProcessing}>
                Fast · Gemini 2.5 Flash
              </Button>
              <Button variant={mode === 'thinking' ? 'default' : 'outline'} onClick={() => setMode('thinking')} disabled={isProcessing}>
                Thinking · Gemini 2.5 Pro
              </Button>
            </div>
          </div>
          <Separator className="bg-border/40" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          <div className="space-y-4">
            <Card className="border border-border/40 bg-background/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FolderPlus className="h-4 w-4 text-primary" /> Projects
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {projects.length} / {maxProjects}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" size="sm" className="w-full" onClick={handleCreateProject} disabled={isProcessing}>
                  <Plus className="mr-2 h-4 w-4" /> New project
                </Button>
                <ScrollArea className="h-72 pr-2">
                  <div className="space-y-2">
                    {projects.map((project) => {
                      const isActive = project.id === activeProjectId;
                      return (
                        <Card
                          key={project.id}
                          className={`border ${isActive ? 'border-primary bg-primary/10' : 'border-border/30 bg-background/60'} transition-colors`}
                        >
                          <CardContent className="p-3 space-y-3">
                            <button
                              className="w-full text-left"
                              onClick={() => selectProject(project.id)}
                              disabled={isProcessing}
                            >
                              <p className="text-sm font-medium text-foreground line-clamp-2">{project.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            </button>
                            <div className="flex items-center justify-between gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleRenameProject(project)} disabled={isProcessing}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project)} disabled={isProcessing}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {projects.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">
                        No projects yet. Create one to start building with Prism Agent.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border border-border/40 bg-background/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" /> Agent console
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[520px] pr-2">
                  <div className="space-y-4">
                    {activeProject && activeProject.messages.length > 0 ? (
                      activeProject.messages.map((message) => {
                        if (message.type === 'user') {
                          return (
                            <div key={message.id} className="flex justify-end">
                              <div className="max-w-xl rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-lg">
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-wide text-primary-foreground/70 text-right">
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          );
                        }

                        if (message.type === 'plan' && message.plan) {
                          return (
                            <PrismAgentPlanCard
                              key={message.id}
                              plan={message.plan}
                              usedModel={message.usedModel}
                              mode={message.mode || 'thinking'}
                              createdAt={message.createdAt}
                            />
                          );
                        }

                        if (message.type === 'result' && message.result) {
                          return (
                            <CodeGenerationBubble
                              key={message.id}
                              result={message.result}
                              prompt={message.content}
                              usedModel={message.usedModel}
                              rawResponse={message.rawResponse}
                            />
                          );
                        }

                        return (
                          <div key={message.id} className="rounded-xl border border-border/30 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                            {message.content}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
                        <Wand2 className="h-8 w-8 text-primary/60" />
                        <p className="text-sm">Start a conversation to generate your first build.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Describe the product you want to build or request updates to the current version..."
                    className="min-h-[120px] resize-none"
                    disabled={isProcessing}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Prism Agent keeps up to 10 projects and all versions locally so you can revisit or roll back anytime.
                    </p>
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? 'Generating...' : 'Generate build'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <PrismAgentRuntimeProvider app={activeVersion?.app}>
              <div className="space-y-4">
                <PrismAgentLivePreview activeVersion={activeVersion} />
                <PrismAgentTerminal activeVersion={activeVersion} />
              </div>
            </PrismAgentRuntimeProvider>
            <PrismAgentVersionHistory
              versions={activeProject?.versions || []}
              activeVersionId={activeProject?.activeVersionId}
              onRestore={handleRestoreVersion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismAgent;

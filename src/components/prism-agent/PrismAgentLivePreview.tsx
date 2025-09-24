import { useCallback, useMemo } from 'react';
import { PrismAgentVersion } from '@/context/PrismAgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Monitor, Power, RefreshCcw, Rocket, Shield, Square } from 'lucide-react';
import { usePrismAgentRuntime } from '@/context/PrismAgentRuntimeContext';

interface PrismAgentLivePreviewProps {
  activeVersion?: PrismAgentVersion;
}

const statusBadgeVariant = (previewRuntime: string | null, previewUrl: string | null) => {
  if (previewRuntime && previewUrl) {
    return 'default' as const;
  }
  if (previewRuntime) {
    return 'secondary' as const;
  }
  return 'outline' as const;
};

const PrismAgentLivePreview = ({ activeVersion }: PrismAgentLivePreviewProps) => {
  const {
    runtime,
    previewUrl,
    pythonPreviewHtml,
    previewRuntime,
    startPreview,
    stopPreview,
    restartPreview,
    isStartingPreview,
    statusMessage,
    runtimeReady,
    isSyncing,
  } = usePrismAgentRuntime();

  const activeApp = activeVersion?.app;

  const runtimeLabel = useMemo(() => {
    const resolved = previewRuntime ?? runtime;
    return resolved === 'python' ? 'Python sandbox' : 'Node.js WebContainer';
  }, [previewRuntime, runtime]);

  const hasRunningPreview = Boolean(previewUrl);
  const canShowFallback = !previewUrl && Boolean(pythonPreviewHtml);

  const handleStart = useCallback(() => {
    if (!activeApp) return;
    void startPreview(activeApp);
  }, [activeApp, startPreview]);

  const handleRestart = useCallback(() => {
    if (!activeApp) return;
    void restartPreview(activeApp);
  }, [activeApp, restartPreview]);

  const handleStop = useCallback(() => {
    void stopPreview();
  }, [stopPreview]);

  return (
    <Card className="border border-border/40 bg-background/70 backdrop-blur">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Monitor className="h-4 w-4 text-primary" /> Live runtime preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant(previewRuntime, previewUrl)} className="text-[10px] uppercase tracking-wide">
              {hasRunningPreview ? 'Running' : runtimeReady ? 'Ready' : 'Offline'} · {runtimeLabel}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Launch a secure sandbox that runs your backend in the browser. Preview sessions are isolated per project and stream
          real-time logs back into the terminal.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activeApp ? (
          <div className="rounded-lg border border-dashed border-border/40 bg-background/40 p-6 text-center text-sm text-muted-foreground">
            Generate a build to unlock the live runtime preview and backend orchestration tools.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={handleStart}
                disabled={isStartingPreview || isSyncing}
              >
                {isStartingPreview ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {hasRunningPreview ? 'Reconnect preview' : 'Launch preview'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleRestart}
                disabled={isStartingPreview || isSyncing}
              >
                <Power className="h-4 w-4" /> Restart
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleStop}
                disabled={isStartingPreview}
              >
                <Square className="h-4 w-4" /> Stop
              </Button>
              {previewUrl && (
                <Button size="sm" variant="ghost" className="text-xs" asChild>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                  </a>
                </Button>
              )}
            </div>

            <Alert className="border-primary/30 bg-primary/10 text-primary-foreground/80">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs leading-relaxed">
                {statusMessage}
                {!hasRunningPreview && !isStartingPreview && runtimeReady && (
                  <div className="mt-2 text-muted-foreground">
                    Use the terminal to install dependencies before launching the preview if required.
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {previewUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Secure sandbox preview</span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {runtimeLabel}
                  </Badge>
                </div>
                <div className="aspect-video overflow-hidden rounded-lg border border-border/40 bg-background/60">
                  <iframe src={previewUrl} title="Live runtime preview" className="h-full w-full border-0 bg-white" />
                </div>
              </div>
            ) : canShowFallback && pythonPreviewHtml ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Generated HTML preview</span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    Python render
                  </Badge>
                </div>
                <div className="aspect-video overflow-hidden rounded-lg border border-border/40 bg-background/60">
                  <iframe srcDoc={pythonPreviewHtml} title="Python preview" className="h-full w-full border-0 bg-white" />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/30 bg-background/60 p-6 text-center text-xs text-muted-foreground">
                Launch the preview to boot your backend and stream live output into the sandboxed environment.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PrismAgentLivePreview;

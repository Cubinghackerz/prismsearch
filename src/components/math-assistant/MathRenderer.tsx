
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RefreshCw } from 'lucide-react';
import { mathJaxService } from '../../services/mathJaxService';
import { Button } from '../ui/button';

interface MathRendererProps {
  content: string;
  className?: string;
  enableManualFormat?: boolean;
}

const hasMathSyntax = (value: string): boolean => {
  if (!value) {
    return false;
  }

  return /\$[^$]+\$|\\\(|\\\)|\\\[|\\\]|\\begin\{|\\end\{|∑|∫|√|∞|≈|≅|≥|≤/.test(value);
};

const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  enableManualFormat = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const shouldShowFormatter = useMemo(() => enableManualFormat && hasMathSyntax(content), [
    enableManualFormat,
    content,
  ]);

  useEffect(() => {
    const element = containerRef.current;
    let isMounted = true;

    if (!element) {
      return;
    }

    mathJaxService
      .watchElement(element)
      .then((cleanup) => {
        if (!isMounted) {
          cleanup();
          return;
        }
        cleanupRef.current = cleanup;
      })
      .catch((error) => {
        console.warn('MathJax watcher error:', error);
      });

    return () => {
      isMounted = false;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    let cancelled = false;

    if (!element) {
      return;
    }

    setIsRendering(true);
    setLastError(null);

    mathJaxService
      .renderMath(element)
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setLastError('We had trouble formatting this math automatically. Try the manual formatter.');
        console.warn('MathJax render error:', error);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setIsRendering(false);
      });

    return () => {
      cancelled = true;
    };
  }, [content]);

  const handleManualFormat = async () => {
    if (!containerRef.current) {
      return;
    }

    setIsRendering(true);
    setLastError(null);

    try {
      await mathJaxService.forceRender(containerRef.current);
    } catch (error) {
      console.error('Manual MathJax format failed:', error);
      setLastError('Still having trouble rendering the math. Please copy the expression into a dedicated math tool.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="relative">
      {shouldShowFormatter && (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-2 text-xs">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1 rounded-full px-2 text-xs"
            onClick={handleManualFormat}
            disabled={isRendering}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRendering ? 'animate-spin' : ''}`} />
            Reformat math
          </Button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`math-content ${className}`}
        style={{
          fontSize: '14px',
          lineHeight: '1.5',
          wordWrap: 'break-word',
        }}
      >
        <ReactMarkdown
          components={{
            strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />,
            em: ({ node, ...props }) => <span className="italic text-foreground" {...props} />,
            h1: ({ node, ...props }) => <h1 className="mt-4 mb-2 text-lg font-semibold text-foreground" {...props} />,
            h2: ({ node, ...props }) => <h2 className="mt-3 mb-2 text-md font-semibold text-foreground" {...props} />,
            h3: ({ node, ...props }) => <h3 className="mt-3 mb-1 text-sm font-semibold text-foreground" {...props} />,
            p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-foreground" {...props} />,
            ul: ({ node, ...props }) => <ul className="mt-2 mb-4 list-disc space-y-2 pl-6" {...props} />,
            ol: ({ node, ...props }) => <ol className="mt-2 mb-4 list-decimal space-y-2 pl-6" {...props} />,
            li: ({ node, ...props }) => <li className="text-foreground" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-blue-500 hover:text-blue-600 hover:underline" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="rounded bg-muted px-2 py-1 font-mono text-sm" {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre className="my-4 overflow-x-auto rounded-lg border border-border/50 bg-muted p-4" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {lastError && (
        <div className="mt-2 rounded-md border border-amber-400/60 bg-amber-500/10 p-2 text-[0.7rem] text-amber-600 dark:text-amber-400">
          {lastError}
        </div>
      )}
    </div>
  );
};

export default MathRenderer;

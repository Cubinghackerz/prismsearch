import React, { FormEvent, useMemo, useRef, useState } from 'react';
import { useMathEngine } from '@/context/MathEngineContext';
import MathRenderer from '@/components/math-assistant/MathRenderer';
import GraphCommandBubble from '@/components/chat/GraphCommandBubble';
import SurfaceGraphBubble from '@/components/math-engine/SurfaceGraphBubble';
import EquationKeyboard, { MathEngineCommand } from '@/components/math-engine/EquationKeyboard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';

const COMMAND_OPTIONS: { value: MathEngineCommand; label: string; helper: string }[] = [
  { value: 'factorise', label: '/factorise', helper: 'Factorise algebraic expressions' },
  { value: 'expand', label: '/expand', helper: 'Expand and simplify expressions' },
  { value: 'graph2D', label: '/graph2D', helper: 'Plot functions on a 2D cartesian plane' },
  { value: 'graph3D', label: '/graph3D', helper: 'Render 3D surfaces and vector fields' },
  { value: 'freeform', label: 'Ask anything', helper: 'Let Math Engine choose the right method' },
];

const MathEngineChat: React.FC = () => {
  const {
    messages,
    isProcessing,
    executeCommand,
    mode,
    setMode,
    resetConversation,
    hasHistory,
  } = useMathEngine();

  const [command, setCommand] = useState<MathEngineCommand>('factorise');
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      return;
    }

    await executeCommand({ command, prompt: inputValue.trim() });
    setInputValue('');
    textareaRef.current?.focus();
  };

  const handleInsert = (value: string) => {
    const element = textareaRef.current;
    if (!element) {
      setInputValue((prev) => prev + value);
      return;
    }

    const { selectionStart, selectionEnd } = element;
    const before = inputValue.slice(0, selectionStart);
    const after = inputValue.slice(selectionEnd);
    const updated = `${before}${value}${after}`;
    setInputValue(updated);

    requestAnimationFrame(() => {
      const caretPosition = selectionStart + value.length;
      element.setSelectionRange(caretPosition, caretPosition);
      element.focus();
    });
  };

  const handleBackspace = () => {
    const element = textareaRef.current;
    if (!element) {
      setInputValue((prev) => prev.slice(0, -1));
      return;
    }

    const { selectionStart, selectionEnd } = element;
    if (selectionStart === selectionEnd) {
      const before = inputValue.slice(0, Math.max(selectionStart - 1, 0));
      const after = inputValue.slice(selectionEnd);
      const updated = `${before}${after}`;
      setInputValue(updated);
      requestAnimationFrame(() => {
        const caretPosition = Math.max(selectionStart - 1, 0);
        element.setSelectionRange(caretPosition, caretPosition);
        element.focus();
      });
      return;
    }

    const before = inputValue.slice(0, selectionStart);
    const after = inputValue.slice(selectionEnd);
    setInputValue(`${before}${after}`);
    requestAnimationFrame(() => {
      element.setSelectionRange(selectionStart, selectionStart);
      element.focus();
    });
  };

  const handleClear = () => {
    setInputValue('');
    textareaRef.current?.focus();
  };

  const modeHelper = useMemo(() => {
    if (mode === 'fast') {
      return 'Fast mode prioritises quick answers with minimal derivation.';
    }
    return 'Thinking mode slows down for fuller working and additional checks.';
  }, [mode]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Command</span>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Gemini 2.5 Pro {mode === 'fast' ? 'Flash' : 'Pro'}
            </Badge>
          </div>
          <Select value={command} onValueChange={(value) => setCommand(value as MathEngineCommand)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a command" />
            </SelectTrigger>
            <SelectContent>
              {COMMAND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.helper}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mode</div>
          <Select value={mode} onValueChange={(value) => setMode(value as 'fast' | 'thinking')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">Fast (Gemini 2.5 Flash)</SelectItem>
              <SelectItem value="thinking">Thinking (Gemini 2.5 Pro)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[0.7rem] text-muted-foreground">{modeHelper}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-border/70 bg-background/80">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2">
            <div className="text-sm font-semibold text-foreground/90">Local conversation</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Stored privately on this device</span>
              {hasHistory && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={resetConversation}>
                  Clear history
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {messages.map((message) => {
              if (message.role === 'assistant' && message.result?.kind === 'graph2d') {
                return (
                  <div key={message.id} className="flex flex-col gap-3">
                    <Badge variant="secondary" className="self-start bg-primary/10 text-primary">
                      Math Engine
                    </Badge>
                    <GraphCommandBubble summary={message.result.summary} result={message.result.payload} />
                  </div>
                );
              }

              if (message.role === 'assistant' && message.result?.kind === 'graph3d') {
                return (
                  <div key={message.id} className="flex flex-col gap-3">
                    <Badge variant="secondary" className="self-start bg-primary/10 text-primary">
                      Math Engine
                    </Badge>
                    <SurfaceGraphBubble summary={message.result.summary} result={message.result.payload} />
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={cn('flex flex-col gap-3', message.role === 'user' ? 'items-end' : 'items-start')}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      'bg-muted/60 text-xs font-medium uppercase tracking-wide',
                      message.role === 'user' ? 'self-end text-foreground' : 'self-start bg-primary/10 text-primary'
                    )}
                  >
                    {message.role === 'user' ? 'You' : 'Math Engine'}
                  </Badge>
                  <div
                    className={cn(
                      'max-w-full rounded-2xl border px-4 py-3 text-sm shadow-sm md:max-w-3xl',
                      message.role === 'user'
                        ? 'border-primary/40 bg-primary/10 text-primary-foreground'
                        : 'border-border/70 bg-background/80 text-foreground'
                    )}
                  >
                    <MathRenderer content={message.content} enableManualFormat className="text-sm" />
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Math Engine is working...
              </div>
            )}

            {!messages.length && !isProcessing && (
              <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-6 text-sm text-muted-foreground">
                Ask Math Engine to factorise, expand, or graph expressions. Conversations stay on-device, and Gemini 2.5 adapts
                to your chosen mode.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 border-t border-border/60 bg-muted/30 px-6 py-4">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={COMMAND_OPTIONS.find((option) => option.value === command)?.helper ?? 'Enter a prompt'}
              className="h-28 w-full resize-none rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Use the keyboard below for quick symbols. Press Shift+Enter for a new line.
              </span>
              <Button type="submit" disabled={isProcessing} className="gap-2">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>

      <EquationKeyboard
        command={command}
        onInsert={handleInsert}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />
    </div>
  );
};

export default MathEngineChat;

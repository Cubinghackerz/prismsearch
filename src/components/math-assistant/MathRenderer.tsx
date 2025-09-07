
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { mathJaxService } from '../../services/mathJaxService';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMath = async () => {
      if (containerRef.current) {
        // Small delay to ensure markdown is rendered first
        setTimeout(async () => {
          if (containerRef.current) {
            await mathJaxService.renderMath(containerRef.current);
          }
        }, 50);
      }
    };

    renderMath();
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`math-content ${className}`}
      style={{ 
        fontSize: '14px', 
        lineHeight: '1.5',
        wordWrap: 'break-word'
      }}
    >
      <ReactMarkdown 
        components={{
          strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />,
          em: ({ node, ...props }) => <span className="italic text-foreground" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-md font-semibold mt-3 mb-2 text-foreground" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mt-3 mb-1 text-foreground" {...props} />,
          p: ({ node, ...props }) => <p className="mb-3 text-foreground leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 mt-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 mt-2" {...props} />,
          li: ({ node, ...props }) => <li className="text-foreground" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-500 hover:text-blue-600 hover:underline" {...props} />,
          code: ({ node, ...props }) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props} />,
          pre: ({ node, ...props }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border border-border/50" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MathRenderer;

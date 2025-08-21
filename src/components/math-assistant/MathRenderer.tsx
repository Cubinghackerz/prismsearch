
import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined' && window.MathJax) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create a new div for the math content
      const mathDiv = document.createElement('div');
      mathDiv.innerHTML = content;
      containerRef.current.appendChild(mathDiv);
      
      // Process with MathJax
      window.MathJax.typesetPromise([mathDiv]).catch((err: any) => {
        console.log('MathJax rendering error:', err);
      });
    } else {
      // Fallback if MathJax is not available
      if (containerRef.current) {
        containerRef.current.innerHTML = content;
      }
    }
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`math-content ${className}`}
      style={{ 
        fontSize: '14px', 
        lineHeight: '1.5',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    />
  );
};

export default MathRenderer;

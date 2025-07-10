import React from 'react';
import { cn } from '@/lib/utils';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export function SearchHighlight({ text, searchTerm, className }: SearchHighlightProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
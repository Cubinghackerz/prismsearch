
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: string;
  action: () => void;
  icon?: React.ComponentType;
}

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const commands: Command[] = [
    {
      id: 'deep-search',
      label: 'Open Deep Search',
      category: 'Navigation',
      action: () => navigate('/deep-search'),
    },
    {
      id: 'vault',
      label: 'Open Vault',
      category: 'Navigation',
      action: () => navigate('/vault'),
    },
    {
      id: 'math',
      label: 'Open Math Assistant',
      category: 'Navigation',
      action: () => navigate('/math'),
    },
    {
      id: 'physics',
      label: 'Open Physics Assistant',
      category: 'Navigation',
      action: () => navigate('/physics'),
    },
    {
      id: 'chemistry',
      label: 'Open Chemistry Lab',
      category: 'Navigation',
      action: () => navigate('/chemistry'),
    },
    {
      id: 'code',
      label: 'Open Code Editor',
      category: 'Navigation',
      action: () => navigate('/code'),
    },
    {
      id: 'graphing',
      label: 'Open Graphing Tool',
      category: 'Navigation',
      action: () => navigate('/graphing'),
    },
    {
      id: 'docs',
      label: 'Open Documents',
      category: 'Navigation',
      action: () => navigate('/docs'),
    },
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const executeCommand = (command: Command) => {
    command.action();
    setIsOpen(false);
    setSearchTerm('');
  };

  return {
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    filteredCommands,
    executeCommand,
  };
};

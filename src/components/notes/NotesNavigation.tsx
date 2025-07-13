
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Palette } from 'lucide-react';

interface NotesNavigationProps {
  activeView: 'notes' | 'whiteboard';
  setActiveView: (view: 'notes' | 'whiteboard') => void;
  theme: any;
}

const NotesNavigation = ({ activeView, setActiveView, theme }: NotesNavigationProps) => {
  return (
    <div className={`${theme.cardBg} ${theme.border} border-b px-6 py-3`}>
      <div className="flex space-x-2">
        <Button
          onClick={() => setActiveView('notes')}
          variant={activeView === 'notes' ? 'default' : 'ghost'}
          size="sm"
          className={activeView === 'notes' ? `${theme.accent} text-white` : theme.text}
        >
          <FileText className="w-4 h-4 mr-2" />
          Notes
        </Button>
        <Button
          onClick={() => setActiveView('whiteboard')}
          variant={activeView === 'whiteboard' ? 'default' : 'ghost'}
          size="sm"
          className={activeView === 'whiteboard' ? `${theme.accent} text-white` : theme.text}
        >
          <Palette className="w-4 h-4 mr-2" />
          Whiteboard
        </Button>
      </div>
    </div>
  );
};

export default NotesNavigation;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Moon, Sun, FileText, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NoteEditor from '@/components/notes/NoteEditor';
import WhiteboardCanvas from '@/components/notes/WhiteboardCanvas';
import ReminderDialog from '@/components/notes/ReminderDialog';
import NotesNavigation from '@/components/notes/NotesNavigation';
import { encryptText, decryptText } from '@/utils/encryption';

interface Note {
  id: string;
  title: string;
  content_encrypted: string;
  topic_tags: string[];
  linked_notes: string[];
  whiteboard_data: any;
  created_at: string;
  updated_at: string;
}

interface Reminder {
  id: string;
  note_id: string;
  title: string;
  description: string;
  reminder_time: string;
  is_completed: boolean;
  created_at: string;
}

const PrismNotes = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'notes' | 'whiteboard'>('notes');
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const queryClient = useQueryClient();

  // Theme classes based on your specifications
  const themeClasses = {
    light: {
      bg: 'bg-[#FAFAFA]',
      cardBg: 'bg-white',
      text: 'text-[#212121]',
      textMuted: 'text-[#9E9E9E]',
      accent: 'bg-[#3F51B5] hover:bg-[#303F9F]',
      border: 'border-[#E0E0E0]',
      highlight: 'bg-[#FFF9C4]'
    },
    dark: {
      bg: 'bg-[#121212]',
      cardBg: 'bg-[#1E1E1E]',
      text: 'text-[#E0E0E0]',
      textMuted: 'text-[#9E9E9E]',
      accent: 'bg-[#82B1FF] hover:bg-[#536DFE]',
      border: 'border-[#2C2C2C]',
      highlight: 'bg-[#1A237E]'
    }
  };

  const theme = isDarkMode ? themeClasses.dark : themeClasses.light;

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    }
  });

  // Fetch reminders
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_completed', false)
        .order('reminder_time', { ascending: true });
      
      if (error) throw error;
      return data as Reminder[];
    }
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: { title: string; content: string; tags: string[]; whiteboardData?: any }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const encryptedContent = await encryptText(noteData.content);
      
      // Find similar notes for linking
      const { data: similarNotes } = await supabase.rpc('find_similar_notes', {
        note_tags: noteData.tags,
        current_note_id: '00000000-0000-0000-0000-000000000000', // Placeholder for new note
        user_id_param: user.data.user.id
      });

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content_encrypted: encryptedContent,
          topic_tags: noteData.tags,
          linked_notes: similarNotes || [],
          whiteboard_data: noteData.whiteboardData,
          user_id: user.data.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully!');
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create note: ${error.message}`);
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (noteData: { id: string; title: string; content: string; tags: string[]; whiteboardData?: any }) => {
      const encryptedContent = await encryptText(noteData.content);
      
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          content_encrypted: encryptedContent,
          topic_tags: noteData.tags,
          whiteboard_data: noteData.whiteboardData,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update note: ${error.message}`);
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully!');
      setSelectedNote(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    }
  });

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.topic_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNote = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setActiveView('notes');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${theme.cardBg} ${theme.border} border-b px-6 py-4`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Prism Notes</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notes and tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 w-64 ${theme.cardBg} ${theme.border} ${theme.text}`}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowReminderDialog(true)}
              variant="outline"
              size="sm"
              className={`${theme.border} ${theme.text}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Reminders ({reminders.length})
            </Button>
            
            <Button
              onClick={handleCreateNote}
              className={`${theme.accent} text-white`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
            
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="sm"
              className={theme.text}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className={`w-80 ${theme.cardBg} ${theme.border} border-r h-screen overflow-y-auto`}>
          <div className="p-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-16 ${theme.highlight} rounded animate-pulse`} />
                  ))}
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className={`w-12 h-12 mx-auto mb-4 ${theme.textMuted}`} />
                  <p className={theme.textMuted}>
                    {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedNote?.id === note.id ? theme.highlight : theme.cardBg
                    } ${theme.border}`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-sm ${theme.text} truncate`}>
                        {note.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.topic_tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${theme.highlight} ${theme.text}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className={`text-xs ${theme.textMuted}`}>
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {(selectedNote || isCreating) ? (
            <div className="h-screen">
              <NotesNavigation
                activeView={activeView}
                setActiveView={setActiveView}
                theme={theme}
              />
              
              {activeView === 'notes' ? (
                <NoteEditor
                  note={selectedNote}
                  isCreating={isCreating}
                  onSave={(noteData) => {
                    if (isCreating) {
                      createNoteMutation.mutate(noteData);
                    } else if (selectedNote) {
                      updateNoteMutation.mutate({ ...noteData, id: selectedNote.id });
                    }
                  }}
                  onDelete={() => {
                    if (selectedNote) {
                      deleteNoteMutation.mutate(selectedNote.id);
                    }
                  }}
                  theme={theme}
                />
              ) : (
                <WhiteboardCanvas
                  note={selectedNote}
                  onSave={(whiteboardData) => {
                    if (selectedNote) {
                      updateNoteMutation.mutate({
                        id: selectedNote.id,
                        title: selectedNote.title,
                        content: '', // Keep existing content
                        tags: selectedNote.topic_tags,
                        whiteboardData
                      });
                    }
                  }}
                  theme={theme}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <FileText className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted}`} />
                <h2 className={`text-xl font-semibold mb-2 ${theme.text}`}>
                  Welcome to Prism Notes
                </h2>
                <p className={`${theme.textMuted} mb-6`}>
                  Select a note to edit or create a new one to get started
                </p>
                <Button
                  onClick={handleCreateNote}
                  className={`${theme.accent} text-white`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Dialog */}
      <ReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        selectedNote={selectedNote}
        theme={theme}
      />
    </div>
  );
};

export default PrismNotes;

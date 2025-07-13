import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Plus, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNote: Note | null;
  theme: any;
}

const ReminderDialog = ({ open, onOpenChange, selectedNote, theme }: ReminderDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const queryClient = useQueryClient();

  // Fetch reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('reminder_time', { ascending: true });
      
      if (error) throw error;
      return data as Reminder[];
    },
    enabled: open
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: { title: string; description: string; reminderTime: string; noteId?: string }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          title: reminderData.title,
          description: reminderData.description,
          reminder_time: reminderData.reminderTime,
          note_id: reminderData.noteId,
          user_id: user.data.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created successfully!');
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setReminderTime('');
    },
    onError: (error) => {
      toast.error(`Failed to create reminder: ${error.message}`);
    }
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder completed!');
    },
    onError: (error) => {
      toast.error(`Failed to complete reminder: ${error.message}`);
    }
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted!');
    },
    onError: (error) => {
      toast.error(`Failed to delete reminder: ${error.message}`);
    }
  });

  const handleCreateReminder = () => {
    if (title.trim() && reminderTime) {
      createReminderMutation.mutate({
        title: title.trim(),
        description: description.trim(),
        reminderTime,
        noteId: selectedNote?.id
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const isOverdue = (reminderTime: string) => {
    return new Date(reminderTime) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${theme.cardBg} ${theme.text}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Reminders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new reminder */}
          {!isCreating ? (
            <Button
              onClick={() => setIsCreating(true)}
              className={`w-full ${theme.accent} text-white`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Reminder
            </Button>
          ) : (
            <div className={`p-4 border rounded-lg ${theme.border} space-y-3`}>
              <div>
                <Label htmlFor="reminder-title">Title</Label>
                <Input
                  id="reminder-title"
                  placeholder="Reminder title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${theme.cardBg} ${theme.border} ${theme.text}`}
                />
              </div>
              
              <div>
                <Label htmlFor="reminder-description">Description</Label>
                <Textarea
                  id="reminder-description"
                  placeholder="Optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${theme.cardBg} ${theme.border} ${theme.text}`}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="reminder-time">Date & Time</Label>
                <Input
                  id="reminder-time"
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className={`${theme.cardBg} ${theme.border} ${theme.text}`}
                />
              </div>
              
              {selectedNote && (
                <div className={`text-sm ${theme.textMuted}`}>
                  📎 This reminder will be linked to: {selectedNote.title}
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateReminder}
                  disabled={!title.trim() || !reminderTime}
                  className={`${theme.accent} text-white`}
                >
                  Create Reminder
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setTitle('');
                    setDescription('');
                    setReminderTime('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing reminders */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Loading reminders...</div>
            ) : reminders.length === 0 ? (
              <div className={`text-center py-8 ${theme.textMuted}`}>
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No reminders yet. Create your first reminder!</p>
              </div>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-3 border rounded-lg ${theme.border} ${
                    reminder.is_completed ? 'opacity-50' : ''
                  } ${isOverdue(reminder.reminder_time) && !reminder.is_completed ? 'border-red-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${reminder.is_completed ? 'line-through' : ''}`}>
                        {reminder.title}
                      </h4>
                      {reminder.description && (
                        <p className={`text-sm ${theme.textMuted} mt-1`}>
                          {reminder.description}
                        </p>
                      )}
                      <div className={`text-xs ${theme.textMuted} mt-2 flex items-center`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDateTime(reminder.reminder_time)}
                        {isOverdue(reminder.reminder_time) && !reminder.is_completed && (
                          <span className="ml-2 text-red-500 font-medium">Overdue</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      {!reminder.is_completed && (
                        <Button
                          onClick={() => completeReminderMutation.mutate(reminder.id)}
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteReminderMutation.mutate(reminder.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDialog;

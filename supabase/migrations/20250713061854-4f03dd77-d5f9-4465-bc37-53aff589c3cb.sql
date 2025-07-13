
-- Create table for encrypted notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content_encrypted TEXT NOT NULL,
  topic_tags TEXT[],
  linked_notes UUID[],
  whiteboard_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for reminders
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" 
  ON public.notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
  ON public.notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.notes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for reminders
CREATE POLICY "Users can view their own reminders" 
  ON public.reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON public.reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON public.reminders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
  ON public.reminders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to find similar notes based on topic tags
CREATE OR REPLACE FUNCTION find_similar_notes(note_tags TEXT[], current_note_id UUID, user_id_param UUID)
RETURNS UUID[]
LANGUAGE plpgsql
AS $$
DECLARE
  similar_note_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id) INTO similar_note_ids
  FROM notes
  WHERE user_id = user_id_param 
    AND id != current_note_id
    AND topic_tags && note_tags  -- Arrays overlap
  LIMIT 5;
  
  RETURN COALESCE(similar_note_ids, ARRAY[]::UUID[]);
END;
$$;

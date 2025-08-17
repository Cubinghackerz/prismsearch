
-- Create the prism_projects table for storing user projects
CREATE TABLE IF NOT EXISTS public.prism_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  files JSONB NOT NULL DEFAULT '{}',
  packages JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prism_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own projects" ON public.prism_projects
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own projects" ON public.prism_projects
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own projects" ON public.prism_projects
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own projects" ON public.prism_projects
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_prism_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prism_projects_updated_at
  BEFORE UPDATE ON public.prism_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_prism_projects_updated_at();

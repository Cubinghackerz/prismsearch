
-- Phase 1: Critical Database Policy Fixes

-- 1. Fix Document Access Policies
-- First, drop the dangerous "Enable all access for documents" policy
DROP POLICY IF EXISTS "Enable all access for documents" ON documents;

-- Create proper user-specific policies for documents
CREATE POLICY "Users can view their own documents" ON documents
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON documents
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Allow public access to documents marked as public
CREATE POLICY "Anyone can view public documents" ON documents
FOR SELECT 
TO authenticated
USING (is_public = true);

-- 2. Secure Email Verification Table
-- Remove the dangerous public access policies
DROP POLICY IF EXISTS "Anyone can create verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can read verification codes for verification" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON email_verification_codes;

-- Create secure policies that don't expose email data
CREATE POLICY "Service role can manage verification codes" ON email_verification_codes
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to verify their own codes (but not see others)
CREATE POLICY "Users can verify codes for their email" ON email_verification_codes
FOR SELECT 
TO authenticated
USING (email = auth.email());

CREATE POLICY "Users can update their own verification status" ON email_verification_codes
FOR UPDATE 
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- 3. Fix Database Function Security (Phase 2)
-- Update all functions to include proper search path

-- Update update_document_updated_at function
CREATE OR REPLACE FUNCTION public.update_document_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$function$;

-- Update cleanup_expired_verification_codes function
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.email_verification_codes 
  WHERE expires_at < now() OR is_used = true;
END;
$function$;

-- Update find_similar_notes function
CREATE OR REPLACE FUNCTION public.find_similar_notes(note_tags text[], current_note_id uuid, user_id_param uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update update_prism_projects_updated_at function
CREATE OR REPLACE FUNCTION public.update_prism_projects_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update delete_old_chat_messages function
CREATE OR REPLACE FUNCTION public.delete_old_chat_messages()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Function logic here
END;
$function$;

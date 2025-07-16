import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type StoredPasswordRow = Database['public']['Tables']['stored_passwords']['Row'];
export type InsertPassword = Database['public']['Tables']['stored_passwords']['Insert'];
export type UpdatePassword = Database['public']['Tables']['stored_passwords']['Update'];

export const passwordVaultService = {
  async list(userId: string) {
    const { data, error } = await supabase
      .from('stored_passwords')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as StoredPasswordRow[];
  },

  async add(password: InsertPassword) {
    const { data, error } = await supabase
      .from('stored_passwords')
      .insert(password)
      .single();
    if (error) throw error;
    return data as StoredPasswordRow;
  },

  async update(id: string, updates: UpdatePassword) {
    const { data, error } = await supabase
      .from('stored_passwords')
      .update(updates)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as StoredPasswordRow;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('stored_passwords')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export default passwordVaultService;

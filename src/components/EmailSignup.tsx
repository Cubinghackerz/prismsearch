import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from('email_signups').insert({ email });
    if (error) {
      toast({ title: 'Error', description: error.message || 'Signup failed', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Thanks for signing up!' });
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mb-6 flex gap-2">
      <Input
        type="email"
        placeholder="Join our mailing list"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        className="bg-background border-border"
      />
      <Button type="submit" disabled={loading} className="shrink-0">
        {loading ? 'Signing up...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default EmailSignup;

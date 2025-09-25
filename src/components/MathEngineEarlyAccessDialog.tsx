import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Rocket } from 'lucide-react';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const MathEngineEarlyAccessDialog = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!EXCLUSIVE_USER_IDS.has(user.id)) {
      return;
    }

    const storageKey = `math-engine-early-access-${user.id}`;
    const hasSeen = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : 'true';

    if (hasSeen) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(storageKey, 'true');
    }, 1200);

    return () => clearTimeout(timer);
  }, [user]);

  const handleNavigate = () => {
    setIsOpen(false);
    navigate('/math-engine');
  };

  if (!user || !EXCLUSIVE_USER_IDS.has(user.id)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-background via-background to-background/90 border border-primary/20 backdrop-blur">
        <DialogHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse-slow">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <Badge className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground">Exclusive</Badge>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            You have unlocked early access to the Math Engine
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Signed Nirneet — enjoy unlimited access to our Gemini 2.5 Pro math workspace with CAS tooling, graphing, and step-by-step reasoning.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button onClick={handleNavigate} className="w-full">
            <Rocket className="mr-2 h-4 w-4" /> Launch Math Engine
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="w-full">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MathEngineEarlyAccessDialog;

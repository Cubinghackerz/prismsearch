
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, Shield, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  if (!user) return null;

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-prism-primary/20">
            <AvatarImage 
              src={profile?.avatar_url || user.user_metadata?.avatar_url} 
              alt={displayName} 
            />
            <AvatarFallback className="bg-prism-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-prism-surface border-prism-border" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-prism-text">{displayName}</p>
            <p className="text-xs text-prism-text-muted">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-prism-border" />
        
        <DropdownMenuItem 
          onClick={() => navigate('/vault')}
          className="text-prism-text hover:bg-prism-primary/10"
        >
          <Shield className="mr-2 h-4 w-4" />
          Prism Vault
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-prism-text hover:bg-prism-primary/10">
          <Cloud className="mr-2 h-4 w-4" />
          Sync Status: Connected
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-prism-text hover:bg-prism-primary/10">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-prism-border" />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-400 hover:bg-red-950/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

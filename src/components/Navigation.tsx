
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { FileText, Shield, Search, MessageCircle, Vault, RefreshCw, Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              Prism
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link to="/search">
              <Button 
                variant={isActive('/search') ? 'secondary' : 'ghost'} 
                size="sm"
                className="font-fira-code"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </Link>
            
            <Link to="/chat">
              <Button 
                variant={isActive('/chat') ? 'secondary' : 'ghost'} 
                size="sm"
                className="font-fira-code"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>

            <Link to="/docs">
              <Button 
                variant={isActive('/docs') ? 'secondary' : 'ghost'} 
                size="sm"
                className="font-fira-code"
              >
                <FileText className="h-4 w-4 mr-2" />
                Pages
              </Button>
            </Link>
            
            <Link to="/vault">
              <Button 
                variant={isActive('/vault') ? 'secondary' : 'ghost'} 
                size="sm"
                className="font-fira-code"
              >
                <Vault className="h-4 w-4 mr-2" />
                Vault
              </Button>
            </Link>
            
            <Link to="/conversions">
              <Button 
                variant={isActive('/conversions') ? 'secondary' : 'ghost'} 
                size="sm"
                className="font-fira-code"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Convert
              </Button>
            </Link>
            
            <Link to="/detector">
              <Button 
                variant={isActive('/detector') ? 'secondary' : 'ghost'} 
                size="sm"
                className="font-fira-code"
              >
                <Shield className="h-4 w-4 mr-2" />
                Detector
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="font-fira-code">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

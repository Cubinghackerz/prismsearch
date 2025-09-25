import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, MessageSquare, Shield, Calculator, Code2, Atom, Beaker, Zap, MoreHorizontal, Search, RefreshCw, ShieldCheck, TrendingUp, NotebookPen, Bot } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButtons from '@/components/AuthButtons';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

type NavItem = {
  name: string;
  href: string;
  icon: typeof Menu;
  exclusive?: boolean;
  requiresAccess?: boolean;
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { toast } = useToast();

  const isChatPage = location.pathname === '/chat';

  const hasAgentAccess = user ? EXCLUSIVE_USER_IDS.has(user.id) : false;

  const primaryNavItems: NavItem[] = [
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Deep Search', href: '/deep-search', icon: Search },
    { name: 'Vault', href: '/vault', icon: Shield },
    { name: 'Math', href: '/math', icon: Calculator },
  ];

  const moreNavItems: NavItem[] = [
    { name: 'Physics', href: '/physics', icon: Atom },
    { name: 'Chemistry', href: '/chemistry', icon: Beaker },
    { name: 'Graphing', href: '/graphing', icon: Zap },
    { name: 'Code', href: '/code', icon: Code2 },
    { name: 'Research Preview', href: '/research', icon: NotebookPen },
    { name: 'File Converter', href: '/conversions', icon: RefreshCw },
    { name: 'Threat Detector', href: '/detector', icon: ShieldCheck },
    { name: 'Finance', href: '/finance', icon: TrendingUp },
    { name: 'Math Engine', href: '/math-engine', icon: Bot, exclusive: true, requiresAccess: true },
  ];

  const allNavItems = [...primaryNavItems, ...moreNavItems];

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: NavItem
  ) => {
    if ('requiresAccess' in item && item.requiresAccess && !hasAgentAccess) {
      event.preventDefault();
      toast({
        title: 'Exclusive feature',
        description: 'Math Engine is currently limited to early access members.',
      });
      return;
    }

    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border transition-transform duration-300 ${
      isChatPage ? 'transform -translate-y-full hover:translate-y-0' : ''
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
              alt="Prism Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Prism
            </span>
          </Link>

          {/* Desktop Navigation - Properly Centered */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
            {primaryNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                onClick={(event) => handleNavClick(event, item)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        to={item.href}
                        className="flex items-center justify-between"
                        onClick={(event) => handleNavClick(event, item)}
                      >
                        <span className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </span>
                        {item.exclusive && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-primary border-primary/40">
                            Exclusive
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <AuthButtons />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  {allNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors duration-200"
                        onClick={(event) => handleNavClick(event, item)}
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium flex-1">{item.name}</span>
                        {item.exclusive && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-primary border-primary/40">
                            Exclusive
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t border-border">
                    <AuthButtons />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

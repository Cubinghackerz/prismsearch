
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, MessageSquare, Shield, Calculator, Code2, FileText, Atom, Beaker, Zap, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import AuthButtons from '@/components/AuthButtons';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/', icon: Search },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Vault', href: '/vault', icon: Shield },
    { name: 'Math', href: '/math', icon: Calculator },
    { name: 'Physics', href: '/physics', icon: Atom },
    { name: 'Chemistry', href: '/chemistry', icon: Beaker },
    { name: 'Graphing', href: '/graphing', icon: Zap },
    { name: 'Code', href: '/code', icon: Code2 },
    { name: 'Pages', href: '/pages', icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Prism
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
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
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.name}</span>
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

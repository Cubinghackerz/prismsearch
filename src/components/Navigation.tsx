
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  Home, 
  MessageSquare, 
  Zap, 
  Shield, 
  Code, 
  FileText, 
  Image,
  Eye, 
  RefreshCw, 
  ChevronDown, 
  DollarSign, 
  BarChart, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@clerk/clerk-react';

interface NavigationItemProps {
  to: string;
  icon: React.ComponentType<any>;
  text: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ to, icon: Icon, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors ${isActive ? 'bg-white/10' : ''}`}>
      <Icon className="w-4 h-4 text-white" />
      <span className="text-sm text-white font-fira-code">{text}</span>
    </Link>
  );
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/20 font-fira-code">
      <div className="container max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center text-lg font-semibold text-white">
          <Home className="w-6 h-6 mr-2" />
          <span className="font-fira-code">Prism AI</span>
        </Link>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black/95 backdrop-blur-md border-r border-white/20 font-fira-code">
            <div className="flex flex-col h-full">
              <div className="py-4 border-b border-white/20">
                <Link to="/" className="flex items-center text-lg font-semibold text-white px-4">
                  <Home className="w-6 h-6 mr-2" />
                  <span className="font-fira-code">Prism AI</span>
                </Link>
              </div>

              <div className="flex-grow flex flex-col justify-between">
                <div className="flex flex-col space-y-2 py-4 px-4">
                  <NavigationItem to="/home" icon={Home} text="Home" />
                  <NavigationItem to="/chat" icon={MessageSquare} text="Chat" />
                  <NavigationItem to="/prism-vault" icon={Shield} text="Vault" />
                  <NavigationItem to="/prism-code" icon={Code} text="Code" />
                  <NavigationItem to="/prism-pages" icon={FileText} text="Pages" />
                  <NavigationItem to="/prism-image-gen" icon={Image} text="Image Gen" />
                  <NavigationItem to="/prism-detector" icon={Eye} text="Detector" />
                  <NavigationItem to="/prism-conversions" icon={RefreshCw} text="Conversions" />
                  <NavigationItem to="/pricing" icon={DollarSign} text="Pricing" />
                  <NavigationItem to="/analytics" icon={BarChart} text="Analytics" />
                </div>

                <div className="py-4 border-t border-white/20 flex flex-col space-y-2 px-4">
                  <ThemeToggle />
                  {isSignedIn ? (
                    <Button variant="ghost" className="justify-start text-white hover:bg-white/10" onClick={handleSignOut}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Link to="/auth" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-white">
                        <LogIn className="w-4 h-4 mr-2" />
                        <span>Sign In</span>
                      </Link>
                      <Link to="/clerk-auth" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span>Sign Up</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <NavigationItem to="/chat" icon={MessageSquare} text="Chat" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 transition-colors font-fira-code flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Prism Suite</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-md border border-white/20 font-fira-code">
              <DropdownMenuItem asChild>
                <Link to="/prism-vault" className="flex items-center space-x-2 w-full">
                  <Shield className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Vault</div>
                    <div className="text-xs text-gray-400">Secure Password Manager</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/prism-code" className="flex items-center space-x-2 w-full">
                  <Code className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Code</div>
                    <div className="text-xs text-gray-400">AI Web App Generator</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/prism-pages" className="flex items-center space-x-2 w-full">
                  <FileText className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Pages</div>
                    <div className="text-xs text-gray-400">AI Document Editor</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/prism-image-gen" className="flex items-center space-x-2 w-full">
                  <Image className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Image Gen</div>
                    <div className="text-xs text-gray-400">AI Image Generator</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/prism-detector" className="flex items-center space-x-2 w-full">
                  <Eye className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Detector</div>
                    <div className="text-xs text-gray-400">Content Analysis</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/prism-conversions" className="flex items-center space-x-2 w-full">
                  <RefreshCw className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Conversions</div>
                    <div className="text-xs text-gray-400">Format Converter</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavigationItem to="/pricing" icon={DollarSign} text="Pricing" />
          <NavigationItem to="/analytics" icon={BarChart} text="Analytics" />
          <ThemeToggle />
          {isSignedIn ? (
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleSignOut}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/auth" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-white">
                <LogIn className="w-4 h-4" />
                <span className="text-sm">Sign In</span>
              </Link>
              <Link to="/clerk-auth" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-white">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

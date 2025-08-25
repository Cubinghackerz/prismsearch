import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { usePathname, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Menu,
  Shield,
  Code,
  FileText,
  Wrench,
  Calculator,
  Atom,
  Beaker,
  TrendingUp,
  RotateCcw,
  Archive,
  Eye,
  MessageSquare,
  Globe
} from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { Link } from 'react-router-dom';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  subItems?: NavItem[];
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const navigate = useRouter().push;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Deep Search', href: '/deep-search', icon: Globe },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Vault', href: '/vault', icon: Shield },
    { name: 'Code', href: '/code', icon: Code },
    { name: 'Docs', href: '/docs', icon: FileText },
    { name: 'Tools', href: '#', icon: Wrench, 
      subItems: [
        { name: 'Math Assistant', href: '/math', icon: Calculator },
        { name: 'Physics Helper', href: '/physics', icon: Atom },
        { name: 'Chemistry Lab', href: '/chemistry', icon: Beaker },
        { name: 'Graphing', href: '/graphing', icon: TrendingUp },
        { name: 'Conversions', href: '/conversions', icon: RotateCcw },
        { name: 'Compressor', href: '/compressor', icon: Archive },
        { name: 'Detector', href: '/detector', icon: Eye }
      ]
    }
  ];

  return (
    <header className="bg-prism-bg/90 backdrop-blur-md sticky top-0 z-50 border-b border-prism-border shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <Link to="/" className="font-bold text-xl text-prism-text">
          Prism <span className="text-prism-primary">AI</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex space-x-4">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              item.subItems ? (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                    {item.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={subItem.href}
                              className="block select-none space-y-1.5 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{subItem.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Sophisticated task automation and data analysis.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "relative block rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors hover:text-accent-foreground sm:text-base",
                      pathname === item.href ? "text-accent-foreground" : "text-prism-text"
                    )}
                  >
                    {item.name}
                  </Link>
                </NavigationMenuItem>
              )
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Menu className="h-6 w-6 text-prism-text cursor-pointer" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-prism-bg/95 backdrop-blur-md border-r border-prism-border">
            <SheetHeader className="text-left">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Explore Prism AI
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {navigationItems.map((item) => (
                item.subItems ? (
                  <div key={item.name} className="mb-2">
                    <button
                      className="flex items-center justify-between w-full py-2 px-4 text-prism-text hover:bg-prism-primary/10 rounded-md"
                      onClick={() => {
                        // Handle submenu toggle if needed
                      }}
                    >
                      <span>{item.name}</span>
                      <span>{/* Add icon if needed */}</span>
                    </button>
                    <div className="ml-4">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block py-2 px-4 text-prism-text hover:bg-prism-primary/10 rounded-md"
                          onClick={closeMenu}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-2 px-4 text-prism-text hover:bg-prism-primary/10 rounded-md"
                    onClick={closeMenu}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* User Profile Dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={user.firstName || "User"} />
                  <AvatarFallback>{user.firstName?.charAt(0) || user.lastName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/vault')}>
                Vault
                <DropdownMenuShortcut>⇧⌘V</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/auth')}>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/auth')}>Logout <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => navigate('/auth')} variant="outline">Sign In</Button>
        )}
      </div>
    </header>
  );
};

export default Navigation;

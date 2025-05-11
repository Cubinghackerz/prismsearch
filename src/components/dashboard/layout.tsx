
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  MessageCircle,
  DollarSign,
  User,
  Settings,
  Info,
  Mail,
  Package,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </div>
  );
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex flex-col w-full">
          <DashboardNavbar />
          <main className="flex-1 space-y-8 p-8 pt-6">
            {children}
          </main>
          <DashboardFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}

export function DashboardSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Prism</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard")}
              tooltip="Dashboard"
            >
              <Link to="/dashboard">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/search")}
              tooltip="Search"
            >
              <Link to="/search">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/chat")}
              tooltip="Chat"
            >
              <Link to="/chat">
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/pricing")}
              tooltip="Pricing"
            >
              <Link to="/pricing">
                <DollarSign className="h-4 w-4" />
                <span>Pricing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {open && (
          <div className="p-2 bg-muted/30 rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground px-2">
              Free Plan
            </p>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-medium">Credits</span>
              <span className="text-xs font-medium">20/50</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <Link to="/dashboard" className="hidden md:flex">
          <span className="text-xl font-bold">Prism Search</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <nav className="hidden md:flex items-center space-x-2">
          <Link to="/search">
            <Button variant="ghost" size="sm">Search</Button>
          </Link>
          <Link to="/chat">
            <Button variant="ghost" size="sm">Chat</Button>
          </Link>
          <Link to="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>
        </nav>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DashboardFooter() {
  return (
    <footer className="p-6 border-t bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center sm:text-left">
          <div>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
          </div>
          <div>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Docs
            </Link>
          </div>
          <div>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
          <div>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
          <div>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
          <div className="flex justify-center sm:justify-start space-x-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Prism Search. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

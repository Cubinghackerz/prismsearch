
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EnhancedThemeProvider } from "@/components/ui/enhanced-theme-system";
import { SpeedInsights } from "@vercel/speed-insights/react";
import AuthPromptDialog from "@/components/AuthPromptDialog";
import useAuthPrompt from "@/hooks/useAuthPrompt";
import PrismAssistant from "@/components/PrismAssistant";
import CommandPalette from "@/components/ui/command-palette";
import WorkspaceTabs from "@/components/ui/workspace-tabs";
import AdaptiveSidebar from "@/components/ui/adaptive-sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Home from "./pages/Home";
import DeepSearch from "./pages/DeepSearch";
import PrismVault from "./pages/PrismVault";
import PrismConversions from "./pages/PrismConversions";
import PrismCompressor from "./pages/PrismCompressor";
import PrismDetector from "./pages/PrismDetector";
import PrismGraphing from "./pages/PrismGraphing";
import ClerkAuth from "./pages/ClerkAuth";
import SecureRedirect from "./pages/SecureRedirect";
import PrismCode from "./pages/PrismCode";
import PrismPages from "./pages/PrismPages";
import DocumentEditor from "./pages/DocumentEditor";
import PrismMath from "./pages/PrismMath";
import PrismPhysics from "./pages/PrismPhysics";
import PrismChemistry from "./pages/PrismChemistry";

// Create QueryClient with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000,
      gcTime: 300000,
    },
  },
});

const AppContent: React.FC = () => {
  const { showPrompt, closePrompt } = useAuthPrompt();

  return (
    <div className="flex h-screen bg-background text-foreground font-inter overflow-hidden">
      <Toaster />
      <SonnerToaster />
      
      {/* Adaptive Sidebar */}
      <AdaptiveSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Workspace Tabs */}
        <WorkspaceTabs />
        
        {/* Page Content */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-background to-secondary/5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Index />} />
            <Route path="/deep-search" element={<DeepSearch />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/vault" element={<PrismVault />} />
            <Route path="/conversions" element={<PrismConversions />} />
            <Route path="/compressor" element={<PrismCompressor />} />
            <Route path="/detector" element={<PrismDetector />} />
            <Route path="/graphing" element={<PrismGraphing />} />
            <Route path="/docs" element={<PrismPages />} />
            <Route path="/docs/:docId" element={<DocumentEditor />} />
            <Route path="/code" element={<PrismCode />} />
            <Route path="/math" element={<PrismMath />} />
            <Route path="/physics" element={<PrismPhysics />} />
            <Route path="/chemistry" element={<PrismChemistry />} />
            <Route path="/auth" element={<ClerkAuth />} />
            <Route path="/secure-redirect" element={<SecureRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      
      {/* Global Components */}
      <AuthPromptDialog isOpen={showPrompt} onClose={closePrompt} />
      <CommandPalette />
      <PrismAssistant />
      <SpeedInsights />
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <EnhancedThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </EnhancedThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

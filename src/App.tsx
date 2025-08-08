
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthPromptDialog from "@/components/AuthPromptDialog";
import useAuthPrompt from "@/hooks/useAuthPrompt";
import PrismAssistant from "@/components/PrismAssistant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import PrismVault from "./pages/PrismVault";
import PrismConversions from "./pages/PrismConversions";
import PrismDetector from "./pages/PrismDetector";
import PrismPages from "./pages/PrismPages";
import PrismEditor from "./pages/PrismEditor";
import ClerkAuth from "./pages/ClerkAuth";
import SecureRedirect from "./pages/SecureRedirect";

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
    <div className="bg-gradient-to-b from-background to-secondary/10 text-foreground min-h-screen font-inter">
      <Toaster />
      <SonnerToaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/vault" element={<PrismVault />} />
        <Route path="/conversions" element={<PrismConversions />} />
        <Route path="/detector" element={<PrismDetector />} />
        <Route path="/docs" element={<PrismPages />} />
        <Route path="/docs/:docId" element={<PrismEditor />} />
        <Route path="/auth" element={<ClerkAuth />} />
        <Route path="/secure-redirect" element={<SecureRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AuthPromptDialog isOpen={showPrompt} onClose={closePrompt} />
      <PrismAssistant />
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

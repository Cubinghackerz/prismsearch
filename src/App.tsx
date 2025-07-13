
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import PrismVault from "./pages/PrismVault";
import PrismNotes from "./pages/PrismNotes";

// Create QueryClient with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // Increased stale time to reduce refetches
      gcTime: 300000, // 5 minutes cache time
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="bg-gradient-to-b from-prism-bg to-prism-surface text-prism-text min-h-screen font-inter">
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/vault" element={<PrismVault />} />
            <Route path="/notes" element={<PrismNotes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

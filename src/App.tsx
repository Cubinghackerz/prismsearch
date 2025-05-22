
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import { useEffect } from "react";

// Create QueryClient with custom settings for better UI
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Keyboard navigation helper component
const KeyboardNavigationHelper = () => {
  useEffect(() => {
    // Add keyboard handler
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add keyboard shortcuts
      if (e.key === '/' && e.target !== document.querySelector('input')) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    // Skip to content link - hidden but appears on tab focus
    <a href="#main-content" className="skip-to-content">
      Skip to content
    </a>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="bg-gradient-to-b from-[#1A1F2C] to-[#232938] text-orange-100 min-h-screen font-inter">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <KeyboardNavigationHelper />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

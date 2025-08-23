
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider } from "@/context/ChatContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClerkAuth from "./pages/ClerkAuth";
import Analytics from "./pages/Analytics";
import Chat from "./pages/Chat";
import PrismCode from "./pages/PrismCode";
import PrismMath from "./pages/PrismMath";
import PrismPhysics from "./pages/PrismPhysics";
import PrismChemistry from "./pages/PrismChemistry";
import PrismVault from "./pages/PrismVault";
import PrismPages from "./pages/PrismPages";
import PrismGraphing from "./pages/PrismGraphing";
import PrismConversions from "./pages/PrismConversions";
import PrismCompressor from "./pages/PrismCompressor";
import PrismDetector from "./pages/PrismDetector";
import DocumentEditor from "./pages/DocumentEditor";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import SecureRedirect from "./pages/SecureRedirect";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/clerk-auth" element={<ClerkAuth />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/search" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/code" element={<PrismCode />} />
                <Route path="/math" element={<PrismMath />} />
                <Route path="/physics" element={<PrismPhysics />} />
                <Route path="/chemistry" element={<PrismChemistry />} />
                <Route path="/vault" element={<PrismVault />} />
                <Route path="/pages" element={<PrismPages />} />
                <Route path="/graphing" element={<PrismGraphing />} />
                <Route path="/conversions" element={<PrismConversions />} />
                <Route path="/compressor" element={<PrismCompressor />} />
                <Route path="/detector" element={<PrismDetector />} />
                <Route path="/document/:id" element={<DocumentEditor />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/secure-redirect" element={<SecureRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

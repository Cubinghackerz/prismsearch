import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ClerkAuth from "./pages/ClerkAuth";
import Chat from "./pages/Chat";
import PrismVault from "./pages/PrismVault";
import PrismCode from "./pages/PrismCode";
import PrismPages from "./pages/PrismPages";
import PrismImageGen from "./pages/PrismImageGen";
import PrismDetector from "./pages/PrismDetector";
import PrismConversions from "./pages/PrismConversions";
import Pricing from "./pages/Pricing";
import Analytics from "./pages/Analytics";
import DocumentEditor from "./pages/DocumentEditor";
import SecureRedirect from "./pages/SecureRedirect";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/clerk-auth" element={<ClerkAuth />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/prism-vault" element={<PrismVault />} />
            <Route path="/prism-code" element={<PrismCode />} />
            <Route path="/prism-pages" element={<PrismPages />} />
            <Route path="/prism-image-gen" element={<PrismImageGen />} />
            <Route path="/prism-detector" element={<PrismDetector />} />
            <Route path="/prism-conversions" element={<PrismConversions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/document/:id" element={<DocumentEditor />} />
            <Route path="/secure-redirect" element={<SecureRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTop />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

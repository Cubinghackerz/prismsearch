
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import PrismMath from "./pages/PrismMath";
import PrismVault from "./pages/PrismVault";
import PrismCode from "./pages/PrismCode";
import PrismPages from "./pages/PrismPages";
import PrismGraphing from "./pages/PrismGraphing";
import PrismPhysics from "./pages/PrismPhysics";
import PrismChemistry from "./pages/PrismChemistry";
import DeepSearch from "./pages/DeepSearch";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/search" element={<Chat />} />
            <Route path="/deep-search" element={<DeepSearch />} />
            <Route path="/math" element={<PrismMath />} />
            <Route path="/vault" element={<PrismVault />} />
            <Route path="/code" element={<PrismCode />} />
            <Route path="/pages" element={<PrismPages />} />
            <Route path="/graphing" element={<PrismGraphing />} />
            <Route path="/physics" element={<PrismPhysics />} />
            <Route path="/chemistry" element={<PrismChemistry />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

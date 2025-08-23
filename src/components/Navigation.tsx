
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isToolsActive = () => {
    const toolPaths = ["/search", "/chat", "/code", "/math", "/physics", "/chemistry", "/vault", "/conversions", "/compressor", "/detector", "/graphing"];
    return toolPaths.includes(location.pathname);
  };

  return (
    <header className="container mx-auto px-6 py-8">
      <nav className="flex items-center justify-between gap-8">
        <div className="flex items-center space-x-3 cursor-pointer min-w-fit" onClick={() => navigate("/")}>
          <img 
            src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
            alt="Prism Logo" 
            className="w-8 h-8 flex-shrink-0"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code whitespace-nowrap">
            Prism
          </span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-6 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isToolsActive() ? "default" : "ghost"}
                className="font-fira-code text-sm flex items-center gap-2"
              >
                Tools
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-background/95 backdrop-blur-md border border-border/50" align="start">
              <DropdownMenuItem 
                onClick={() => navigate("/search")}
                className={`cursor-pointer font-fira-code ${isActive("/search") ? "bg-accent text-accent-foreground" : ""}`}
              >
                Search
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/chat")}
                className={`cursor-pointer font-fira-code ${isActive("/chat") ? "bg-accent text-accent-foreground" : ""}`}
              >
                Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate("/code")}
                className={`cursor-pointer font-fira-code ${isActive("/code") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Code
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/math")}
                className={`cursor-pointer font-fira-code ${isActive("/math") ? "bg-accent text-accent-foreground" : ""}`}
              >
                Math
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/physics")}
                className={`cursor-pointer font-fira-code ${isActive("/physics") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Physics
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/chemistry")}
                className={`cursor-pointer font-fira-code ${isActive("/chemistry") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Chemistry
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/graphing")}
                className={`cursor-pointer font-fira-code ${isActive("/graphing") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Graphing
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/vault")}
                className={`cursor-pointer font-fira-code ${isActive("/vault") ? "bg-accent text-accent-foreground" : ""}`}
              >
                Vault
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/conversions")}
                className={`cursor-pointer font-fira-code ${isActive("/conversions") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Conversions
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/compressor")}
                className={`cursor-pointer font-fira-code ${isActive("/compressor") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Compressor
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/detector")}
                className={`cursor-pointer font-fira-code ${isActive("/detector") ? "bg-accent text-accent-foreground" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  Detector
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant={isActive("/pricing") ? "default" : "ghost"} 
            onClick={() => navigate("/pricing")}
            className="font-fira-code text-sm"
          >
            Pricing
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthButtons from "@/components/AuthButtons";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="container mx-auto px-6 py-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <img 
            src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
            alt="Prism Logo" 
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
            Prism
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Button 
            variant={isActive("/search") ? "default" : "ghost"} 
            onClick={() => navigate("/search")}
            className="font-fira-code"
          >
            Search
          </Button>
          <Button 
            variant={isActive("/chat") ? "default" : "ghost"} 
            onClick={() => navigate("/chat")}
            className="font-fira-code"
          >
            Chat
          </Button>
          <Button 
            variant={isActive("/pages") ? "default" : "ghost"} 
            onClick={() => navigate("/pages")}
            className="font-fira-code"
          >
            Pages
          </Button>
          <Button 
            variant={isActive("/vault") ? "default" : "ghost"} 
            onClick={() => navigate("/vault")}
            className="font-fira-code"
          >
            Vault
          </Button>
          <Button 
            variant={isActive("/conversions") ? "default" : "ghost"} 
            onClick={() => navigate("/conversions")}
            className="relative font-fira-code"
          >
            Conversions
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
          </Button>
          <Button 
            variant={isActive("/detector") ? "default" : "ghost"} 
            onClick={() => navigate("/detector")}
            className="relative font-fira-code"
          >
            Detector
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
          </Button>
          <Button 
            variant={isActive("/pricing") ? "default" : "ghost"} 
            onClick={() => navigate("/pricing")}
            className="font-fira-code"
          >
            Pricing
          </Button>
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
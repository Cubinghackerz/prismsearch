
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="container mx-auto px-6 py-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-r from-prism-primary to-prism-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
            Prism
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Button 
            variant={isActive("/search") ? "default" : "ghost"} 
            onClick={() => navigate("/search")}
          >
            Search
          </Button>
          <Button 
            variant={isActive("/chat") ? "default" : "ghost"} 
            onClick={() => navigate("/chat")}
          >
            Chat
          </Button>
          <Button 
            variant={isActive("/vault") ? "default" : "ghost"} 
            onClick={() => navigate("/vault")}
          >
            Vault
          </Button>
          <Button 
            variant={isActive("/notes") ? "default" : "ghost"} 
            onClick={() => navigate("/notes")}
          >
            Notes 
            {isActive("/notes") && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-prism-primary text-white rounded-full">New</span>
            )}
          </Button>
          <Button 
            variant={isActive("/pricing") ? "default" : "ghost"} 
            onClick={() => navigate("/pricing")}
          >
            Pricing
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;

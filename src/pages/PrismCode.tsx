
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Code } from "lucide-react";
import CodingWorkspace from "@/components/coding-workspace/CodingWorkspace";
import { QueryLimitDisplay } from "@/components/chat/QueryLimitDisplay";

const PrismCode = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prism-primary"></div>
    </div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <QueryLimitDisplay />
      <div className="container mx-auto px-6 py-8 pt-24">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Code className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              Prism Code
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            AI-powered coding workspace with live preview, multi-framework support, and integrated development tools
          </p>
        </div>

        <div className="h-[calc(100vh-12rem)]">
          <CodingWorkspace />
        </div>
      </div>
    </div>
  );
};

export default PrismCode;

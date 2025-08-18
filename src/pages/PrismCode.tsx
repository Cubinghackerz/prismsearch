
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Code, AlertTriangle, FileType } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WebAppGenerator from "@/components/prism-code/WebAppGenerator";
import CodeNotebook from "@/components/prism-code/CodeNotebook";
import FileConversionsPanel from "@/components/prism-code/FileConversionsPanel";
import { QueryLimitDisplay } from "@/components/chat/QueryLimitDisplay";

const PrismCode = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [activeTab, setActiveTab] = useState("webapp");

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
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
              <Code2 className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-fira-code">
                Prism Code
              </h1>
              <p className="text-prism-text-muted mt-1 font-inter">
                Generate web applications, convert files, and run code snippets with AI assistance
              </p>
            </div>
          </div>

          <Alert className="border-orange-500/30 bg-orange-500/5 mb-6">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-300">
              <strong>Enhanced Features:</strong> AI Web App Generator with GitHub sync, File Conversions, and Code Notebook are available. 
              You have 10 queries per day for the AI Web App Generator.
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="webapp" className="flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>AI Web Apps</span>
            </TabsTrigger>
            <TabsTrigger value="conversions" className="flex items-center space-x-2">
              <FileType className="w-4 h-4" />
              <span>File Conversions</span>
            </TabsTrigger>
            <TabsTrigger value="notebook" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>Code Notebook</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webapp" className="space-y-6">
            <WebAppGenerator />
          </TabsContent>

          <TabsContent value="conversions" className="space-y-6">
            <FileConversionsPanel />
          </TabsContent>

          <TabsContent value="notebook" className="space-y-6">
            <CodeNotebook />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrismCode;

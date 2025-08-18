
import React from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const PrismPages = () => {
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
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-20">
          <div className="p-4 rounded-full bg-prism-primary/10 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent mb-4">
            Prism Pages
          </h1>
          <p className="text-prism-text-muted mb-6">
            Rich text document editor - Coming Soon
          </p>
          <p className="text-sm text-prism-text-muted">
            This feature is under development and will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrismPages;

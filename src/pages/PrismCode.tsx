
import React from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import CodeNotebook from "@/components/prism-code/CodeNotebook";

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
      <div className="container mx-auto px-6 py-8">
        <CodeNotebook />
      </div>
    </div>
  );
};

export default PrismCode;

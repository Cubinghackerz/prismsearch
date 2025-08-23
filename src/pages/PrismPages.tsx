
import React from "react";
import Navigation from "@/components/Navigation";
import PrismPagesHeader from "@/components/prism-pages/PrismPagesHeader";
import DocumentsList from "@/components/prism-pages/DocumentsList";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

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
      <div className="container mx-auto px-6 py-8 pt-24">
        <PrismPagesHeader />
        <DocumentsList />
      </div>
    </div>
  );
};

export default PrismPages;

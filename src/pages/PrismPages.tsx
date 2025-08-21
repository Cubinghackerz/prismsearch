
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import PrismPagesHeader from "@/components/prism-pages/PrismPagesHeader";
import DocumentsList from "@/components/prism-pages/DocumentsList";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import HumanVerificationScreen from "@/components/HumanVerificationScreen";

const PrismPages = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  const handleVerificationComplete = () => {
    setIsVerifying(false);
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prism-primary"></div>
    </div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (isVerifying) {
    return (
      <HumanVerificationScreen 
        onVerificationComplete={handleVerificationComplete}
        title="PAGES ACCESS VERIFICATION"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        <PrismPagesHeader />
        <DocumentsList />
      </div>
    </div>
  );
};

export default PrismPages;

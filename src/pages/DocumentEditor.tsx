
import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import DocumentEditorComponent from "@/components/prism-pages/DocumentEditor";
import HumanVerificationScreen from "@/components/HumanVerificationScreen";

const DocumentEditor = () => {
  const { docId } = useParams();
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

  if (!docId) {
    return <Navigate to="/docs" replace />;
  }

  if (isVerifying) {
    return (
      <HumanVerificationScreen 
        onVerificationComplete={handleVerificationComplete}
        title="DOCUMENT ACCESS VERIFICATION"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DocumentEditorComponent docId={docId} />
    </div>
  );
};

export default DocumentEditor;

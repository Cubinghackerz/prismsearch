
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import DocumentEditorComponent from "@/components/prism-pages/DocumentEditor";

const DocumentEditor = () => {
  const { docId } = useParams();
  const { isSignedIn, isLoaded } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <DocumentEditorComponent docId={docId} />
    </div>
  );
};

export default DocumentEditor;

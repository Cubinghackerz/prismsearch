
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

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
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-prism-text mb-4">
            Document Editor
          </h1>
          <p className="text-prism-text-muted">
            Document ID: {docId}
          </p>
          <p className="text-sm text-prism-text-muted mt-4">
            Document editor functionality is under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;

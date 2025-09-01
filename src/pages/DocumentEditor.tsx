
import React from "react";
import { motion } from 'framer-motion';
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import DocumentEditorComponent from "@/components/prism-pages/DocumentEditor";

const DocumentEditor = () => {
  const { docId } = useParams();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-b-2 border-primary"
        />
      </div>
    );
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

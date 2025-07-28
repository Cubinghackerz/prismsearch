
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

const useAuthPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  useEffect(() => {
    // Only show prompt if user is not signed in and auth is loaded
    if (!isLoaded) return;
    
    // Don't show prompt if user is already signed in
    if (isSignedIn) {
      setShowPrompt(false);
      return;
    }
    
    // Don't show on auth page, home page, or secure redirect
    const skipPromptRoutes = ['/', '/auth', '/secure-redirect'];
    if (skipPromptRoutes.includes(location.pathname)) {
      setShowPrompt(false);
      return;
    }
    
    // Show prompt only if user is not signed in
    if (!isSignedIn) {
      // Add a small delay to ensure smooth page transition
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, isLoaded, location.pathname]);

  const closePrompt = () => {
    setShowPrompt(false);
  };

  return { showPrompt, closePrompt };
};

export default useAuthPrompt;


import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import HumanVerificationScreen from '@/components/HumanVerificationScreen';

const Analytics = () => {
  const [isVerifying, setIsVerifying] = useState(true);

  const handleVerificationComplete = () => {
    setIsVerifying(false);
  };

  if (isVerifying) {
    return (
      <HumanVerificationScreen 
        onVerificationComplete={handleVerificationComplete}
        title="ANALYTICS ACCESS VERIFICATION"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface flex flex-col">
      <div className="relative z-10 flex-1 flex flex-col">
        <Navigation />
        
        <main className="container mx-auto px-6 flex-1">
          <AnalyticsDashboard />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Analytics;

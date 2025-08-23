
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChemistryAssistant from '@/components/chemistry-assistant/ChemistryAssistant';

const PrismChemistry = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24 flex-1">
        <ChemistryAssistant />
      </main>
      
      <Footer />
    </div>
  );
};

export default PrismChemistry;

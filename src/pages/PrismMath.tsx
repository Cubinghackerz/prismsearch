
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MathAssistant from '@/components/math-assistant/MathAssistant';

const PrismMath = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <MathAssistant />
      </main>
      
      <Footer />
    </div>
  );
};

export default PrismMath;


import React from 'react';
import Navigation from '@/components/Navigation';
import MathAssistant from '@/components/math-assistant/MathAssistant';
import Footer from '@/components/Footer';

const PrismMath = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <MathAssistant />
      <Footer />
    </div>
  );
};

export default PrismMath;

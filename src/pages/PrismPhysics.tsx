
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PhysicsAssistant from '@/components/physics-assistant/PhysicsAssistant';

const PrismPhysics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24 flex-1">
        <PhysicsAssistant />
      </main>
      
      <Footer />
    </div>
  );
};

export default PrismPhysics;

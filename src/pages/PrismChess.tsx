
import React from 'react';
import Navigation from '@/components/Navigation';
import ChessAnalyzer from '@/components/chess-analyzer/ChessAnalyzer';
import Footer from '@/components/Footer';

const PrismChess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <ChessAnalyzer />
      <Footer />
    </div>
  );
};

export default PrismChess;

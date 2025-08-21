
import React from 'react';
import Navigation from '@/components/Navigation';
import ImageGenerator from '@/components/prism-image/ImageGenerator';

const PrismImageGen: React.FC = () => {
  return (
    <div className="min-h-screen bg-prism-dark">
      <Navigation />
      <ImageGenerator />
    </div>
  );
};

export default PrismImageGen;

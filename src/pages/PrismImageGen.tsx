
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImageGenerator from '@/components/prism-image/ImageGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Palette, Wand2 } from 'lucide-react';

const PrismImageGen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-prism-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-secondary bg-clip-text text-transparent">
              Prism Image Generator
            </h1>
          </div>
          <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
            Create stunning, high-quality images using Google's advanced Imagen AI technology. 
            Transform your ideas into visual masterpieces with just a description.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-prism-surface/20 border-prism-border">
            <CardHeader className="text-center pb-3">
              <Wand2 className="w-8 h-8 mx-auto text-prism-primary mb-2" />
              <CardTitle className="text-lg text-prism-text">AI-Powered Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-prism-text-muted">
                Leverages Google's advanced Imagen model for high-quality, photorealistic image generation from text prompts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-prism-surface/20 border-prism-border">
            <CardHeader className="text-center pb-3">
              <Palette className="w-8 h-8 mx-auto text-prism-primary mb-2" />
              <CardTitle className="text-lg text-prism-text">Multiple Formats</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-prism-text-muted">
                Generate images in various aspect ratios including square, landscape, portrait, and classic formats.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-prism-surface/20 border-prism-border">
            <CardHeader className="text-center pb-3">
              <Sparkles className="w-8 h-8 mx-auto text-prism-primary mb-2" />
              <CardTitle className="text-lg text-prism-text">Instant Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-prism-text-muted">
                Get your generated images instantly with download options and organized history for easy access.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Generator Component */}
        <ImageGenerator />
      </main>

      <Footer />
    </div>
  );
};

export default PrismImageGen;

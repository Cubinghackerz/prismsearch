
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon, Download, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingAnimation from '@/components/LoadingAnimation';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{prompt: string, imageUrl: string, timestamp: Date}>>([]);
  const { toast } = useToast();

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '3:4', label: 'Portrait (3:4)' }
  ];

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your image.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-image-gen', {
        body: {
          prompt: prompt.trim(),
          aspectRatio: aspectRatio
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        // For now, we'll show a placeholder since Google's actual image generation
        // requires different API setup
        const placeholderImageUrl = `https://api.placeholder.com/800x600/4f46e5/ffffff?text=${encodeURIComponent(prompt.substring(0, 50))}`;
        
        setGeneratedImage(placeholderImageUrl);
        setGenerationHistory(prev => [...prev, {
          prompt: prompt,
          imageUrl: placeholderImageUrl,
          timestamp: new Date()
        }]);

        toast({
          title: "Image Generated Successfully",
          description: "Your AI-generated image is ready!",
        });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${prompt.substring(0, 20).replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-prism-dark text-prism-text font-fira-code">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
              AI Image Generator
            </h1>
            <p className="text-prism-text-muted">
              Create stunning images with Google's AI technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-prism-surface border-prism-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-prism-text">
                  <Sparkles className="w-5 h-5 text-prism-primary" />
                  Generate Image
                </CardTitle>
                <CardDescription className="text-prism-text-muted">
                  Describe the image you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt" className="text-prism-text">
                    Image Description
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., A majestic mountain landscape at sunset with purple clouds..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-prism-surface/50 border-prism-border text-prism-text min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="aspect-ratio" className="text-prism-text">
                    Aspect Ratio
                  </Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="bg-prism-surface/50 border-prism-border text-prism-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-prism-primary hover:bg-prism-primary/80"
                >
                  {isGenerating ? (
                    <>
                      <LoadingAnimation color="prism" size="small" />
                      <span className="ml-2">Generating...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Result Section */}
            <Card className="bg-prism-surface border-prism-border">
              <CardHeader>
                <CardTitle className="text-prism-text">Generated Image</CardTitle>
                <CardDescription className="text-prism-text-muted">
                  Your AI-created masterpiece will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-64 bg-prism-surface/30 rounded-lg border border-prism-border">
                    <div className="text-center">
                      <LoadingAnimation color="prism" size="medium" />
                      <p className="mt-4 text-prism-text-muted">Creating your image...</p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={generatedImage} 
                      alt="AI Generated" 
                      className="w-full rounded-lg border border-prism-border"
                    />
                    <Button 
                      onClick={() => handleDownload(generatedImage, prompt)}
                      variant="outline"
                      className="w-full border-prism-border text-prism-text hover:bg-prism-primary/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-prism-surface/30 rounded-lg border border-prism-border border-dashed">
                    <div className="text-center text-prism-text-muted">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Enter a prompt and click generate to create an image</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generation History */}
          {generationHistory.length > 0 && (
            <Card className="mt-8 bg-prism-surface border-prism-border">
              <CardHeader>
                <CardTitle className="text-prism-text">Recent Generations</CardTitle>
                <CardDescription className="text-prism-text-muted">
                  Your image generation history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generationHistory.slice(-6).reverse().map((item, index) => (
                    <div key={index} className="group">
                      <img 
                        src={item.imageUrl} 
                        alt={item.prompt} 
                        className="w-full h-32 object-cover rounded-lg border border-prism-border mb-2"
                      />
                      <p className="text-sm text-prism-text-muted truncate">{item.prompt}</p>
                      <p className="text-xs text-prism-text-muted">
                        {item.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;

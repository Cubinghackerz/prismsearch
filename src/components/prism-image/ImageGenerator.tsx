
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Wand2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LoadingAnimation from '@/components/LoadingAnimation';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl?: string;
  description?: string;
  aspectRatio: string;
  timestamp: Date;
  fallback?: boolean;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const aspectRatioOptions = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Classic (4:3)' },
    { value: '3:4', label: 'Portrait Classic (3:4)' }
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
      const { data, error } = await supabase.functions.invoke('google-imagen', {
        body: {
          prompt: prompt.trim(),
          aspectRatio,
          model: 'imagen-3.0-generate-001'
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        const newImage: GeneratedImage = {
          id: Math.random().toString(36).substr(2, 9),
          prompt: prompt.trim(),
          imageUrl: data.imageUrl,
          description: data.description,
          aspectRatio,
          timestamp: new Date(),
          fallback: data.fallback
        };

        setGeneratedImages(prev => [newImage, ...prev]);
        
        toast({
          title: data.fallback ? "Description Generated" : "Image Generated Successfully",
          description: data.fallback 
            ? "Image generation unavailable, but created a detailed description."
            : "Your image has been created using Google Imagen.",
        });

        setPrompt('');
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `imagen-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card className="bg-prism-surface/20 border-prism-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-prism-text">
            <Sparkles className="w-5 h-5 text-prism-primary" />
            Google Imagen Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-prism-text">
              Image Description
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate... (e.g., A serene mountain landscape at sunset with cherry blossoms)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-prism-surface/10 border-prism-border text-prism-text placeholder:text-prism-text-muted"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aspect-ratio" className="text-prism-text">
              Aspect Ratio
            </Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="bg-prism-surface/10 border-prism-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-prism-primary hover:bg-prism-primary/90 text-white"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <LoadingAnimation size="sm" color="purple" />
                Generating Image...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Generate Image
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card className="bg-prism-surface/20 border-prism-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-prism-text">
              <ImageIcon className="w-5 h-5 text-prism-primary" />
              Generated Images ({generatedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-prism-surface/10 border border-prism-border rounded-lg p-4 space-y-3"
                >
                  {image.imageUrl && !image.fallback ? (
                    <div className="relative group">
                      <img
                        src={image.imageUrl}
                        alt={image.prompt}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => downloadImage(image.imageUrl!, image.prompt)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-prism-surface/20 border border-prism-border rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-8 h-8 mx-auto text-prism-text-muted" />
                        <p className="text-sm text-prism-text-muted">Description Generated</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm text-prism-text font-medium line-clamp-2">
                      {image.prompt}
                    </p>
                    
                    {image.description && (
                      <p className="text-xs text-prism-text-muted line-clamp-3">
                        {image.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {image.aspectRatio}
                      </Badge>
                      {image.fallback && (
                        <Badge variant="secondary" className="text-xs">
                          Description Only
                        </Badge>
                      )}
                      <span className="text-xs text-prism-text-muted">
                        {image.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {generatedImages.length === 0 && (
        <Card className="bg-prism-surface/10 border-prism-border">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-prism-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-prism-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-prism-text">Ready to Create</h3>
              <p className="text-prism-text-muted max-w-md">
                Enter a detailed description above and click "Generate Image" to create stunning AI-powered images using Google Imagen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;

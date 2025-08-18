
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Layout, 
  Smartphone, 
  Tablet, 
  Monitor,
  Eye,
  Download
} from 'lucide-react';

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  fontSize: 'small' | 'medium' | 'large';
}

interface LayoutSettings {
  containerWidth: 'full' | 'container' | 'narrow';
  spacing: 'tight' | 'normal' | 'loose';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

const PRESET_COLORS = [
  { name: 'Modern Blue', primary: '#3B82F6', secondary: '#6B7280', accent: '#10B981', background: '#FFFFFF', text: '#1F2937', muted: '#9CA3AF' },
  { name: 'Dark Mode', primary: '#6366F1', secondary: '#4B5563', accent: '#F59E0B', background: '#111827', text: '#F9FAFB', muted: '#6B7280' },
  { name: 'Warm Orange', primary: '#F97316', secondary: '#78716C', accent: '#EF4444', background: '#FFFBEB', text: '#1C1917', muted: '#A8A29E' },
  { name: 'Nature Green', primary: '#059669', secondary: '#6B7280', accent: '#8B5CF6', background: '#F0FDF4', text: '#14532D', muted: '#86EFAC' },
  { name: 'Purple Gradient', primary: '#8B5CF6', secondary: '#6B7280', accent: '#F472B6', background: '#FAFAF9', text: '#1F2937', muted: '#C4B5FD' }
];

const FONT_PAIRS = [
  { name: 'Modern Sans', heading: 'Inter', body: 'Inter' },
  { name: 'Classic Serif', heading: 'Playfair Display', body: 'Source Serif Pro' },
  { name: 'Tech Mono', heading: 'JetBrains Mono', body: 'Roboto' },
  { name: 'Elegant', heading: 'Poppins', body: 'Open Sans' },
  { name: 'Bold Impact', heading: 'Oswald', body: 'Lato' }
];

interface VisualDesignModeProps {
  onApplyDesign: (design: {
    colors: ColorScheme;
    typography: TypographySettings;
    layout: LayoutSettings;
  }) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VisualDesignMode: React.FC<VisualDesignModeProps> = ({ onApplyDesign, isOpen, onClose }) => {
  const [colors, setColors] = useState<ColorScheme>(PRESET_COLORS[0]);
  const [typography, setTypography] = useState<TypographySettings>({
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontSize: 'medium'
  });
  const [layout, setLayout] = useState<LayoutSettings>({
    containerWidth: 'container',
    spacing: 'normal',
    borderRadius: 'medium'
  });
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const handleColorChange = (key: keyof ColorScheme, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const applyPresetColors = (preset: typeof PRESET_COLORS[0]) => {
    setColors(preset);
  };

  const applyFontPair = (fontPair: typeof FONT_PAIRS[0]) => {
    setTypography(prev => ({
      ...prev,
      headingFont: fontPair.heading,
      bodyFont: fontPair.body
    }));
  };

  const handleApply = () => {
    onApplyDesign({ colors, typography, layout });
    onClose();
  };

  const generatePreviewCSS = () => {
    return `
      :root {
        --primary: ${colors.primary};
        --secondary: ${colors.secondary};
        --accent: ${colors.accent};
        --background: ${colors.background};
        --text: ${colors.text};
        --muted: ${colors.muted};
      }
      
      body {
        font-family: '${typography.bodyFont}', sans-serif;
        font-size: ${typography.fontSize === 'small' ? '14px' : typography.fontSize === 'large' ? '18px' : '16px'};
        background-color: var(--background);
        color: var(--text);
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: '${typography.headingFont}', sans-serif;
      }
      
      .preview-container {
        max-width: ${layout.containerWidth === 'full' ? '100%' : layout.containerWidth === 'narrow' ? '640px' : '1200px'};
        margin: 0 auto;
        padding: ${layout.spacing === 'tight' ? '1rem' : layout.spacing === 'loose' ? '3rem' : '2rem'};
      }
      
      .preview-card {
        border-radius: ${layout.borderRadius === 'none' ? '0' : layout.borderRadius === 'small' ? '4px' : layout.borderRadius === 'large' ? '16px' : '8px'};
        background: var(--background);
        border: 1px solid var(--muted);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    `;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex">
      {/* Design Panel */}
      <div className="w-80 bg-background border-r border-prism-border overflow-y-auto">
        <div className="p-4 border-b border-prism-border">
          <h2 className="text-lg font-semibold text-prism-text flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Visual Design
          </h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Color Scheme */}
          <div>
            <h3 className="font-medium text-prism-text mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COLORS.map(preset => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetColors(preset)}
                    className="h-auto p-2 flex flex-col items-start"
                  >
                    <div className="flex space-x-1 mb-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.secondary }} />
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Label className="text-xs capitalize min-w-[4rem]">{key}</Label>
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                      className="w-12 h-8 p-1 border"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                      className="flex-1 text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Typography */}
          <div>
            <h3 className="font-medium text-prism-text mb-3 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Typography
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {FONT_PAIRS.map(fontPair => (
                  <Button
                    key={fontPair.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyFontPair(fontPair)}
                    className="justify-start"
                  >
                    <span className="text-sm">{fontPair.name}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Font Size</Label>
                <div className="flex space-x-1">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <Button
                      key={size}
                      variant={typography.fontSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypography(prev => ({ ...prev, fontSize: size }))}
                      className="flex-1 capitalize"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Layout */}
          <div>
            <h3 className="font-medium text-prism-text mb-3 flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              Layout
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Container Width</Label>
                <div className="flex space-x-1 mt-1">
                  {(['narrow', 'container', 'full'] as const).map(width => (
                    <Button
                      key={width}
                      variant={layout.containerWidth === width ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLayout(prev => ({ ...prev, containerWidth: width }))}
                      className="flex-1 capitalize"
                    >
                      {width}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Spacing</Label>
                <div className="flex space-x-1 mt-1">
                  {(['tight', 'normal', 'loose'] as const).map(spacing => (
                    <Button
                      key={spacing}
                      variant={layout.spacing === spacing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLayout(prev => ({ ...prev, spacing }))}
                      className="flex-1 capitalize"
                    >
                      {spacing}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Border Radius</Label>
                <div className="flex space-x-1 mt-1">
                  {(['none', 'small', 'medium', 'large'] as const).map(radius => (
                    <Button
                      key={radius}
                      variant={layout.borderRadius === radius ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLayout(prev => ({ ...prev, borderRadius: radius }))}
                      className="flex-1 capitalize"
                    >
                      {radius}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-prism-border">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Design
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-prism-border bg-background">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-prism-text">Design Preview</h3>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <Button
                  variant={previewDevice === 'mobile' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'desktop' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 bg-gray-100">
          <div 
            className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
              previewDevice === 'mobile' ? 'max-w-sm' :
              previewDevice === 'tablet' ? 'max-w-2xl' : 'max-w-5xl'
            }`}
          >
            <style dangerouslySetInnerHTML={{ __html: generatePreviewCSS() }} />
            
            <div className="preview-container">
              <div className="preview-card p-6 mb-6">
                <h1 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                  Your App Title
                </h1>
                <p className="text-lg mb-4" style={{ color: colors.text }}>
                  This is how your application will look with the selected design. 
                  The colors, typography, and layout will be applied consistently throughout your app.
                </p>
                <div className="flex space-x-3 mb-6">
                  <button 
                    className="px-4 py-2 rounded font-medium"
                    style={{ 
                      backgroundColor: colors.primary, 
                      color: colors.background,
                      borderRadius: layout.borderRadius === 'none' ? '0' : layout.borderRadius === 'small' ? '4px' : layout.borderRadius === 'large' ? '16px' : '8px'
                    }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-4 py-2 rounded font-medium border"
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: colors.primary,
                      borderColor: colors.primary,
                      borderRadius: layout.borderRadius === 'none' ? '0' : layout.borderRadius === 'small' ? '4px' : layout.borderRadius === 'large' ? '16px' : '8px'
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="preview-card p-4">
                      <h3 className="font-semibold mb-2" style={{ color: colors.accent }}>
                        Feature {i}
                      </h3>
                      <p className="text-sm" style={{ color: colors.muted }}>
                        Description of your app's amazing feature goes here.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualDesignMode;

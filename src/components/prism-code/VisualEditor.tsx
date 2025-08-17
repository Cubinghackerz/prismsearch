
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Palette, Type, MousePointer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface VisualEditorProps {
  generatedApp: GeneratedApp;
  onCodeChange: (fileType: string, content: string) => void;
}

interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
}

const VisualEditor: React.FC<VisualEditorProps> = ({ generatedApp, onCodeChange }) => {
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [elementStyles, setElementStyles] = useState<ElementStyle>({});
  const [elementText, setElementText] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const fontFamilies = [
    'Arial, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Helvetica, sans-serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Comic Sans MS, cursive',
    'Impact, sans-serif'
  ];

  const fontWeights = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const textAligns = ['left', 'center', 'right', 'justify'];

  useEffect(() => {
    if (iframeRef.current) {
      updateIframe();
    }
  }, [generatedApp]);

  const updateIframe = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (iframeDoc) {
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visual Editor Preview</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }
            .visual-editor-highlight {
              outline: 2px solid #3b82f6 !important;
              outline-offset: 2px !important;
              cursor: pointer !important;
            }
            .visual-editor-selected {
              outline: 2px solid #ef4444 !important;
              outline-offset: 2px !important;
              background-color: rgba(239, 68, 68, 0.1) !important;
            }
            ${generatedApp.css}
          </style>
        </head>
        <body>
          ${generatedApp.html}
          <script>
            ${generatedApp.javascript}
            
            // Visual editor functionality
            if (window.parent && window.parent.setupVisualEditor) {
              window.parent.setupVisualEditor(document);
            }
          </script>
        </body>
        </html>
      `;
      
      iframeDoc.open();
      iframeDoc.write(fullHTML);
      iframeDoc.close();

      // Setup visual editor after iframe loads
      iframe.onload = () => {
        setupVisualEditor(iframeDoc);
      };
    }
  };

  const setupVisualEditor = (doc: Document) => {
    if (!isEditorMode || !doc) return;

    const elements = doc.querySelectorAll('body *');
    
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      htmlElement.addEventListener('mouseenter', () => {
        if (htmlElement !== selectedElement) {
          htmlElement.classList.add('visual-editor-highlight');
        }
      });

      htmlElement.addEventListener('mouseleave', () => {
        htmlElement.classList.remove('visual-editor-highlight');
      });

      htmlElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectElement(htmlElement);
      });
    });
  };

  const selectElement = (element: HTMLElement) => {
    // Remove previous selection
    if (selectedElement) {
      selectedElement.classList.remove('visual-editor-selected');
    }

    // Add new selection
    element.classList.add('visual-editor-selected');
    element.classList.remove('visual-editor-highlight');
    
    setSelectedElement(element);
    
    // Get current styles
    const computedStyles = window.getComputedStyle(element);
    setElementStyles({
      color: rgbToHex(computedStyles.color),
      backgroundColor: rgbToHex(computedStyles.backgroundColor),
      fontSize: computedStyles.fontSize,
      fontFamily: computedStyles.fontFamily,
      fontWeight: computedStyles.fontWeight,
      textAlign: computedStyles.textAlign as any,
      padding: computedStyles.padding,
      margin: computedStyles.margin,
      borderRadius: computedStyles.borderRadius,
      border: computedStyles.border
    });

    // Get text content
    setElementText(element.innerText || '');
    
    toast({
      title: "Element Selected",
      description: `Selected: ${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ')[0] : ''}`,
    });
  };

  const rgbToHex = (rgb: string): string => {
    if (rgb.startsWith('#')) return rgb;
    if (rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '#ffffff';
    
    const match = rgb.match(/\d+/g);
    if (!match) return '#000000';
    
    const [r, g, b] = match.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const updateElementStyle = (property: keyof ElementStyle, value: string) => {
    if (!selectedElement) return;

    setElementStyles(prev => ({ ...prev, [property]: value }));
    selectedElement.style[property as any] = value;
    
    // Update CSS code
    updateCSSCode();
  };

  const updateElementText = (newText: string) => {
    if (!selectedElement) return;
    
    setElementText(newText);
    selectedElement.innerText = newText;
    
    // Update HTML code
    updateHTMLCode();
  };

  const updateHTMLCode = () => {
    if (!iframeRef.current) return;
    
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;
    
    const bodyContent = iframeDoc.body.innerHTML;
    const cleanedHTML = bodyContent
      .replace(/class="[^"]*visual-editor-[^"]*[^"]*"/g, (match) => {
        return match.replace(/\s*visual-editor-\w+/g, '');
      })
      .replace(/class=""/g, '');
    
    onCodeChange('html', cleanedHTML);
  };

  const updateCSSCode = () => {
    // This is a simplified approach - in a real implementation,
    // you'd want to parse and update specific CSS rules
    const additionalCSS = selectedElement ? `
      .${selectedElement.className || selectedElement.tagName.toLowerCase()} {
        ${Object.entries(elementStyles)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
          .join('\n        ')}
      }
    ` : '';

    onCodeChange('css', generatedApp.css + additionalCSS);
  };

  const toggleEditorMode = () => {
    setIsEditorMode(!isEditorMode);
    setSelectedElement(null);
    setTimeout(() => {
      updateIframe();
    }, 100);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Eye className="w-5 h-5 text-purple-400" />
              <span>Visual Editor</span>
            </CardTitle>
            <Button
              onClick={toggleEditorMode}
              variant={isEditorMode ? "default" : "outline"}
              size="sm"
            >
              <MousePointer className="w-4 h-4 mr-2" />
              {isEditorMode ? 'Exit Editor' : 'Edit Mode'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex p-0">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Visual Editor Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
          
          {isEditorMode && (
            <div className="w-80 border-l border-prism-border bg-prism-surface/5">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Properties
                </h3>
                
                {selectedElement ? (
                  <Tabs defaultValue="text" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="text">
                        <Type className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="colors">
                        <Palette className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="layout">
                        <Code className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-4">
                      <div>
                        <Label htmlFor="text-content">Text Content</Label>
                        <Input
                          id="text-content"
                          value={elementText}
                          onChange={(e) => updateElementText(e.target.value)}
                          placeholder="Enter text..."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="font-family">Font Family</Label>
                        <Select
                          value={elementStyles.fontFamily}
                          onValueChange={(value) => updateElementStyle('fontFamily', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {fontFamilies.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font.split(',')[0]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <Input
                          id="font-size"
                          value={elementStyles.fontSize?.replace('px', '') || ''}
                          onChange={(e) => updateElementStyle('fontSize', e.target.value + 'px')}
                          placeholder="16"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="font-weight">Font Weight</Label>
                        <Select
                          value={elementStyles.fontWeight}
                          onValueChange={(value) => updateElementStyle('fontWeight', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select weight" />
                          </SelectTrigger>
                          <SelectContent>
                            {fontWeights.map((weight) => (
                              <SelectItem key={weight} value={weight}>
                                {weight}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="text-align">Text Align</Label>
                        <Select
                          value={elementStyles.textAlign}
                          onValueChange={(value) => updateElementStyle('textAlign', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select alignment" />
                          </SelectTrigger>
                          <SelectContent>
                            {textAligns.map((align) => (
                              <SelectItem key={align} value={align}>
                                {align}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="colors" className="space-y-4">
                      <div>
                        <Label htmlFor="text-color">Text Color</Label>
                        <Input
                          id="text-color"
                          type="color"
                          value={elementStyles.color || '#000000'}
                          onChange={(e) => updateElementStyle('color', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bg-color">Background Color</Label>
                        <Input
                          id="bg-color"
                          type="color"
                          value={elementStyles.backgroundColor || '#ffffff'}
                          onChange={(e) => updateElementStyle('backgroundColor', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="border">Border</Label>
                        <Input
                          id="border"
                          value={elementStyles.border || ''}
                          onChange={(e) => updateElementStyle('border', e.target.value)}
                          placeholder="1px solid #000000"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="border-radius">Border Radius</Label>
                        <Input
                          id="border-radius"
                          value={elementStyles.borderRadius?.replace('px', '') || ''}
                          onChange={(e) => updateElementStyle('borderRadius', e.target.value + 'px')}
                          placeholder="4"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="layout" className="space-y-4">
                      <div>
                        <Label htmlFor="padding">Padding</Label>
                        <Input
                          id="padding"
                          value={elementStyles.padding || ''}
                          onChange={(e) => updateElementStyle('padding', e.target.value)}
                          placeholder="10px"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="margin">Margin</Label>
                        <Input
                          id="margin"
                          value={elementStyles.margin || ''}
                          onChange={(e) => updateElementStyle('margin', e.target.value)}
                          placeholder="10px"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center text-prism-text-muted py-8">
                    <MousePointer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click on an element in the preview to edit its properties</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualEditor;


import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, MousePointer, Type, Palette, Layout, Save, Undo, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VisualEditorProps {
  html: string;
  css: string;
  javascript: string;
  onCodeChange: (type: 'html' | 'css' | 'javascript', content: string) => void;
}

interface SelectedElement {
  element: HTMLElement;
  tagName: string;
  className: string;
  id: string;
  styles: CSSStyleDeclaration;
}

const VisualEditor = ({ html, css, javascript, onCodeChange }: VisualEditorProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [originalHtml, setOriginalHtml] = useState(html);
  const [originalCss, setOriginalCss] = useState(css);
  const { toast } = useToast();

  useEffect(() => {
    if (iframeRef.current) {
      setupIframe();
    }
  }, [html, css, javascript, isEditMode]);

  const setupIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

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
          ${css}
          ${isEditMode ? `
            .visual-editor-highlight {
              outline: 2px dashed #3b82f6 !important;
              outline-offset: 2px !important;
            }
            .visual-editor-selected {
              outline: 2px solid #ef4444 !important;
              outline-offset: 2px !important;
            }
          ` : ''}
        </style>
      </head>
      <body>
        ${html}
        <script>
          ${javascript}
          
          ${isEditMode ? `
            document.body.addEventListener('click', function(e) {
              if (e.target === document.body) return;
              e.preventDefault();
              e.stopPropagation();
              
              // Remove previous selections
              document.querySelectorAll('.visual-editor-selected').forEach(el => {
                el.classList.remove('visual-editor-selected');
              });
              
              // Add selection to clicked element
              e.target.classList.add('visual-editor-selected');
              
              // Send element info to parent
              const elementInfo = {
                tagName: e.target.tagName,
                className: e.target.className,
                id: e.target.id,
                textContent: e.target.textContent,
                styles: window.getComputedStyle(e.target)
              };
              
              window.parent.postMessage({
                type: 'elementSelected',
                element: elementInfo
              }, '*');
            });
            
            document.body.addEventListener('mouseover', function(e) {
              if (e.target === document.body) return;
              if (!e.target.classList.contains('visual-editor-selected')) {
                e.target.classList.add('visual-editor-highlight');
              }
            });
            
            document.body.addEventListener('mouseout', function(e) {
              if (e.target === document.body) return;
              e.target.classList.remove('visual-editor-highlight');
            });
          ` : ''}
        </script>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(fullHTML);
    iframeDoc.close();
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'elementSelected') {
        setSelectedElement({
          element: null as any, // We'll work with the data instead
          tagName: event.data.element.tagName,
          className: event.data.element.className,
          id: event.data.element.id,
          styles: event.data.element.styles
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedElement(null);
    if (!isEditMode) {
      toast({
        title: "Edit Mode Activated",
        description: "Click on elements in the preview to select and edit them.",
      });
    }
  };

  const updateElementText = (newText: string) => {
    if (!selectedElement) return;

    let updatedHtml = html;
    
    // Simple text replacement - in a real implementation, you'd want more sophisticated parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Find elements by tag, class, or id and update text content
    const elements = tempDiv.querySelectorAll(selectedElement.tagName.toLowerCase());
    elements.forEach(el => {
      if (el.textContent?.trim() === selectedElement.element?.textContent?.trim()) {
        el.textContent = newText;
      }
    });
    
    updatedHtml = tempDiv.innerHTML;
    onCodeChange('html', updatedHtml);
  };

  const updateElementStyle = (property: string, value: string) => {
    if (!selectedElement) return;

    const selector = selectedElement.id 
      ? `#${selectedElement.id}`
      : selectedElement.className 
        ? `.${selectedElement.className.split(' ')[0]}`
        : selectedElement.tagName.toLowerCase();

    let updatedCss = css;
    
    // Check if selector already exists
    const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{[^}]*}`, 'g');
    
    if (selectorRegex.test(css)) {
      // Update existing selector
      updatedCss = css.replace(selectorRegex, (match) => {
        const propertyRegex = new RegExp(`${property}\\s*:[^;]*;?`, 'g');
        if (propertyRegex.test(match)) {
          return match.replace(propertyRegex, `${property}: ${value};`);
        } else {
          return match.replace('}', `  ${property}: ${value};\n}`);
        }
      });
    } else {
      // Add new selector
      updatedCss += `\n\n${selector} {\n  ${property}: ${value};\n}`;
    }

    onCodeChange('css', updatedCss);
  };

  const saveChanges = () => {
    setOriginalHtml(html);
    setOriginalCss(css);
    toast({
      title: "Changes Saved",
      description: "Your visual edits have been applied to the code.",
    });
  };

  const undoChanges = () => {
    onCodeChange('html', originalHtml);
    onCodeChange('css', originalCss);
    toast({
      title: "Changes Reverted",
      description: "All visual edits have been undone.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-prism-border bg-prism-surface/5">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-prism-text">Visual Editor</h3>
          {isEditMode && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Edit Mode Active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleEditMode}
            variant={isEditMode ? "default" : "outline"}
            size="sm"
          >
            {isEditMode ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </>
            ) : (
              <>
                <MousePointer className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          <Button onClick={saveChanges} size="sm" disabled={!isEditMode}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={undoChanges} size="sm" variant="outline">
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Preview Area */}
        <div className="flex-1 p-4">
          <div className="h-full border border-prism-border rounded-lg overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Visual Editor Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        {/* Properties Panel */}
        {isEditMode && (
          <div className="w-80 border-l border-prism-border bg-prism-surface/5">
            <div className="p-4">
              {selectedElement ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Code className="w-4 h-4" />
                      <span>{selectedElement.tagName.toLowerCase()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text" className="text-xs">
                          <Type className="w-3 h-3 mr-1" />
                          Text
                        </TabsTrigger>
                        <TabsTrigger value="style" className="text-xs">
                          <Palette className="w-3 h-3 mr-1" />
                          Style
                        </TabsTrigger>
                        <TabsTrigger value="layout" className="text-xs">
                          <Layout className="w-3 h-3 mr-1" />
                          Layout
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="text" className="space-y-3">
                        <div>
                          <Label htmlFor="text-content" className="text-xs">Content</Label>
                          <Input
                            id="text-content"
                            placeholder="Enter text content"
                            className="text-xs"
                            onBlur={(e) => updateElementText(e.target.value)}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="style" className="space-y-3">
                        <div>
                          <Label htmlFor="color" className="text-xs">Text Color</Label>
                          <Input
                            id="color"
                            type="color"
                            className="h-8"
                            onChange={(e) => updateElementStyle('color', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bg-color" className="text-xs">Background</Label>
                          <Input
                            id="bg-color"
                            type="color"
                            className="h-8"
                            onChange={(e) => updateElementStyle('background-color', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="font-size" className="text-xs">Font Size</Label>
                          <Select onValueChange={(value) => updateElementStyle('font-size', value)}>
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12px">12px</SelectItem>
                              <SelectItem value="14px">14px</SelectItem>
                              <SelectItem value="16px">16px</SelectItem>
                              <SelectItem value="18px">18px</SelectItem>
                              <SelectItem value="20px">20px</SelectItem>
                              <SelectItem value="24px">24px</SelectItem>
                              <SelectItem value="32px">32px</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>

                      <TabsContent value="layout" className="space-y-3">
                        <div>
                          <Label htmlFor="margin" className="text-xs">Margin</Label>
                          <Input
                            id="margin"
                            placeholder="e.g., 10px"
                            className="text-xs"
                            onBlur={(e) => updateElementStyle('margin', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="padding" className="text-xs">Padding</Label>
                          <Input
                            id="padding"
                            placeholder="e.g., 15px"
                            className="text-xs"
                            onBlur={(e) => updateElementStyle('padding', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="border-radius" className="text-xs">Border Radius</Label>
                          <Input
                            id="border-radius"
                            placeholder="e.g., 8px"
                            className="text-xs"
                            onBlur={(e) => updateElementStyle('border-radius', e.target.value)}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <MousePointer className="w-8 h-8 text-prism-text-muted mx-auto mb-3" />
                    <p className="text-sm text-prism-text-muted">
                      Click on any element in the preview to edit its properties
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualEditor;


import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eraser, Pen, Square, Circle, ArrowRight, Undo, Redo, Palette } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content_encrypted: string;
  topic_tags: string[];
  linked_notes: string[];
  whiteboard_data: any;
  created_at: string;
  updated_at: string;
}

interface WhiteboardCanvasProps {
  note: Note | null;
  onSave: (whiteboardData: any) => void;
  theme: any;
}

const WhiteboardCanvas = ({ note, onSave, theme }: WhiteboardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow'>('pen');
  const [color, setColor] = useState('#3F51B5');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = ['#3F51B5', '#009688', '#FF5722', '#4CAF50', '#FFC107', '#9C27B0', '#000000'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load existing whiteboard data if available
    if (note?.whiteboard_data) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = note.whiteboard_data;
    } else {
      // Clear canvas with theme-appropriate background
      ctx.fillStyle = theme.cardBg === 'bg-white' ? '#FFFFFF' : '#1E1E1E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, [note, theme]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = tool === 'eraser' ? (theme.cardBg === 'bg-white' ? '#FFFFFF' : '#1E1E1E') : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = theme.cardBg === 'bg-white' ? '#FFFFFF' : '#1E1E1E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    onSave(dataURL);
  };

  return (
    <div className={`p-6 h-full ${theme.bg}`}>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className={`${theme.cardBg} ${theme.border} border rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Tools */}
              <Button
                onClick={() => setTool('pen')}
                variant={tool === 'pen' ? 'default' : 'ghost'}
                size="sm"
                className={tool === 'pen' ? `${theme.accent} text-white` : theme.text}
              >
                <Pen className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setTool('eraser')}
                variant={tool === 'eraser' ? 'default' : 'ghost'}
                size="sm"
                className={tool === 'eraser' ? `${theme.accent} text-white` : theme.text}
              >
                <Eraser className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setTool('rectangle')}
                variant={tool === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                className={tool === 'rectangle' ? `${theme.accent} text-white` : theme.text}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setTool('circle')}
                variant={tool === 'circle' ? 'default' : 'ghost'}
                size="sm"
                className={tool === 'circle' ? `${theme.accent} text-white` : theme.text}
              >
                <Circle className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Colors */}
              <div className="flex items-center space-x-1">
                <Palette className={`w-4 h-4 ${theme.textMuted}`} />
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      color === c ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Line width */}
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-20"
              />
              <span className={`text-sm ${theme.textMuted}`}>{lineWidth}px</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={undo} variant="ghost" size="sm" disabled={historyIndex <= 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button onClick={redo} variant="ghost" size="sm" disabled={historyIndex >= history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
              <Button onClick={clearCanvas} variant="ghost" size="sm">
                Clear
              </Button>
              <Button onClick={handleSave} className={`${theme.accent} text-white`}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className={`flex-1 ${theme.cardBg} ${theme.border} border rounded-lg overflow-hidden`}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className={`mt-2 text-xs ${theme.textMuted}`}>
          💡 Use the whiteboard for sketching, wireframing, mind mapping, and visual brainstorming
        </div>
      </div>
    </div>
  );
};

export default WhiteboardCanvas;

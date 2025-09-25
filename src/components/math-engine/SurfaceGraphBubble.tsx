import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import MathRenderer from '@/components/math-assistant/MathRenderer';
import { Graph3DResult } from '@/services/graphing3dService';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface SurfaceGraphBubbleProps {
  summary: string;
  result: Graph3DResult;
}

const SurfaceGraphBubble: React.FC<SurfaceGraphBubbleProps> = ({ summary, result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const layout = useMemo(
    () => ({
      autosize: true,
      paper_bgcolor: 'rgba(15,23,42,0.92)',
      plot_bgcolor: 'rgba(15,23,42,0.92)',
      margin: { l: 50, r: 20, t: 30, b: 40 },
      scene: {
        xaxis: {
          title: 'x',
          zerolinecolor: '#ffffff',
          gridcolor: 'rgba(255,255,255,0.15)',
          color: '#ffffff',
        },
        yaxis: {
          title: 'y',
          zerolinecolor: '#ffffff',
          gridcolor: 'rgba(255,255,255,0.15)',
          color: '#ffffff',
        },
        zaxis: {
          title: 'z',
          zerolinecolor: '#ffffff',
          gridcolor: 'rgba(255,255,255,0.15)',
          color: '#ffffff',
        },
        camera: {
          eye: { x: 1.4, y: 1.6, z: 1.2 },
        },
      },
      showlegend: false,
    }),
    []
  );

  const handleResetView = () => {
    setRefreshToken((token) => token + 1);
  };

  return (
    <div className="space-y-4">
      <MathRenderer content={summary} className="text-sm leading-relaxed text-foreground/90" />

      <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="text-sm font-semibold text-foreground">Interactive 3D surface</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              x ∈ [{result.xRange[0].toFixed(2)}, {result.xRange[1].toFixed(2)}] • y ∈ [{result.yRange[0].toFixed(2)}, {result.yRange[1].toFixed(2)}]
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Expression: <span className="font-medium text-foreground/90">z = {result.expression}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleResetView} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reset view
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="gap-2"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        <div className={`transition-all ${isExpanded ? 'h-[520px]' : 'h-[360px]'} px-2 py-2`}> 
          <Plot
            key={refreshToken}
            data={[
              {
                type: 'surface',
                x: result.xValues,
                y: result.yValues,
                z: result.zMatrix,
                colorscale: 'Viridis',
                showscale: true,
                lighting: {
                  ambient: 0.6,
                  diffuse: 0.8,
                  specular: 0.2,
                  roughness: 0.9,
                },
                contours: {
                  z: {
                    show: true,
                    usecolormap: true,
                    highlightcolor: '#ffffff',
                  },
                },
              },
            ]}
            layout={layout}
            style={{ width: '100%', height: '100%' }}
            config={{
              displaylogo: false,
              responsive: true,
              toImageButtonOptions: {
                filename: `math-engine-surface-${Date.now()}`,
                scale: 2,
              },
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            }}
            useResizeHandler
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SurfaceGraphBubble;

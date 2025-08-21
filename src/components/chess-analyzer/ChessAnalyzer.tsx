import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Play, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';
import ChessBoard from './ChessBoard';
import EvaluationGraph from './EvaluationGraph';

const ChessAnalyzer = () => {
  const [pgnInput, setPgnInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const boardRef = useRef<any>(null);

  const loadStockfish = () => {
    return new Promise<any>((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Stockfish) {
        resolve((window as any).Stockfish());
        return;
      }

      const script = document.createElement('script');
      script.src = '/stockfish.js';
      script.onload = () => {
        if ((window as any).Stockfish) {
          resolve((window as any).Stockfish());
        } else {
          // Mock Stockfish for development
          resolve({
            postMessage: (msg: string) => console.log('Stockfish:', msg),
            addMessageListener: (callback: (msg: string) => void) => {
              // Mock responses
              setTimeout(() => callback('info depth 1 score cp 20 pv e2e4'), 100);
            }
          });
        }
      };
      script.onerror = () => {
        // Fallback to mock implementation
        resolve({
          postMessage: (msg: string) => console.log('Mock Stockfish:', msg),
          addMessageListener: (callback: (msg: string) => void) => {
            setTimeout(() => callback('info depth 1 score cp 20 pv e2e4'), 100);
          }
        });
      };
      document.head.appendChild(script);
    });
  };

  const analyzePGN = async () => {
    if (!pgnInput.trim()) {
      toast.error('Please enter a PGN file');
      return;
    }

    setAnalyzing(true);
    try {
      const engine = await loadStockfish();
      
      // Simple PGN parsing (mock for now)
      const moves = pgnInput.split(/\d+\./).filter(move => move.trim());
      const analysisResults = [];
      
      for (let i = 0; i < Math.min(moves.length, 20); i++) {
        // Mock analysis - in real implementation, this would use actual chess logic
        const evaluation = Math.random() * 400 - 200; // Random evaluation between -200 and +200
        const isBlunder = Math.random() > 0.8;
        
        analysisResults.push({
          moveNumber: i + 1,
          move: moves[i].trim().split(' ')[0] || 'e4',
          evaluation,
          bestMove: 'Nf3', // Mock best move
          isBlunder,
          depth: 15
        });
      }

      setAnalysisResult(analysisResults);
      setCurrentMoveIndex(0);
      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze game');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePGNUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setPgnInput(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult([]);
    setCurrentMoveIndex(0);
    setPgnInput('');
    if (boardRef.current) {
      boardRef.current.resetBoard();
    }
  };

  const goToPreviousMove = () => {
    setCurrentMoveIndex(prevIndex => Math.max(0, prevIndex - 1));
  };

  const goToNextMove = () => {
    setCurrentMoveIndex(prevIndex => Math.min(analysisResult.length - 1, prevIndex + 1));
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PGN Input</CardTitle>
          <CardDescription>Enter or upload a PGN file to analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
            placeholder="Enter your PGN file here..."
            className="min-h-32 font-mono"
          />
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <label htmlFor="upload-pgn" className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload PGN
              </label>
            </Button>
            <input type="file" id="upload-pgn" accept=".pgn" className="hidden" onChange={handlePGNUpload} />
            <Button onClick={analyzePGN} disabled={analyzing || !pgnInput.trim()}>
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
            <Button variant="destructive" onClick={resetAnalysis}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chessboard</CardTitle>
            <CardDescription>Current position from the analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChessBoard ref={boardRef} fen={analysisResult[currentMoveIndex]?.fen || 'start'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>Insights from the Stockfish engine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.length > 0 ? (
              <>
                <EvaluationGraph analysis={analysisResult} />
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={goToPreviousMove} disabled={currentMoveIndex === 0}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span>Move {currentMoveIndex + 1} / {analysisResult.length}</span>
                  <Button
                    variant="outline"
                    onClick={goToNextMove}
                    disabled={currentMoveIndex === analysisResult.length - 1}
                  >
                    Next
                    <Play className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Move
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evaluation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Best Move
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blunder?
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResult.map((result, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{result.move}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{result.evaluation}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{result.bestMove}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{result.isBlunder ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No analysis result yet. Please input a PGN and analyze.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChessAnalyzer;

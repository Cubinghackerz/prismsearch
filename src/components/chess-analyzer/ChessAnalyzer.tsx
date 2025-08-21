
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Play, Pause, SkipBack, SkipForward, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ChessBoard from './ChessBoard';
import EvaluationGraph from './EvaluationGraph';

interface Move {
  san: string;
  evaluation: number;
  bestMove?: string;
  classification: 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  fen: string;
  moveNumber: number;
}

const ChessAnalyzer = () => {
  const [pgn, setPgn] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Move[]>([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [progress, setProgress] = useState(0);
  const stockfishWorker = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Stockfish worker
    try {
      stockfishWorker.current = new Worker('/stockfish.js');
      stockfishWorker.current.onmessage = handleStockfishMessage;
      toast.success('Chess engine loaded');
    } catch (error) {
      console.error('Failed to load Stockfish:', error);
      toast.error('Chess engine failed to load');
    }

    return () => {
      if (stockfishWorker.current) {
        stockfishWorker.current.terminate();
      }
    };
  }, []);

  const handleStockfishMessage = (event: MessageEvent) => {
    const message = event.data;
    console.log('Stockfish:', message);
    // Handle Stockfish responses here
  };

  const analyzeGame = async () => {
    if (!pgn.trim()) {
      toast.error('Please enter a PGN');
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    
    try {
      // Parse PGN and analyze moves
      const Chess = (await import('chess.js')).Chess;
      const chess = new Chess();
      
      // Load the PGN
      const loaded = chess.loadPgn(pgn);
      if (!loaded) {
        throw new Error('Invalid PGN format');
      }

      // Get the moves
      const history = chess.history({ verbose: true });
      const moves: Move[] = [];

      // Reset to start position
      chess.reset();

      for (let i = 0; i < history.length; i++) {
        const move = history[i];
        
        // Make the move
        chess.move(move);
        
        // Simulate Stockfish analysis (in real implementation, you'd use actual Stockfish)
        const evaluation = Math.random() * 4 - 2; // Random evaluation between -2 and 2
        const classification = getClassification(evaluation);
        
        moves.push({
          san: move.san,
          evaluation,
          bestMove: 'Nf3', // This would come from Stockfish
          classification,
          fen: chess.fen(),
          moveNumber: Math.ceil((i + 1) / 2)
        });

        setProgress(((i + 1) / history.length) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setAnalysis(moves);
      setCurrentMove(0);
      toast.success('Game analysis completed');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze game');
    } finally {
      setAnalyzing(false);
    }
  };

  const getClassification = (evaluation: number): Move['classification'] => {
    const absEval = Math.abs(evaluation);
    if (absEval < 0.5) return 'excellent';
    if (absEval < 1) return 'good';
    if (absEval < 1.5) return 'inaccuracy';
    if (absEval < 2.5) return 'mistake';
    return 'blunder';
  };

  const getClassificationColor = (classification: Move['classification']) => {
    switch (classification) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'inaccuracy': return 'bg-yellow-500';
      case 'mistake': return 'bg-orange-500';
      case 'blunder': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const samplePgn = `[Event "World Championship"]
[Site "New York"]
[Date "2021.11.26"]
[Round "1"]
[White "Carlsen, Magnus"]
[Black "Nepomniachtchi, Ian"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Nb8 10.d4 Nbd7 11.c4 c6 12.cxb5 axb5 13.Nc3 Bb7 14.Bg5 b4 15.Nb1 h6 16.Bh4 c5 17.dxe5 Nxe5 18.Nxe5 dxe5 19.Bxf6 Bxf6 20.Nd2 1-0`;

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Chess Analyzer
        </h1>
        <p className="text-xl text-muted-foreground">
          Analyze chess games with Stockfish engine
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              PGN Input
            </CardTitle>
            <CardDescription>
              Paste your PGN or use the sample game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={pgn}
              onChange={(e) => setPgn(e.target.value)}
              placeholder="Paste your PGN here..."
              className="min-h-32 font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={analyzeGame} disabled={analyzing || !pgn.trim()}>
                {analyzing ? 'Analyzing...' : 'Analyze Game'}
              </Button>
              <Button variant="outline" onClick={() => setPgn(samplePgn)}>
                Load Sample
              </Button>
            </div>
            {analyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing moves...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total Moves: {analysis.length}</div>
                  <div>Current: {currentMove + 1}</div>
                  <div className="flex items-center gap-2">
                    Blunders: 
                    <Badge variant="destructive">
                      {analysis.filter(m => m.classification === 'blunder').length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    Mistakes: 
                    <Badge variant="secondary">
                      {analysis.filter(m => m.classification === 'mistake').length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCurrentMove(0)}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCurrentMove(Math.max(0, currentMove - 1))}
                    disabled={currentMove === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCurrentMove(Math.min(analysis.length - 1, currentMove + 1))}
                    disabled={currentMove === analysis.length - 1}
                  >
                    Next
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCurrentMove(analysis.length - 1)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No game analyzed yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {analysis.length > 0 && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chess Board</CardTitle>
              </CardHeader>
              <CardContent>
                <ChessBoard 
                  fen={analysis[currentMove]?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Move Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis[currentMove] && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Move</div>
                        <div className="font-bold text-lg">{analysis[currentMove].san}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Evaluation</div>
                        <div className="font-bold text-lg">
                          {analysis[currentMove].evaluation > 0 ? '+' : ''}{analysis[currentMove].evaluation.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Classification</div>
                      <Badge className={getClassificationColor(analysis[currentMove].classification)}>
                        {analysis[currentMove].classification}
                      </Badge>
                    </div>
                    
                    {analysis[currentMove].bestMove && (
                      <div>
                        <div className="text-sm text-muted-foreground">Best Move</div>
                        <div className="font-mono">{analysis[currentMove].bestMove}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <EvaluationGraph moves={analysis} currentMove={currentMove} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Move List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {analysis.map((move, index) => (
                  <Button
                    key={index}
                    variant={index === currentMove ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentMove(index)}
                    className="justify-between h-auto p-2"
                  >
                    <span className="font-mono">{move.moveNumber}. {move.san}</span>
                    <div className="flex items-center gap-1">
                      {move.classification === 'blunder' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      {move.classification === 'excellent' && <CheckCircle className="h-3 w-3 text-green-500" />}
                      <span className="text-xs">{move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(1)}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ChessAnalyzer;

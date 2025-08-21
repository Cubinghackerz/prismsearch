
import React, { useEffect, useRef } from 'react';

interface ChessBoardProps {
  fen: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ fen }) => {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boardRef.current) return;

    // Simple chess board renderer
    const renderBoard = () => {
      const board = boardRef.current!;
      board.innerHTML = '';
      
      // Parse FEN to get piece positions
      const fenParts = fen.split(' ');
      const position = fenParts[0];
      const rows = position.split('/');
      
      const pieceSymbols: { [key: string]: string } = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
      };

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          const isLight = (row + col) % 2 === 0;
          square.className = `w-12 h-12 flex items-center justify-center text-2xl font-bold ${
            isLight ? 'bg-amber-100' : 'bg-amber-800'
          }`;
          
          // Parse piece at this position
          const rowData = rows[row];
          let colIndex = 0;
          let piece = '';
          
          for (const char of rowData) {
            if (char >= '1' && char <= '8') {
              const emptySquares = parseInt(char);
              if (colIndex <= col && col < colIndex + emptySquares) {
                piece = '';
                break;
              }
              colIndex += emptySquares;
            } else {
              if (colIndex === col) {
                piece = pieceSymbols[char] || '';
                break;
              }
              colIndex++;
            }
          }
          
          square.textContent = piece;
          board.appendChild(square);
        }
      }
    };

    renderBoard();
  }, [fen]);

  return (
    <div className="inline-block border-2 border-gray-800">
      <div 
        ref={boardRef}
        className="grid grid-cols-8 gap-0"
        style={{ width: '384px', height: '384px' }}
      />
    </div>
  );
};

export default ChessBoard;

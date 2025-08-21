
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Move {
  san: string;
  evaluation: number;
  classification: string;
  moveNumber: number;
}

interface EvaluationGraphProps {
  moves: Move[];
  currentMove: number;
}

const EvaluationGraph: React.FC<EvaluationGraphProps> = ({ moves, currentMove }) => {
  const data = moves.map((move, index) => ({
    move: index + 1,
    evaluation: move.evaluation,
    isBlunder: move.classification === 'blunder',
    isCurrent: index === currentMove,
    san: move.san
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (payload.isBlunder) {
      return <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />;
    }
    
    if (payload.isCurrent) {
      return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />;
    }
    
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="move" 
            label={{ value: 'Move Number', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Evaluation', angle: -90, position: 'insideLeft' }}
            domain={[-3, 3]}
          />
          <Tooltip 
            formatter={(value: any, name: any, props: any) => [
              `${value > 0 ? '+' : ''}${value.toFixed(2)}`,
              'Evaluation'
            ]}
            labelFormatter={(label: any, payload: any) => {
              const move = payload?.[0]?.payload;
              return move ? `Move ${label}: ${move.san}` : `Move ${label}`;
            }}
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
          <Line 
            type="monotone" 
            dataKey="evaluation" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvaluationGraph;

import { type StockPrediction } from '../backend';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';

interface StockPriceChartProps {
  symbol: string;
  predictions: StockPrediction[];
}

export default function StockPriceChart({ symbol, predictions }: StockPriceChartProps) {
  if (predictions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No price data available</p>
      </div>
    );
  }

  // Sort predictions by timestamp
  const sortedPredictions = [...predictions]
    .sort((a, b) => Number(a.timestamp - b.timestamp))
    .slice(-60); // Last 60 data points

  const chartData = sortedPredictions.map((pred, index) => {
    const date = new Date(Number(pred.timestamp) / 1000000);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Number(pred.predictionScore.toFixed(2)),
      confidence: Number((pred.confidenceLevel * 100).toFixed(0)),
      index,
      patterns: pred.chartPatterns,
    };
  });

  // Find points with patterns for annotations
  const patternPoints = chartData.filter(d => d.patterns.length > 0);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="oklch(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="oklch(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'Prediction Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(var(--card))',
              border: '1px solid oklch(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'oklch(var(--foreground))' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold">{data.date}</p>
                    <p className="text-sm">Score: {data.score}</p>
                    <p className="text-sm">Confidence: {data.confidence}%</p>
                    {data.patterns.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs font-semibold">Patterns:</p>
                        {data.patterns.map((p: any, i: number) => (
                          <p key={i} className="text-xs">{p.patternName}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="oklch(var(--chart-1))"
            strokeWidth={2}
            name="Prediction Score"
            dot={{ r: 2 }}
          />
          
          {/* Pattern annotations */}
          {patternPoints.map((point, idx) => (
            <ReferenceDot
              key={idx}
              x={point.date}
              y={point.score}
              r={6}
              fill="oklch(var(--chart-4))"
              stroke="oklch(var(--background))"
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Pattern Legend */}
      {patternPoints.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">● = Chart Pattern Detected</p>
          <p>Hover over points to see pattern details</p>
        </div>
      )}
    </div>
  );
}

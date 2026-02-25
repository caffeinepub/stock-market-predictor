import { type StockPrediction } from '../backend';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface StockPriceChartProps {
  symbol: string;
  predictions: StockPrediction[];
}

export default function StockPriceChart({ symbol, predictions }: StockPriceChartProps) {
  if (predictions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No price target data available</p>
      </div>
    );
  }

  // Sort predictions by timestamp
  const sortedPredictions = [...predictions]
    .sort((a, b) => Number(a.timestamp - b.timestamp))
    .slice(-30);

  const chartData = sortedPredictions.map((pred) => {
    const date = new Date(Number(pred.timestamp) / 1000000);
    return {
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      confidence: Number((pred.confidenceScore ?? 0).toFixed(1)),
      targetLower: Number((pred.shortTermPriceTargetLower ?? 0).toFixed(0)),
      targetUpper: Number((pred.shortTermPriceTargetUpper ?? 0).toFixed(0)),
    };
  });

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="oklch(var(--muted-foreground))"
            style={{ fontSize: '11px' }}
          />
          <YAxis
            stroke="oklch(var(--muted-foreground))"
            style={{ fontSize: '11px' }}
            label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
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
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-semibold mb-1">{data.date}</p>
                    <p>Target Low: ₹{data.targetLower}</p>
                    <p>Target High: ₹{data.targetUpper}</p>
                    <p>Confidence: {data.confidence}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="targetLower"
            stroke="oklch(var(--chart-3))"
            strokeWidth={2}
            name="Target Low (₹)"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="targetUpper"
            stroke="oklch(var(--chart-1))"
            strokeWidth={2}
            name="Target High (₹)"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center">
        Short-term price target range across prediction history for {symbol}
      </p>
    </div>
  );
}

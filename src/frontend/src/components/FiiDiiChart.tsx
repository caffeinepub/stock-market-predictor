import { type StockPrediction } from '../backend';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FiiDiiChartProps {
  symbol: string;
  predictions: StockPrediction[];
}

export default function FiiDiiChart({ symbol, predictions }: FiiDiiChartProps) {
  if (predictions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No FII/DII data available</p>
      </div>
    );
  }

  // Sort predictions by timestamp and take last 30 data points
  const sortedPredictions = [...predictions]
    .sort((a, b) => Number(a.timestamp - b.timestamp))
    .slice(-30);

  const chartData = sortedPredictions.map((pred) => {
    const date = new Date(Number(pred.timestamp) / 1000000);
    const fiiNet = pred.fiiBuying - pred.fiiSelling;
    const diiNet = pred.diiBuying - pred.diiSelling;

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fiiNet: Number(fiiNet.toFixed(2)),
      diiNet: Number(diiNet.toFixed(2)),
      fiiBuying: Number(pred.fiiBuying.toFixed(2)),
      fiiSelling: Number(pred.fiiSelling.toFixed(2)),
      diiBuying: Number(pred.diiBuying.toFixed(2)),
      diiSelling: Number(pred.diiSelling.toFixed(2)),
    };
  });

  return (
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
          label={{ value: 'Net Flow (Cr)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'oklch(var(--card))',
            border: '1px solid oklch(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'oklch(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="fiiNet"
          stroke="oklch(var(--chart-2))"
          strokeWidth={2}
          name="FII Net Flow"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="diiNet"
          stroke="oklch(var(--chart-3))"
          strokeWidth={2}
          name="DII Net Flow"
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

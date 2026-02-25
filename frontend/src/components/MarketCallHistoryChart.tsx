import { type MarketCall, Variant_bullish_bearish_moderate } from '../backend';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface MarketCallHistoryChartProps {
  marketCalls: MarketCall[];
}

function callToNumeric(call: Variant_bullish_bearish_moderate): number {
  switch (call) {
    case Variant_bullish_bearish_moderate.bullish: return 1;
    case Variant_bullish_bearish_moderate.bearish: return -1;
    default: return 0;
  }
}

function callToLabel(value: number): string {
  if (value === 1) return 'Bullish';
  if (value === -1) return 'Bearish';
  return 'Moderate';
}

function getBarColor(value: number): string {
  if (value === 1) return 'oklch(0.60 0.18 145)';
  if (value === -1) return 'oklch(0.55 0.22 25)';
  return 'oklch(0.65 0.20 60)';
}

// Custom bar shape with per-bar coloring
const ColoredBar = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;
  const color = getBarColor(value);
  const barHeight = Math.abs(height);
  const barY = height < 0 ? y : y;
  return <rect x={x} y={barY} width={width} height={barHeight} fill={color} rx={2} />;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  const callPayload = payload.find((p) => p.dataKey === 'callValue');
  const confPayload = payload.find((p) => p.dataKey === 'confidence');

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {callPayload && (
        <p className="text-muted-foreground">
          Call:{' '}
          <span
            className="font-bold"
            style={{ color: getBarColor(callPayload.value) }}
          >
            {callToLabel(callPayload.value)}
          </span>
        </p>
      )}
      {confPayload && (
        <p className="text-muted-foreground">
          Confidence: <span className="font-bold text-foreground">{confPayload.value}%</span>
        </p>
      )}
    </div>
  );
};

export default function MarketCallHistoryChart({ marketCalls }: MarketCallHistoryChartProps) {
  if (!marketCalls || marketCalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Market Call History</CardTitle>
          </div>
          <CardDescription>Last 30 daily market calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No market call history available yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort ascending by timestamp, take last 30
  const sorted = [...marketCalls]
    .sort((a, b) => Number(a.timestamp - b.timestamp))
    .slice(-30);

  const chartData = sorted.map((mc) => {
    const date = new Date(Number(mc.timestamp) / 1000000);
    return {
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      callValue: callToNumeric(mc.call),
      confidence: Number(mc.confidenceScore),
      callLabel: callToLabel(callToNumeric(mc.call)),
    };
  });

  const yAxisTickFormatter = (value: number) => {
    if (value === 1) return 'Bullish';
    if (value === -1) return 'Bearish';
    if (value === 0) return 'Moderate';
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Market Call History</CardTitle>
        </div>
        <CardDescription>
          Last {chartData.length} daily market calls — Bullish / Moderate / Bearish with confidence score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="oklch(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'oklch(var(--muted-foreground))' }}
            />
            <YAxis
              yAxisId="call"
              domain={[-1.5, 1.5]}
              ticks={[-1, 0, 1]}
              tickFormatter={yAxisTickFormatter}
              stroke="oklch(var(--muted-foreground))"
              style={{ fontSize: '10px' }}
              tick={{ fill: 'oklch(var(--muted-foreground))' }}
              width={60}
            />
            <YAxis
              yAxisId="confidence"
              orientation="right"
              domain={[0, 100]}
              stroke="oklch(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'oklch(var(--muted-foreground))' }}
              label={{
                value: 'Confidence %',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: '10px', fill: 'oklch(var(--muted-foreground))' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                if (value === 'callValue') return 'Market Call';
                if (value === 'confidence') return 'Confidence %';
                return value;
              }}
            />
            <ReferenceLine yAxisId="call" y={0} stroke="oklch(var(--border))" strokeDasharray="4 4" />
            <Bar
              yAxisId="call"
              dataKey="callValue"
              name="callValue"
              shape={(props: object) => {
                const p = props as { x?: number; y?: number; width?: number; height?: number; value?: number };
                return <ColoredBar {...p} />;
              }}
              maxBarSize={40}
            />
            <Line
              yAxisId="confidence"
              type="monotone"
              dataKey="confidence"
              stroke="oklch(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 3, fill: 'oklch(var(--chart-2))' }}
              name="confidence"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'oklch(0.60 0.18 145)' }} />
            Bullish
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'oklch(0.65 0.20 60)' }} />
            Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'oklch(0.55 0.22 25)' }} />
            Bearish
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

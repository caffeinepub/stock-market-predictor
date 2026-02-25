import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { type StockPrediction } from '../backend';
import { AlertTriangle, Brain, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PredictionCardProps {
  prediction: StockPrediction | null;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No prediction data available</p>
        </CardContent>
      </Card>
    );
  }

  const direction = prediction.priceDirection;

  const getDirectionIcon = () => {
    if (direction === 'bullish') {
      return <img src="/assets/generated/icon-bullish.dim_128x128.png" alt="Bullish" className="h-16 w-16" />;
    }
    if (direction === 'bearish') {
      return <img src="/assets/generated/icon-bearish.dim_128x128.png" alt="Bearish" className="h-16 w-16" />;
    }
    return <img src="/assets/generated/icon-neutral.dim_128x128.png" alt="Neutral" className="h-16 w-16" />;
  };

  const getDirectionColor = () => {
    if (direction === 'bullish') return 'text-bullish';
    if (direction === 'bearish') return 'text-bearish';
    return 'text-neutral';
  };

  const getDirectionBg = () => {
    if (direction === 'bullish') return 'bg-bullish/10 border-bullish/30';
    if (direction === 'bearish') return 'bg-bearish/10 border-bearish/30';
    return 'bg-neutral/10 border-neutral/30';
  };

  const getDirectionLabel = () => {
    if (direction === 'bullish') return 'Bullish';
    if (direction === 'bearish') return 'Bearish';
    return 'Neutral';
  };

  const getDirectionArrow = () => {
    if (direction === 'bullish') return <TrendingUp className="h-5 w-5 text-bullish" />;
    if (direction === 'bearish') return <TrendingDown className="h-5 w-5 text-bearish" />;
    return <Minus className="h-5 w-5 text-neutral" />;
  };

  const getRiskBadgeColor = (impactLevel: number) => {
    if (impactLevel >= 0.7) return 'bg-bearish/15 text-bearish border-bearish/30';
    if (impactLevel >= 0.4) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getRiskLabel = (impactLevel: number) => {
    if (impactLevel >= 0.7) return 'High';
    if (impactLevel >= 0.4) return 'Medium';
    return 'Low';
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const confidencePercentage = Math.round(prediction.confidenceScore ?? 0);
  const targetLower = prediction.shortTermPriceTargetLower ?? 0;
  const targetUpper = prediction.shortTermPriceTargetUpper ?? 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-3xl font-bold tracking-tight">{prediction.stockSymbol}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Generated: {formatDate(prediction.timestamp)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Row: Direction + Confidence + Price Target */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Direction */}
          <div className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 ${getDirectionBg()}`}>
            {getDirectionIcon()}
            <h3 className={`text-2xl font-bold mt-3 ${getDirectionColor()}`}>
              {getDirectionLabel()}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">AI Price Direction</p>
          </div>

          {/* Confidence */}
          <div className="flex flex-col justify-center space-y-3 p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">AI Confidence</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{confidencePercentage}%</span>
            </div>
            <Progress value={confidencePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {confidencePercentage >= 75 ? 'High confidence signal' :
               confidencePercentage >= 55 ? 'Moderate confidence signal' :
               'Low confidence — exercise caution'}
            </p>
          </div>

          {/* Price Target */}
          <div className="flex flex-col justify-center space-y-3 p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Short-Term Target</span>
            </div>
            <div className="flex items-center gap-2">
              {getDirectionArrow()}
              <span className="text-xl font-bold text-foreground">
                ₹{targetLower.toFixed(0)} – ₹{targetUpper.toFixed(0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Expected price range (1–4 weeks)
            </p>
          </div>
        </div>

        {/* AI Rationale */}
        {prediction.aiRationale && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm text-primary">AI Analysis Rationale</h4>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{prediction.aiRationale}</p>
          </div>
        )}

        {/* Risk Factors */}
        {prediction.riskFactors && prediction.riskFactors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h4 className="font-semibold text-sm">Key Risk Factors</h4>
            </div>
            <div className="space-y-2">
              {prediction.riskFactors.map((risk, index) => (
                <div
                  key={index}
                  className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${getRiskBadgeColor(risk.impactLevel)}`}
                >
                  <p className="text-sm flex-1">{risk.description}</p>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs font-semibold border ${getRiskBadgeColor(risk.impactLevel)}`}
                  >
                    {getRiskLabel(risk.impactLevel)} Risk
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

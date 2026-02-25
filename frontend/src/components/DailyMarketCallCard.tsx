import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Clock, Newspaper, BarChart3, Activity, ShieldAlert } from 'lucide-react';
import type { MarketCallResult } from '../hooks/useQueries';

interface DailyMarketCallCardProps {
  marketCall: MarketCallResult;
  symbol?: string;
}

function getCallConfig(call: 'Bullish' | 'Bearish' | 'Moderate') {
  switch (call) {
    case 'Bullish':
      return {
        textClass: 'text-bullish',
        bgClass: 'bg-bullish/10',
        borderClass: 'border-bullish/40',
        badgeClass: 'bg-bullish/15 text-bullish border-bullish/30',
        icon: TrendingUp,
        iconSrc: '/assets/generated/icon-bullish.dim_128x128.png',
      };
    case 'Bearish':
      return {
        textClass: 'text-bearish',
        bgClass: 'bg-bearish/10',
        borderClass: 'border-bearish/40',
        badgeClass: 'bg-bearish/15 text-bearish border-bearish/30',
        icon: TrendingDown,
        iconSrc: '/assets/generated/icon-bearish.dim_128x128.png',
      };
    default:
      return {
        textClass: 'text-warning',
        bgClass: 'bg-warning/10',
        borderClass: 'border-warning/40',
        badgeClass: 'bg-warning/15 text-warning border-warning/30',
        icon: Minus,
        iconSrc: '/assets/generated/icon-neutral.dim_128x128.png',
      };
  }
}

function getProgressColor(score: number): string {
  if (score >= 60) return '[&>div]:bg-bullish';
  if (score <= 40) return '[&>div]:bg-bearish';
  return '[&>div]:bg-warning';
}

function getScoreLabel(score: number): string {
  if (score >= 60) return 'Bullish';
  if (score <= 40) return 'Bearish';
  return 'Moderate';
}

function getScoreColor(score: number): string {
  if (score >= 60) return 'text-bullish';
  if (score <= 40) return 'text-bearish';
  return 'text-warning';
}

export default function DailyMarketCallCard({ marketCall, symbol = 'NIFTY50' }: DailyMarketCallCardProps) {
  const config = getCallConfig(marketCall.call);
  const CallIcon = config.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const factors = [
    {
      label: 'News Sentiment',
      score: marketCall.newsSentimentScore,
      icon: Newspaper,
      weight: '30%',
    },
    {
      label: 'FII / DII Flow',
      score: marketCall.fiiDiiScore,
      icon: TrendingUp,
      weight: '30%',
    },
    {
      label: 'Chart Patterns',
      score: marketCall.chartPatternScore,
      icon: BarChart3,
      weight: '25%',
    },
    {
      label: 'Regulatory Overhang',
      score: marketCall.regulatoryScore,
      icon: ShieldAlert,
      weight: '15%',
    },
  ];

  return (
    <Card className={`border-2 ${config.borderClass} overflow-hidden`}>
      {/* Header band */}
      <div className={`${config.bgClass} px-6 py-4 border-b ${config.borderClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={config.iconSrc}
              alt={marketCall.call}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Today's Market Call · {symbol}
              </p>
              <h2 className={`text-3xl font-extrabold tracking-tight ${config.textClass}`}>
                {marketCall.call.toUpperCase()}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className={`text-2xl font-bold ${config.textClass}`}>
                {marketCall.confidence.toFixed(0)}%
              </p>
            </div>
            <Badge variant="outline" className={`text-sm font-bold border px-3 py-1 ${config.badgeClass}`}>
              <CallIcon className="h-4 w-4 mr-1.5" />
              {marketCall.call}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="pt-5 pb-5 space-y-5">
        {/* Factor Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Factor Breakdown</h3>
            <span className="text-xs text-muted-foreground ml-1">(weighted composite score)</span>
          </div>
          <div className="space-y-3">
            {factors.map((factor) => {
              const FactorIcon = factor.icon;
              return (
                <div key={factor.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FactorIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">{factor.label}</span>
                      <span className="text-xs text-muted-foreground/60">({factor.weight})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${getScoreColor(factor.score)}`}>
                        {getScoreLabel(factor.score)}
                      </span>
                      <span className={`font-bold w-10 text-right ${getScoreColor(factor.score)}`}>
                        {factor.score.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={factor.score}
                    className={`h-2 ${getProgressColor(factor.score)}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Rationale */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            AI Rationale
          </p>
          <p className="text-sm text-foreground leading-relaxed">{marketCall.rationale}</p>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Last updated: {formatTime(marketCall.generatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

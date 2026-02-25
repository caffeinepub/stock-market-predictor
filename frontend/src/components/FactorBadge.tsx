import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Newspaper,
  Building2,
  Globe,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  BarChart2,
  Minus,
} from 'lucide-react';

export type FactorSentiment = 'positive' | 'negative' | 'neutral';

interface FactorBadgeProps {
  label: string;
  value: string;
  sentiment: FactorSentiment;
  icon?: 'news' | 'fii' | 'global' | 'world' | 'regulatory' | 'sector';
}

const iconMap = {
  news: Newspaper,
  fii: Building2,
  global: Globe,
  world: BarChart2,
  regulatory: ShieldAlert,
  sector: TrendingUp,
};

const sentimentConfig: Record<FactorSentiment, { bg: string; text: string; border: string; dot: string }> = {
  positive: {
    bg: 'bg-bullish/10',
    text: 'text-bullish',
    border: 'border-bullish/25',
    dot: 'bg-bullish',
  },
  negative: {
    bg: 'bg-bearish/10',
    text: 'text-bearish',
    border: 'border-bearish/25',
    dot: 'bg-bearish',
  },
  neutral: {
    bg: 'bg-muted/50',
    text: 'text-muted-foreground',
    border: 'border-border',
    dot: 'bg-muted-foreground',
  },
};

export function FactorBadge({ label, value, sentiment, icon = 'news' }: FactorBadgeProps) {
  const Icon = iconMap[icon];
  const cfg = sentimentConfig[sentiment];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 border text-xs font-medium cursor-default select-none ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            <Icon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[56px]">{label}</span>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[180px]">
          <p className="font-semibold mb-0.5">{label}</p>
          <p className="text-muted-foreground">{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Map a numeric news sentiment score (-1 to 1) to a FactorSentiment */
export function sentimentFromScore(score: number): FactorSentiment {
  if (score > 0.2) return 'positive';
  if (score < -0.2) return 'negative';
  return 'neutral';
}

/** Map a buy/sell/neutral enum string to a FactorSentiment */
export function sentimentFromFiiFlow(flow: string): FactorSentiment {
  if (flow === 'buy') return 'positive';
  if (flow === 'sell') return 'negative';
  return 'neutral';
}

/** Map a bullish/bearish/neutral enum string to a FactorSentiment */
export function sentimentFromTrend(trend: string): FactorSentiment {
  if (trend === 'bullish') return 'positive';
  if (trend === 'bearish') return 'negative';
  return 'neutral';
}

/** Map a positive/negative/neutral enum string to a FactorSentiment */
export function sentimentFromSignal(signal: string): FactorSentiment {
  if (signal === 'positive') return 'positive';
  if (signal === 'negative') return 'negative';
  return 'neutral';
}

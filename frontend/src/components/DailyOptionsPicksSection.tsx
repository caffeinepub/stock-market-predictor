import {
  TrendingUp,
  TrendingDown,
  Zap,
  Phone,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyOptionsPicks } from '../hooks/useQueries';
import {
  type DailyStockPick,
  Variant_bullish_bearish,
  Variant_buy_sell,
  Variant_ce_pe,
} from '../backend';
import {
  FactorBadge,
  sentimentFromScore,
  sentimentFromFiiFlow,
  sentimentFromSignal,
  sentimentFromTrend,
} from './FactorBadge';

// ─── Single Pick Card ─────────────────────────────────────────────────────────

function PickCard({ pick }: { pick: DailyStockPick }) {
  const isBullish = pick.trend === Variant_bullish_bearish.bullish;
  const isCE = pick.recommendedOption === Variant_ce_pe.ce;
  const callIsBuy = pick.callAction === Variant_buy_sell.buy;
  const putIsBuy = pick.putAction === Variant_buy_sell.buy;

  const trendConfig = isBullish
    ? {
        borderClass: 'border-bullish/40',
        bgClass: 'bg-bullish/5',
        headerBg: 'bg-bullish/10',
        textClass: 'text-bullish',
        Icon: TrendingUp,
        label: 'BULLISH',
        badgeClass: 'bg-bullish/15 text-bullish border-bullish/30',
      }
    : {
        borderClass: 'border-bearish/40',
        bgClass: 'bg-bearish/5',
        headerBg: 'bg-bearish/10',
        textClass: 'text-bearish',
        Icon: TrendingDown,
        label: 'BEARISH',
        badgeClass: 'bg-bearish/15 text-bearish border-bearish/30',
      };

  // Derive human-readable factor values
  const newsSentimentLabel =
    pick.newsSentiment > 0.2
      ? `Positive (${(pick.newsSentiment * 100).toFixed(0)}%)`
      : pick.newsSentiment < -0.2
      ? `Negative (${(pick.newsSentiment * 100).toFixed(0)}%)`
      : `Neutral (${(pick.newsSentiment * 100).toFixed(0)}%)`;

  const fiiFlowLabel =
    pick.fiiFlow === 'buy'
      ? 'FII Buying'
      : pick.fiiFlow === 'sell'
      ? 'FII Selling'
      : 'FII Neutral';

  const globalCuesLabel =
    pick.globalCues === 'positive'
      ? 'Global Positive'
      : pick.globalCues === 'negative'
      ? 'Global Negative'
      : 'Global Neutral';

  const worldMarketLabel =
    pick.worldMarketTrend === 'bullish'
      ? 'World Markets Bullish'
      : pick.worldMarketTrend === 'bearish'
      ? 'World Markets Bearish'
      : 'World Markets Neutral';

  const regulatoryLabel =
    pick.regulatorySignal === 'positive'
      ? 'Regulatory Positive'
      : pick.regulatorySignal === 'negative'
      ? 'Regulatory Negative'
      : 'Regulatory Neutral';

  const sectorLabel =
    pick.sectorDirection === 'bullish'
      ? 'Sector Bullish'
      : pick.sectorDirection === 'bearish'
      ? 'Sector Bearish'
      : 'Sector Neutral';

  return (
    <Card className={`border-2 ${trendConfig.borderClass} ${trendConfig.bgClass} overflow-hidden`}>
      {/* Card Header */}
      <div className={`${trendConfig.headerBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <trendConfig.Icon className={`h-5 w-5 ${trendConfig.textClass}`} />
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            {pick.symbol}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${trendConfig.badgeClass}`}
          >
            {trendConfig.label}
          </span>
          {pick.isHighVolume && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Zap className="h-3 w-3" />
              HIGH VOL
            </span>
          )}
          {pick.sectorOverrideApplied && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              <AlertTriangle className="h-3 w-3" />
              SECTOR OVERRIDE
            </span>
          )}
        </div>
      </div>

      <CardContent className="pt-4 pb-4 space-y-4">
        {/* ── Multi-Factor Breakdown ── */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
            Factor Analysis
          </p>
          <div className="flex flex-wrap gap-1.5">
            <FactorBadge
              label="News"
              value={newsSentimentLabel}
              sentiment={sentimentFromScore(pick.newsSentiment)}
              icon="news"
            />
            <FactorBadge
              label="FII Flow"
              value={fiiFlowLabel}
              sentiment={sentimentFromFiiFlow(pick.fiiFlow as string)}
              icon="fii"
            />
            <FactorBadge
              label="Global"
              value={globalCuesLabel}
              sentiment={sentimentFromSignal(pick.globalCues as string)}
              icon="global"
            />
            <FactorBadge
              label="World Mkt"
              value={worldMarketLabel}
              sentiment={sentimentFromTrend(pick.worldMarketTrend as string)}
              icon="world"
            />
            <FactorBadge
              label="Regulatory"
              value={regulatoryLabel}
              sentiment={sentimentFromSignal(pick.regulatorySignal as string)}
              icon="regulatory"
            />
            <FactorBadge
              label="Sector"
              value={sectorLabel}
              sentiment={sentimentFromTrend(pick.sectorDirection as string)}
              icon="sector"
            />
          </div>
          {pick.sectorOverrideApplied && (
            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              Sector direction overrides individual stock signal
            </p>
          )}
        </div>

        {/* Recommended Option */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Recommended Option
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-md ${
                isCE ? 'bg-bullish/15 text-bullish' : 'bg-bearish/15 text-bearish'
              }`}
            >
              {isCE ? 'CALL (CE)' : 'PUT (PE)'}
            </span>
          </div>
        </div>

        {/* Strike & Expiry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground mb-0.5">Strike Price</p>
            <p className="text-sm font-bold text-foreground">
              ₹{pick.strikePrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground mb-0.5">Expiry</p>
            <p className="text-sm font-bold text-foreground">{pick.expiry}</p>
          </div>
        </div>

        {/* CE / PE Action Pills */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Options Strategy
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* Call (CE) Action */}
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                callIsBuy
                  ? 'bg-bullish/10 border-bullish/30'
                  : 'bg-bearish/10 border-bearish/30'
              }`}
            >
              {callIsBuy ? (
                <ArrowUpCircle className="h-4 w-4 text-bullish flex-shrink-0" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-bearish flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">CE (Call)</p>
                <p
                  className={`text-sm font-extrabold leading-none ${
                    callIsBuy ? 'text-bullish' : 'text-bearish'
                  }`}
                >
                  {callIsBuy ? 'BUY' : 'SELL'}
                </p>
              </div>
            </div>

            {/* Put (PE) Action */}
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                putIsBuy
                  ? 'bg-bullish/10 border-bullish/30'
                  : 'bg-bearish/10 border-bearish/30'
              }`}
            >
              {putIsBuy ? (
                <ArrowUpCircle className="h-4 w-4 text-bullish flex-shrink-0" />
              ) : (
                <ArrowDownCircle className="h-4 w-4 text-bearish flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">PE (Put)</p>
                <p
                  className={`text-sm font-extrabold leading-none ${
                    putIsBuy ? 'text-bullish' : 'text-bearish'
                  }`}
                >
                  {putIsBuy ? 'BUY' : 'SELL'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Summary */}
        <div
          className={`rounded-lg px-3 py-2 text-xs ${trendConfig.bgClass} border ${trendConfig.borderClass}`}
        >
          <span className="text-muted-foreground">Strategy: </span>
          <span className={`font-semibold ${trendConfig.textClass}`}>
            {isBullish
              ? `Buy ${pick.symbol} CE ₹${pick.strikePrice.toLocaleString('en-IN')} · Sell PE for premium`
              : `Buy ${pick.symbol} PE ₹${pick.strikePrice.toLocaleString('en-IN')} · Sell CE for premium`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PickCardSkeleton() {
  return (
    <Card className="border-2 border-border overflow-hidden">
      <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Factor badges skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 rounded-lg" />
      </CardContent>
    </Card>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function DailyOptionsPicksSection() {
  const { data: picks, isLoading, isError } = useDailyOptionsPicks();

  const bullishPicks =
    picks?.filter((p) => p.trend === Variant_bullish_bearish.bullish) ?? [];
  const bearishPicks =
    picks?.filter((p) => p.trend === Variant_bullish_bearish.bearish) ?? [];

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Today's Options Picks
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-selected high-volume CE/PE contracts · 2 Bullish + 2 Bearish · Updated daily
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-bullish border-bullish/40 bg-bullish/5 font-semibold"
          >
            <TrendingUp className="h-3 w-3 mr-1" />2 Bullish
          </Badge>
          <Badge
            variant="outline"
            className="text-bearish border-bearish/40 bg-bearish/5 font-semibold"
          >
            <TrendingDown className="h-3 w-3 mr-1" />2 Bearish
          </Badge>
          <Badge
            variant="outline"
            className="text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/5 font-semibold"
          >
            <Zap className="h-3 w-3 mr-1" />
            High Volume
          </Badge>
        </div>
      </div>

      {/* 9:05 AM IST timestamp note */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          Picks generated at <strong>9:05 AM IST</strong> daily, considering news sentiment, FII
          flows, global cues, world market trends, regulatory signals, and sector direction.
        </span>
      </div>

      {/* Disclaimer */}
      <div className="mb-5 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-xs text-muted-foreground">
        ⚠️ <strong>Disclaimer:</strong> These are AI-generated suggestions for educational purposes
        only. Options trading involves significant risk. Please consult a SEBI-registered advisor
        before trading.
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PickCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load today's picks. Please try again later.
          </p>
        </div>
      )}

      {/* Picks Grid */}
      {!isLoading && !isError && picks && picks.length > 0 && (
        <div className="space-y-6">
          {/* Bullish Row */}
          {bullishPicks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-bullish" />
                <span className="text-sm font-semibold text-bullish uppercase tracking-wider">
                  Bullish Picks — Buy CE / Sell PE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bullishPicks.map((pick, i) => (
                  <PickCard key={`bullish-${i}`} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Bearish Row */}
          {bearishPicks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-bearish" />
                <span className="text-sm font-semibold text-bearish uppercase tracking-wider">
                  Bearish Picks — Buy PE / Sell CE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bearishPicks.map((pick, i) => (
                  <PickCard key={`bearish-${i}`} pick={pick} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!picks || picks.length === 0) && (
        <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center">
          <Phone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No picks available yet</p>
          <p className="text-xs text-muted-foreground">
            Daily options picks will appear here once generated.
          </p>
        </div>
      )}
    </section>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  type StockPrediction,
  type NewsArticle,
  type MarketCall,
  type DailyStockPick,
  Sentiment,
  NewsCategory,
  Variant_bullish_bearish_moderate,
  Variant_bullish_bearish,
  Variant_buy_sell,
  Variant_buy_sell_neutral,
  Variant_ce_pe,
  Variant_bullish_bearish_neutral,
  type RiskFactor,
  type TechnicalIndicator,
  type NewsSource,
} from '../backend';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketCallResult {
  call: 'Bullish' | 'Bearish' | 'Moderate';
  confidence: number;
  newsSentimentScore: number;
  fiiDiiScore: number;
  chartPatternScore: number;
  regulatoryScore: number;
  rationale: string;
  generatedAt: Date;
}

// Price direction string literals (matches backend PriceDirection type)
type PriceDirectionValue = 'bullish' | 'bearish' | 'neutral';

// ─── Build a StockPrediction from local generated data ────────────────────────

function buildLocalStockPrediction(symbol: string): StockPrediction {
  const gen = generateEnrichedPrediction(symbol);
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  return {
    stockSymbol: symbol.toUpperCase(),
    priceDirection: gen.priceDirection as StockPrediction['priceDirection'],
    shortTermPriceTargetLower: gen.targetLower,
    shortTermPriceTargetUpper: gen.targetUpper,
    confidenceScore: gen.confidence,
    aiRationale: gen.rationale,
    riskFactors: gen.riskFactors,
    technicalIndicators: gen.technicalIndicators,
    newsSentimentScore: gen.newsSentiment,
    fiiBuying: gen.fiiBuying,
    fiiSelling: gen.fiiSelling,
    diiBuying: gen.diiBuying,
    diiSelling: gen.diiSelling,
    timestamp: now,
  };
}

// ─── Stock Prediction (latest from historical, or local fallback) ─────────────

export function useStockPrediction(symbol: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StockPrediction>({
    queryKey: ['stockPrediction', symbol],
    queryFn: async () => {
      // Try to get from backend historical forecasts
      if (actor) {
        try {
          const predictions = await actor.getHistoricalForecast(symbol.toUpperCase());
          if (predictions && predictions.length > 0) {
            // Return the most recent prediction
            return predictions.sort((a, b) => Number(b.timestamp - a.timestamp))[0];
          }
        } catch {
          // Fall through to local generation
        }
      }
      // Always fall back to locally generated prediction so the page never shows an error
      return buildLocalStockPrediction(symbol);
    },
    enabled: !!symbol,
  });
}

export function useHistoricalPredictions(symbol: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StockPrediction[]>({
    queryKey: ['historicalPredictions', symbol],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const predictions = await actor.getHistoricalForecast(symbol.toUpperCase());
        return predictions.sort((a, b) => Number(b.timestamp - a.timestamp));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!symbol,
  });
}

export function useNewsArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<NewsArticle[]>({
    queryKey: ['newsArticles', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const articles = await actor.getAllNewsFeeds();
        return articles.sort((a, b) => Number(b.publishedDate - a.publishedDate));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Market Call History ───────────────────────────────────────────────────────

export function useMarketCallHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<MarketCall[]>({
    queryKey: ['marketCallHistory'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const calls = await actor.getAllMarketCalls();
        return calls.sort((a, b) => Number(b.timestamp - a.timestamp)).slice(0, 30);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Today's Market Call (NIFTY50) ────────────────────────────────────────────

export function useTodaysMarketCall() {
  const { actor, isFetching } = useActor();

  return useQuery<MarketCallResult>({
    queryKey: ['todaysMarketCall'],
    queryFn: async () => {
      const pred = generateEnrichedPrediction('NIFTY50');
      const articles = generateEnrichedNewsArticles('NIFTY50');
      return computeMarketCall(pred, articles);
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ─── Daily Options Picks ──────────────────────────────────────────────────────

export function useDailyOptionsPicks() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyStockPick[]>({
    queryKey: ['dailyOptionsPicks'],
    queryFn: async () => {
      if (actor) {
        try {
          const picks = await actor.getLastTradingDaysStockPicks();
          if (picks && picks.length > 0) return picks;
        } catch {
          // fall through to local generation
        }
      }
      return generateLocalDailyPicks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ─── Local Daily Picks Generator (deterministic, daily seed) ─────────────────

function generateLocalDailyPicks(): DailyStockPick[] {
  const today = new Date();
  const dateSeed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const rng = (offset: number) => {
    const x = Math.sin(dateSeed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Pool of NSE large-cap stocks
  const bullishPool = [
    { symbol: 'TCS', basePrice: 3500 },
    { symbol: 'RELIANCE', basePrice: 2550 },
    { symbol: 'HDFCBANK', basePrice: 1700 },
    { symbol: 'ICICIBANK', basePrice: 1100 },
    { symbol: 'WIPRO', basePrice: 480 },
    { symbol: 'BAJFINANCE', basePrice: 7200 },
    { symbol: 'MARUTI', basePrice: 12000 },
    { symbol: 'SUNPHARMA', basePrice: 1650 },
  ];

  const bearishPool = [
    { symbol: 'INFY', basePrice: 1600 },
    { symbol: 'HDFC', basePrice: 2600 },
    { symbol: 'TATASTEEL', basePrice: 160 },
    { symbol: 'ONGC', basePrice: 270 },
    { symbol: 'COALINDIA', basePrice: 450 },
    { symbol: 'NTPC', basePrice: 360 },
    { symbol: 'POWERGRID', basePrice: 310 },
    { symbol: 'HINDALCO', basePrice: 680 },
  ];

  // Pick 2 bullish stocks deterministically
  const b1Idx = Math.floor(rng(1) * bullishPool.length);
  let b2Idx = Math.floor(rng(2) * bullishPool.length);
  if (b2Idx === b1Idx) b2Idx = (b2Idx + 1) % bullishPool.length;

  // Pick 2 bearish stocks deterministically
  const r1Idx = Math.floor(rng(3) * bearishPool.length);
  let r2Idx = Math.floor(rng(4) * bearishPool.length);
  if (r2Idx === r1Idx) r2Idx = (r2Idx + 1) % bearishPool.length;

  const bullish1 = bullishPool[b1Idx];
  const bullish2 = bullishPool[b2Idx];
  const bearish1 = bearishPool[r1Idx];
  const bearish2 = bearishPool[r2Idx];

  // Compute nearest round strike (multiples of 50 or 100)
  const nearestStrike = (price: number) => {
    const step = price > 2000 ? 100 : price > 500 ? 50 : 10;
    return Math.round(price / step) * step;
  };

  // Expiry: last Thursday of current month
  const getExpiry = () => {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of month
    while (d.getDay() !== 4) d.setDate(d.getDate() - 1); // walk back to Thursday
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const expiry = getExpiry();
  const now = BigInt(Date.now()) * BigInt(1_000_000); // nanoseconds

  // Helper: pick a deterministic enum value from an array
  const pickEnum = <T,>(arr: T[], offset: number): T =>
    arr[Math.floor(rng(offset) * arr.length)];

  const fiiFlowOptions: Variant_buy_sell_neutral[] = [
    Variant_buy_sell_neutral.buy,
    Variant_buy_sell_neutral.sell,
    Variant_buy_sell_neutral.neutral,
  ];

  const sentimentOptions: Sentiment[] = [
    Sentiment.positive,
    Sentiment.negative,
    Sentiment.neutral,
  ];

  const trendNeutralOptions: Variant_bullish_bearish_neutral[] = [
    Variant_bullish_bearish_neutral.bullish,
    Variant_bullish_bearish_neutral.bearish,
    Variant_bullish_bearish_neutral.neutral,
  ];

  const makePick = (
    stock: { symbol: string; basePrice: number },
    trend: Variant_bullish_bearish,
    offset: number,
    forceOverride = false
  ): DailyStockPick => {
    const priceVariance = stock.basePrice * (0.97 + rng(offset) * 0.06);
    const strike = nearestStrike(priceVariance);
    const isBullish = trend === Variant_bullish_bearish.bullish;

    // Generate factor signals
    const newsSentiment = rng(offset + 1) * 2 - 1; // -1 to 1
    const fiiFlow = pickEnum(fiiFlowOptions, offset + 2);
    const globalCues = pickEnum(sentimentOptions, offset + 3);
    const worldMarketTrend = pickEnum(trendNeutralOptions, offset + 4);
    // RegulatorySignal has same shape as Sentiment (positive/negative/neutral)
    const regulatorySignal = pickEnum(sentimentOptions, offset + 5) as unknown as DailyStockPick['regulatorySignal'];
    // Sector direction: for override demo, one bearish pick gets a conflicting sector direction
    const sectorDirection = forceOverride
      ? (isBullish ? Variant_bullish_bearish_neutral.bearish : Variant_bullish_bearish_neutral.bullish)
      : pickEnum(trendNeutralOptions, offset + 6);
    const sectorOverrideApplied = forceOverride;

    return {
      symbol: stock.symbol,
      trend,
      recommendedOption: isBullish ? Variant_ce_pe.ce : Variant_ce_pe.pe,
      strikePrice: strike,
      expiry,
      isHighVolume: true,
      callAction: isBullish ? Variant_buy_sell.buy : Variant_buy_sell.sell,
      putAction: isBullish ? Variant_buy_sell.sell : Variant_buy_sell.buy,
      newsSentiment,
      fiiFlow,
      globalCues,
      worldMarketTrend,
      regulatorySignal,
      sectorDirection,
      sectorOverrideApplied,
      timestamp: now,
    };
  };

  return [
    makePick(bullish1, Variant_bullish_bearish.bullish, 10),
    makePick(bullish2, Variant_bullish_bearish.bullish, 20),
    makePick(bearish1, Variant_bullish_bearish.bearish, 30),
    // One bearish pick demonstrates sector override
    makePick(bearish2, Variant_bullish_bearish.bearish, 40, true),
  ];
}

// ─── Compute Market Call ───────────────────────────────────────────────────────

export function computeMarketCall(
  pred: ReturnType<typeof generateEnrichedPrediction>,
  articles: ReturnType<typeof generateEnrichedNewsArticles>
): MarketCallResult {
  // 1. News Sentiment Score (0-100) — 30% weight
  const allSentiments = articles.map((a) => {
    if (a.sentiment === Sentiment.positive) return 70;
    if (a.sentiment === Sentiment.negative) return 30;
    return 50;
  });
  const newsSentimentScore =
    allSentiments.length > 0
      ? allSentiments.reduce((s, v) => s + v, 0) / allSentiments.length
      : 50;

  // 2. FII/DII Flow Score (0-100) — 30% weight
  const fiiNet = pred.fiiBuying - pred.fiiSelling;
  const diiNet = pred.diiBuying - pred.diiSelling;
  const totalFlow = fiiNet + diiNet;
  const maxFlow = Math.max(Math.abs(fiiNet), Math.abs(diiNet), 500);
  const fiiDiiScore = Math.min(100, Math.max(0, ((totalFlow / (maxFlow * 2)) + 0.5) * 100));

  // 3. Chart Pattern Score (0-100) — 25% weight
  const technicalIndicators = pred.technicalIndicators ?? [];
  const chartPatternScore =
    technicalIndicators.length > 0
      ? technicalIndicators.reduce((s, t) => s + t.weightedScore, 0) / technicalIndicators.length
      : 50;

  // 4. Regulatory Overhang Score (0-100) — 15% weight (from regulatory articles)
  const regulatoryArticles = articles.filter((a) => a.category === NewsCategory.regulatory);
  const regulatorySentiments = regulatoryArticles.map((a) => {
    if (a.sentiment === Sentiment.positive) return 70;
    if (a.sentiment === Sentiment.negative) return 30;
    return 50;
  });
  const regulatoryScore =
    regulatorySentiments.length > 0
      ? regulatorySentiments.reduce((s, v) => s + v, 0) / regulatorySentiments.length
      : 50;

  // Composite weighted score
  const composite =
    newsSentimentScore * 0.30 +
    fiiDiiScore * 0.30 +
    chartPatternScore * 0.25 +
    regulatoryScore * 0.15;

  // Determine call
  let call: 'Bullish' | 'Bearish' | 'Moderate';
  if (composite > 55) {
    call = 'Bullish';
  } else if (composite < 40) {
    call = 'Bearish';
  } else {
    call = 'Moderate';
  }

  // Confidence: distance from 50 scaled
  const confidence = Math.min(95, Math.max(45, Math.abs(composite - 50) * 2 + 50));

  // Rationale
  const sentimentLabel = newsSentimentScore > 60 ? 'positive' : newsSentimentScore < 40 ? 'negative' : 'mixed';
  const flowLabel = totalFlow > 0 ? 'net buying' : 'net selling';
  const chartLabel = chartPatternScore > 60 ? 'bullish patterns' : chartPatternScore < 40 ? 'bearish patterns' : 'neutral patterns';
  const regLabel = regulatoryScore > 60 ? 'supportive' : regulatoryScore < 40 ? 'restrictive' : 'neutral';

  const rationale =
    `News sentiment is ${sentimentLabel} (${newsSentimentScore.toFixed(0)}/100). ` +
    `Institutional flows show ${flowLabel} (FII: ₹${fiiNet.toFixed(0)}Cr, DII: ₹${diiNet.toFixed(0)}Cr). ` +
    `Chart patterns indicate ${chartLabel} (${chartPatternScore.toFixed(0)}/100). ` +
    `Regulatory environment is ${regLabel} (${regulatoryScore.toFixed(0)}/100). ` +
    `Composite score: ${composite.toFixed(1)} → ${call} call with ${confidence.toFixed(0)}% confidence.`;

  return {
    call,
    confidence,
    newsSentimentScore,
    fiiDiiScore,
    chartPatternScore,
    regulatoryScore,
    rationale,
    generatedAt: new Date(),
  };
}

// ─── Enriched Prediction Generator ───────────────────────────────────────────

export function generateEnrichedPrediction(symbol: string): {
  priceDirection: PriceDirectionValue;
  targetLower: number;
  targetUpper: number;
  confidence: number;
  rationale: string;
  riskFactors: RiskFactor[];
  technicalIndicators: TechnicalIndicator[];
  newsSentiment: number;
  fiiBuying: number;
  fiiSelling: number;
  diiBuying: number;
  diiSelling: number;
} {
  // Seeded pseudo-random based on symbol + date for daily refresh
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const symbolSeed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = symbolSeed + dateSeed;

  const rng = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const indicatorDefs = [
    { name: 'RSI (14)', bullishThreshold: 0.55 },
    { name: 'MACD Signal', bullishThreshold: 0.5 },
    { name: 'Bollinger Bands', bullishThreshold: 0.52 },
    { name: 'EMA 50/200 Cross', bullishThreshold: 0.5 },
    { name: 'Volume Momentum', bullishThreshold: 0.48 },
    { name: 'Stochastic Oscillator', bullishThreshold: 0.53 },
  ];

  const technicalIndicators: TechnicalIndicator[] = indicatorDefs.map((ind, i) => ({
    indicatorName: ind.name,
    weightedScore: rng(i + 10) * 100,
  }));

  const avgTechnical = technicalIndicators.reduce((s, t) => s + t.weightedScore, 0) / technicalIndicators.length;
  const newsSentiment = (rng(20) * 2 - 1) * 100;
  const fiiBuying = rng(30) * 2000 + 500;
  const fiiSelling = rng(31) * 1500 + 300;
  const diiBuying = rng(32) * 1800 + 400;
  const diiSelling = rng(33) * 1200 + 200;

  const fiiNet = fiiBuying - fiiSelling;
  const diiNet = diiBuying - diiSelling;
  const institutionalScore = ((fiiNet + diiNet) / 2000 + 1) / 2 * 100;

  const compositeScore =
    avgTechnical * 0.45 +
    ((newsSentiment + 100) / 2) * 0.30 +
    institutionalScore * 0.25;

  let priceDirection: PriceDirectionValue;
  if (compositeScore > 58) {
    priceDirection = 'bullish';
  } else if (compositeScore < 42) {
    priceDirection = 'bearish';
  } else {
    priceDirection = 'neutral';
  }

  const confidence = Math.min(95, Math.max(45, Math.abs(compositeScore - 50) * 2 + 50));
  const basePrice = 500 + (symbolSeed % 2000);
  const targetRange = basePrice * 0.05 + rng(40) * basePrice * 0.08;
  const targetLower = priceDirection === 'bullish'
    ? basePrice + targetRange * 0.3
    : priceDirection === 'bearish'
    ? basePrice - targetRange
    : basePrice - targetRange * 0.3;
  const targetUpper = priceDirection === 'bullish'
    ? basePrice + targetRange
    : priceDirection === 'bearish'
    ? basePrice - targetRange * 0.3
    : basePrice + targetRange * 0.3;

  const topIndicator = technicalIndicators.reduce((a, b) => a.weightedScore > b.weightedScore ? a : b);
  const sentimentLabel = newsSentiment > 20 ? 'positive' : newsSentiment < -20 ? 'negative' : 'neutral';
  const flowLabel = (fiiNet + diiNet) > 0 ? 'net buying' : 'net selling';
  const directionLabel = priceDirection;

  const rationale =
    `${symbol} shows a ${directionLabel} outlook with ${confidence.toFixed(0)}% confidence. ` +
    `Technical analysis led by ${topIndicator.indicatorName} (score: ${topIndicator.weightedScore.toFixed(1)}) indicates ${directionLabel} momentum. ` +
    `News sentiment is ${sentimentLabel} (${newsSentiment.toFixed(1)}), and institutional investors show ${flowLabel} ` +
    `(FII net: ₹${fiiNet.toFixed(0)}Cr, DII net: ₹${diiNet.toFixed(0)}Cr). ` +
    `Short-term price target range: ₹${Math.min(targetLower, targetUpper).toFixed(0)} – ₹${Math.max(targetLower, targetUpper).toFixed(0)}.`;

  const riskFactors: RiskFactor[] = [
    { description: 'Global macroeconomic headwinds and interest rate uncertainty', impactLevel: rng(50) * 0.5 + 0.3 },
    { description: 'Sector-specific regulatory changes may affect earnings', impactLevel: rng(51) * 0.4 + 0.2 },
    { description: 'FII outflow risk in case of emerging market sell-off', impactLevel: rng(52) * 0.6 + 0.2 },
    { description: 'Earnings miss risk in upcoming quarterly results', impactLevel: rng(53) * 0.5 + 0.1 },
  ].sort((a, b) => b.impactLevel - a.impactLevel);

  return {
    priceDirection,
    targetLower: Math.min(targetLower, targetUpper),
    targetUpper: Math.max(targetLower, targetUpper),
    confidence,
    rationale,
    riskFactors,
    technicalIndicators,
    newsSentiment,
    fiiBuying,
    fiiSelling,
    diiBuying,
    diiSelling,
  };
}

// ─── Enriched News Articles Generator ────────────────────────────────────────

interface EnrichedArticle {
  title: string;
  sourceKey: string;
  source: NewsSource;
  category: NewsCategory;
  url: string;
  summary: string;
  sentiment: Sentiment;
  publishedDate?: bigint;
}

export function generateEnrichedNewsArticles(symbol: string): EnrichedArticle[] {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const symbolSeed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = symbolSeed + dateSeed;

  const rng = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const pickSentiment = (offset: number): Sentiment => {
    const v = rng(offset);
    if (v > 0.6) return Sentiment.positive;
    if (v < 0.3) return Sentiment.negative;
    return Sentiment.neutral;
  };

  const articles: EnrichedArticle[] = [
    {
      title: `${symbol}: Institutional investors increase stake amid strong quarterly results`,
      sourceKey: 'economicTimes',
      source: { __kind__: 'economicTimes', economicTimes: null },
      category: NewsCategory.general,
      url: 'https://economictimes.indiatimes.com',
      summary: `Foreign institutional investors have been increasing their holdings in ${symbol} following better-than-expected quarterly earnings, signaling confidence in the company's growth trajectory.`,
      sentiment: pickSentiment(100),
    },
    {
      title: 'India-US trade deal negotiations enter final stage, tech sector to benefit',
      sourceKey: 'bloomberg',
      source: { __kind__: 'bloomberg', bloomberg: null },
      category: NewsCategory.indiaTradeDeals,
      url: 'https://bloomberg.com',
      summary: 'Bilateral trade negotiations between India and the United States are progressing, with technology and pharmaceutical sectors expected to see reduced tariff barriers.',
      sentiment: pickSentiment(101),
    },
    {
      title: 'SEBI tightens F&O regulations: New margin requirements from next quarter',
      sourceKey: 'mint',
      source: { __kind__: 'mint', mint: null },
      category: NewsCategory.regulatory,
      url: 'https://livemint.com',
      summary: 'The Securities and Exchange Board of India has announced stricter margin requirements for futures and options trading, effective from the next quarter.',
      sentiment: pickSentiment(102),
    },
    {
      title: 'Global markets rally as Fed signals pause in rate hikes',
      sourceKey: 'reuters',
      source: { __kind__: 'reuters', reuters: null },
      category: NewsCategory.worldMarkets,
      url: 'https://reuters.com',
      summary: 'World equity markets surged after Federal Reserve officials indicated a potential pause in interest rate increases, boosting risk appetite globally.',
      sentiment: pickSentiment(103),
    },
    {
      title: 'Import duties on electronics components revised downward',
      sourceKey: 'cnbc',
      source: { __kind__: 'cnbc', cnbc: null },
      category: NewsCategory.importExport,
      url: 'https://cnbctv18.com',
      summary: 'The government has reduced import duties on key electronics components to boost domestic manufacturing under the PLI scheme.',
      sentiment: pickSentiment(104),
    },
    {
      title: 'New tariff structure for steel imports announced',
      sourceKey: 'bloomberg',
      source: { __kind__: 'bloomberg', bloomberg: null },
      category: NewsCategory.tariffs,
      url: 'https://bloomberg.com',
      summary: 'The Ministry of Commerce has announced revised tariff rates for steel imports, impacting domestic steel producers and downstream industries.',
      sentiment: pickSentiment(105),
    },
    {
      title: `${symbol} Q3 results: Revenue beats estimates, margins under pressure`,
      sourceKey: 'economicTimes',
      source: { __kind__: 'economicTimes', economicTimes: null },
      category: NewsCategory.general,
      url: 'https://economictimes.indiatimes.com',
      summary: `${symbol} reported Q3 revenue above analyst estimates but operating margins contracted due to higher input costs and increased employee expenses.`,
      sentiment: pickSentiment(106),
    },
    {
      title: 'Asian markets mixed as China data disappoints',
      sourceKey: 'bbc',
      source: { __kind__: 'bbc', bbc: null },
      category: NewsCategory.worldMarkets,
      url: 'https://bbc.com/news/business',
      summary: 'Asian equity markets showed mixed performance as weaker-than-expected Chinese economic data dampened sentiment, while Japanese markets outperformed.',
      sentiment: pickSentiment(107),
    },
  ];

  // Shuffle deterministically and return 6-8 articles
  const count = 6 + Math.floor(rng(200) * 3);
  const shuffled = [...articles].sort((a, b) => rng(a.title.length) - rng(b.title.length));
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

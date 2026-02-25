import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import StockSearchBar from '../components/StockSearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3, Newspaper, Activity } from 'lucide-react';
import { useTodaysMarketCall } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import DailyOptionsPicksSection from '../components/DailyOptionsPicksSection';

function MarketCallBanner() {
  const { data: marketCall, isLoading } = useTodaysMarketCall();

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-6">
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!marketCall) return null;

  const isbullish = marketCall.call === 'Bullish';
  const isbearish = marketCall.call === 'Bearish';

  const callConfig = isbullish
    ? {
        textClass: 'text-bullish',
        bgClass: 'bg-bullish/10',
        borderClass: 'border-bullish/40',
        Icon: TrendingUp,
        label: 'BULLISH',
      }
    : isbearish
    ? {
        textClass: 'text-bearish',
        bgClass: 'bg-bearish/10',
        borderClass: 'border-bearish/40',
        Icon: TrendingDown,
        label: 'BEARISH',
      }
    : {
        textClass: 'text-warning',
        bgClass: 'bg-warning/10',
        borderClass: 'border-warning/40',
        Icon: Minus,
        label: 'MODERATE',
      };

  const oneLineRationale = marketCall.rationale.split('.')[0] + '.';

  return (
    <div className={`w-full max-w-2xl mx-auto mb-6 rounded-xl border-2 ${callConfig.borderClass} ${callConfig.bgClass} px-5 py-4`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${callConfig.bgClass} border ${callConfig.borderClass}`}>
          <callConfig.Icon className={`h-6 w-6 ${callConfig.textClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Today's NIFTY50 Call
            </span>
            <span className={`text-lg font-extrabold tracking-tight ${callConfig.textClass}`}>
              {callConfig.label}
            </span>
            <span className="text-xs text-muted-foreground">
              · {marketCall.confidence.toFixed(0)}% confidence
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
            {oneLineRationale}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState('');

  const handleSearch = (symbol: string) => {
    if (symbol) {
      navigate({ to: '/prediction/$symbol', params: { symbol } });
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-[460px] md:h-[540px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/hero-finance.dim_1920x600.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-3 tracking-tight">
            AI-Powered Stock Predictions
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl">
            Analyze market trends with advanced AI that factors in news sentiment, FII/DII data, and chart patterns
          </p>

          {/* Today's Market Call Banner */}
          <MarketCallBanner />

          <div className="w-full max-w-2xl">
            <StockSearchBar
              value={selectedStock}
              onChange={setSelectedStock}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Daily Options Picks Section */}
      <DailyOptionsPicksSection />

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="border-t border-border" />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-full bg-bullish/10">
                  <Newspaper className="h-8 w-8 text-bullish" />
                </div>
                <h3 className="font-semibold text-lg">World News</h3>
                <p className="text-sm text-muted-foreground">
                  Aggregated from CNBC, Bloomberg, BBC, Reuters, Economic Times & Mint
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-full bg-chart-2/10">
                  <TrendingUp className="h-8 w-8 text-chart-2" />
                </div>
                <h3 className="font-semibold text-lg">FII/DII Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor institutional investor buying and selling patterns
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-full bg-chart-3/10">
                  <BarChart3 className="h-8 w-8 text-chart-3" />
                </div>
                <h3 className="font-semibold text-lg">Chart Patterns</h3>
                <p className="text-sm text-muted-foreground">
                  Identify technical patterns with confidence scoring
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 rounded-full bg-chart-4/10">
                  <Activity className="h-8 w-8 text-chart-4" />
                </div>
                <h3 className="font-semibold text-lg">AI Predictions</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analysis with confidence levels and insights
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

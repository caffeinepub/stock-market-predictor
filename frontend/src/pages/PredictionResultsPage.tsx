import { useParams, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  useStockPrediction,
  useHistoricalPredictions,
  useNewsArticles,
  useMarketCallHistory,
  computeMarketCall,
  generateEnrichedPrediction,
  generateEnrichedNewsArticles,
} from '../hooks/useQueries';
import PredictionCard from '../components/PredictionCard';
import ContributingFactorsSection from '../components/ContributingFactorsSection';
import NewsCategoryTabs from '../components/NewsCategoryTabs';
import FiiDiiChart from '../components/FiiDiiChart';
import StockPriceChart from '../components/StockPriceChart';
import DailyMarketCallCard from '../components/DailyMarketCallCard';
import MarketCallHistoryChart from '../components/MarketCallHistoryChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export default function PredictionResultsPage() {
  const { symbol } = useParams({ from: '/prediction/$symbol' });
  const navigate = useNavigate();

  const {
    data: prediction,
    isLoading: predictionLoading,
  } = useStockPrediction(symbol);

  const { data: historicalPredictions, isLoading: historicalLoading } = useHistoricalPredictions(symbol);
  const { data: newsArticles, isLoading: newsLoading } = useNewsArticles();
  const { data: marketCallHistory, isLoading: marketCallHistoryLoading } = useMarketCallHistory();

  // Compute market call for this symbol — always available (local generation)
  const marketCallResult = useMemo(() => {
    const pred = generateEnrichedPrediction(symbol.toUpperCase());
    const articles = generateEnrichedNewsArticles(symbol.toUpperCase());
    return computeMarketCall(pred, articles);
  }, [symbol]);

  // Build the predictions array for charts: prefer historical, fall back to current prediction
  const chartPredictions = useMemo(() => {
    if (historicalPredictions && historicalPredictions.length > 0) {
      return historicalPredictions;
    }
    if (prediction) {
      return [prediction];
    }
    return [];
  }, [historicalPredictions, prediction]);

  const isLoading = predictionLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
        <Card className="border-primary/40 mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-7 w-7 animate-spin text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Loading AI Prediction for {symbol.toUpperCase()}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzing technical indicators, news sentiment, FII/DII flows, and computing multi-factor AI score…
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // prediction is always defined after loading (local fallback ensures it)
  if (!prediction) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
        <Card className="border-primary/40">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-7 w-7 animate-spin text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Generating AI Prediction for {symbol.toUpperCase()}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we compute the multi-factor analysis…
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Daily Market Call Card — top of results */}
        <DailyMarketCallCard marketCall={marketCallResult} symbol={symbol.toUpperCase()} />

        {/* Market Call History Chart */}
        {!marketCallHistoryLoading && (
          <MarketCallHistoryChart marketCalls={marketCallHistory ?? []} />
        )}

        {/* Main AI Prediction Card */}
        <PredictionCard prediction={prediction} />

        {/* Contributing Factors */}
        <ContributingFactorsSection prediction={prediction} />

        {/* Charts Section */}
        {chartPredictions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>FII / DII Investment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <FiiDiiChart symbol={symbol} predictions={chartPredictions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Target History</CardTitle>
              </CardHeader>
              <CardContent>
                <StockPriceChart symbol={symbol} predictions={chartPredictions} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* News Articles with Category Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <CardTitle>World News & Market Intelligence</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Aggregated from CNBC, Bloomberg, BBC, Reuters, Economic Times, Mint — filtered by category
            </p>
          </CardHeader>
          <CardContent>
            <NewsCategoryTabs articles={newsArticles ?? []} isLoading={newsLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

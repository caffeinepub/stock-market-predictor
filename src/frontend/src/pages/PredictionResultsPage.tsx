import { useParams } from '@tanstack/react-router';
import { useStockPrediction, useStockPredictions, useNewsArticles } from '../hooks/useQueries';
import PredictionCard from '../components/PredictionCard';
import ContributingFactorsSection from '../components/ContributingFactorsSection';
import NewsArticlesList from '../components/NewsArticlesList';
import FiiDiiChart from '../components/FiiDiiChart';
import StockPriceChart from '../components/StockPriceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export default function PredictionResultsPage() {
  const { symbol } = useParams({ from: '/prediction/$symbol' });
  const { data: prediction, isLoading: predictionLoading, error: predictionError } = useStockPrediction(symbol);
  const { data: historicalPredictions, isLoading: historicalLoading } = useStockPredictions(symbol);
  const { data: newsArticles, isLoading: newsLoading } = useNewsArticles();

  const isLoading = predictionLoading || historicalLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (predictionError || !prediction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold text-lg">No Prediction Data Available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No prediction data found for {symbol}. This stock may not be in our current prediction database. Please try another stock symbol like SBIN, TCS, INFY, HDFC, RELIANCE, ICICIBANK, or KOTAKBANK.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Main Prediction Card */}
        <PredictionCard prediction={prediction} />

        {/* Contributing Factors */}
        <ContributingFactorsSection prediction={prediction} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FII/DII Chart */}
          <Card>
            <CardHeader>
              <CardTitle>FII/DII Investment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <FiiDiiChart symbol={symbol} predictions={historicalPredictions || [prediction]} />
            </CardContent>
          </Card>

          {/* Stock Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price Trend with Detected Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <StockPriceChart symbol={symbol} predictions={historicalPredictions || [prediction]} />
            </CardContent>
          </Card>
        </div>

        {/* News Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Related News Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsArticlesList articles={newsArticles || []} isLoading={newsLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

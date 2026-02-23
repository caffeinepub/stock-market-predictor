import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type StockPrediction } from '../backend';
import { Newspaper, TrendingUp, BarChart3 } from 'lucide-react';

interface ContributingFactorsSectionProps {
  prediction: StockPrediction;
}

export default function ContributingFactorsSection({ prediction }: ContributingFactorsSectionProps) {
  // Calculate FII/DII net flow
  const fiiNet = prediction.fiiBuying - prediction.fiiSelling;
  const diiNet = prediction.diiBuying - prediction.diiSelling;
  const totalInstitutionalFlow = fiiNet + diiNet;

  // Normalize sentiment score to 0-100 range (assuming -1 to 1 range)
  const sentimentPercentage = Math.round(((prediction.newsSentimentScore + 1) / 2) * 100);

  // Calculate institutional flow percentage (normalize to 0-100)
  const maxFlow = Math.max(Math.abs(fiiNet), Math.abs(diiNet), 1000);
  const institutionalPercentage = Math.round(((totalInstitutionalFlow / maxFlow) + 1) / 2 * 100);

  // Chart patterns confidence (average of all patterns)
  const patternsConfidence = prediction.chartPatterns.length > 0
    ? Math.round(
        prediction.chartPatterns.reduce((sum, p) => sum + p.confidenceScore, 0) /
        prediction.chartPatterns.length * 100
      )
    : 0;

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-bullish';
    if (score < -0.3) return 'text-bearish';
    return 'text-neutral';
  };

  const getFlowColor = (flow: number) => {
    if (flow > 0) return 'text-bullish';
    if (flow < 0) return 'text-bearish';
    return 'text-neutral';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributing Factors Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* News Sentiment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-chart-1" />
              <h4 className="font-semibold">News Sentiment</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Impact Score</span>
                <span className={`font-bold ${getSentimentColor(prediction.newsSentimentScore)}`}>
                  {prediction.newsSentimentScore > 0 ? '+' : ''}{prediction.newsSentimentScore.toFixed(2)}
                </span>
              </div>
              <Progress value={sentimentPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {prediction.newsSentimentScore > 0.3 ? 'Positive sentiment from recent news' :
                 prediction.newsSentimentScore < -0.3 ? 'Negative sentiment from recent news' :
                 'Neutral sentiment from recent news'}
              </p>
            </div>
          </div>

          {/* FII/DII Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              <h4 className="font-semibold">Institutional Flow</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Flow</span>
                <span className={`font-bold ${getFlowColor(totalInstitutionalFlow)}`}>
                  {totalInstitutionalFlow > 0 ? '+' : ''}{totalInstitutionalFlow.toFixed(0)}Cr
                </span>
              </div>
              <Progress value={institutionalPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>FII: {fiiNet > 0 ? '+' : ''}{fiiNet.toFixed(0)}Cr</p>
                <p>DII: {diiNet > 0 ? '+' : ''}{diiNet.toFixed(0)}Cr</p>
              </div>
            </div>
          </div>

          {/* Chart Patterns */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-chart-3" />
              <h4 className="font-semibold">Chart Patterns</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="font-bold">{patternsConfidence}%</span>
              </div>
              <Progress value={patternsConfidence} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {prediction.chartPatterns.length > 0 ? (
                  <p>{prediction.chartPatterns.length} pattern(s) detected</p>
                ) : (
                  <p>No significant patterns detected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detected Patterns List */}
        {prediction.chartPatterns.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold mb-3">Detected Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.chartPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-accent rounded-md text-sm"
                >
                  <span className="font-medium">{pattern.patternName}</span>
                  <span className="text-muted-foreground ml-2">
                    ({Math.round(pattern.confidenceScore * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

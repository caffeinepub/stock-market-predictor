import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type StockPrediction } from '../backend';
import { Newspaper, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface ContributingFactorsSectionProps {
  prediction: StockPrediction;
}

function getScoreColor(score: number): string {
  if (score >= 65) return 'text-bullish';
  if (score <= 35) return 'text-bearish';
  return 'text-neutral';
}

function getScoreLabel(score: number): string {
  if (score >= 65) return 'Bullish';
  if (score <= 35) return 'Bearish';
  return 'Neutral';
}

function getProgressColor(score: number): string {
  if (score >= 65) return '[&>div]:bg-bullish';
  if (score <= 35) return '[&>div]:bg-bearish';
  return '[&>div]:bg-neutral';
}

export default function ContributingFactorsSection({ prediction }: ContributingFactorsSectionProps) {
  // FII/DII net flows
  const fiiNet = prediction.fiiBuying - prediction.fiiSelling;
  const diiNet = prediction.diiBuying - prediction.diiSelling;
  const totalInstitutionalFlow = fiiNet + diiNet;

  // Normalize news sentiment from -100..100 to 0..100
  const rawSentiment = prediction.newsSentimentScore ?? 0;
  const sentimentNormalized = Math.round(((rawSentiment + 100) / 200) * 100);

  // Normalize institutional flow to 0-100
  const maxFlow = Math.max(Math.abs(fiiNet), Math.abs(diiNet), 500);
  const institutionalNormalized = Math.round(((totalInstitutionalFlow / (maxFlow * 2)) + 0.5) * 100);

  // Technical indicators
  const technicalIndicators = prediction.technicalIndicators ?? [];
  const avgTechnicalScore = technicalIndicators.length > 0
    ? technicalIndicators.reduce((s, t) => s + t.weightedScore, 0) / technicalIndicators.length
    : 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributing Factors Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top-level factor summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* News Sentiment */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-chart-1" />
              <h4 className="font-semibold text-sm">News Sentiment</h4>
              <span className={`ml-auto text-xs font-bold ${getScoreColor(sentimentNormalized)}`}>
                {getScoreLabel(sentimentNormalized)}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Score</span>
                <span className={`font-bold ${getScoreColor(sentimentNormalized)}`}>
                  {rawSentiment > 0 ? '+' : ''}{rawSentiment.toFixed(1)}
                </span>
              </div>
              <Progress value={sentimentNormalized} className={`h-2 ${getProgressColor(sentimentNormalized)}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              {rawSentiment > 20 ? 'Positive news flow supports upside' :
               rawSentiment < -20 ? 'Negative news flow adds downside pressure' :
               'Mixed or neutral news sentiment'}
            </p>
          </div>

          {/* Institutional Flow */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              <h4 className="font-semibold text-sm">Institutional Flow</h4>
              <span className={`ml-auto text-xs font-bold ${getScoreColor(institutionalNormalized)}`}>
                {getScoreLabel(institutionalNormalized)}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Net Flow</span>
                <span className={`font-bold ${getScoreColor(institutionalNormalized)}`}>
                  {totalInstitutionalFlow > 0 ? '+' : ''}₹{totalInstitutionalFlow.toFixed(0)}Cr
                </span>
              </div>
              <Progress value={institutionalNormalized} className={`h-2 ${getProgressColor(institutionalNormalized)}`} />
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>FII: {fiiNet > 0 ? '+' : ''}₹{fiiNet.toFixed(0)}Cr &nbsp;|&nbsp; DII: {diiNet > 0 ? '+' : ''}₹{diiNet.toFixed(0)}Cr</p>
            </div>
          </div>

          {/* Technical Composite */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-chart-3" />
              <h4 className="font-semibold text-sm">Technical Score</h4>
              <span className={`ml-auto text-xs font-bold ${getScoreColor(avgTechnicalScore)}`}>
                {getScoreLabel(avgTechnicalScore)}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg Score</span>
                <span className={`font-bold ${getScoreColor(avgTechnicalScore)}`}>
                  {avgTechnicalScore.toFixed(1)}
                </span>
              </div>
              <Progress value={avgTechnicalScore} className={`h-2 ${getProgressColor(avgTechnicalScore)}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {technicalIndicators.length} technical indicator{technicalIndicators.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Technical Indicators Breakdown */}
        {technicalIndicators.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Technical Indicators Breakdown</h4>
            </div>
            <div className="space-y-3">
              {technicalIndicators.map((indicator, index) => {
                const score = indicator.weightedScore;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">{indicator.indicatorName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${getScoreColor(score)}`}>
                          {getScoreLabel(score)}
                        </span>
                        <span className="font-bold text-foreground w-12 text-right">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <Progress value={score} className={`h-1.5 ${getProgressColor(score)}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FII/DII Detail */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">FII / DII Activity Detail</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'FII Buying', value: prediction.fiiBuying, positive: true },
              { label: 'FII Selling', value: prediction.fiiSelling, positive: false },
              { label: 'DII Buying', value: prediction.diiBuying, positive: true },
              { label: 'DII Selling', value: prediction.diiSelling, positive: false },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg border border-border bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={`font-bold text-sm ${item.positive ? 'text-bullish' : 'text-bearish'}`}>
                  ₹{item.value.toFixed(0)}Cr
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

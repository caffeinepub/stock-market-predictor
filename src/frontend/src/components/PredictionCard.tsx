import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type StockPrediction } from '../backend';

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

  const getMovementIcon = () => {
    switch (prediction.predictedMovement) {
      case 'bullish':
        return <img src="/assets/generated/icon-bullish.dim_128x128.png" alt="Bullish" className="h-16 w-16" />;
      case 'bearish':
        return <img src="/assets/generated/icon-bearish.dim_128x128.png" alt="Bearish" className="h-16 w-16" />;
      case 'neutral':
        return <img src="/assets/generated/icon-neutral.dim_128x128.png" alt="Neutral" className="h-16 w-16" />;
    }
  };

  const getMovementColor = () => {
    switch (prediction.predictedMovement) {
      case 'bullish':
        return 'text-bullish';
      case 'bearish':
        return 'text-bearish';
      case 'neutral':
        return 'text-neutral';
    }
  };

  const getMovementBg = () => {
    switch (prediction.predictedMovement) {
      case 'bullish':
        return 'bg-bullish/10';
      case 'bearish':
        return 'bg-bearish/10';
      case 'neutral':
        return 'bg-neutral/10';
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const confidencePercentage = Math.round((prediction.confidenceLevel || 0) * 100);
  const predictionScore = prediction.predictionScore || 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{prediction.stockSymbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prediction Movement */}
          <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${getMovementBg()}`}>
            {getMovementIcon()}
            <h3 className={`text-3xl font-bold mt-4 capitalize ${getMovementColor()}`}>
              {prediction.predictedMovement}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">Predicted Movement</p>
          </div>

          {/* Confidence Level */}
          <div className="flex flex-col justify-center space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Confidence Level</span>
                <span className="text-2xl font-bold text-foreground">{confidencePercentage}%</span>
              </div>
              <Progress value={confidencePercentage} className="h-3" />
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Prediction Score:</strong> {predictionScore.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Generated:</strong> {formatDate(prediction.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

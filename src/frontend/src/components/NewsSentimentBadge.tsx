import { Badge } from '@/components/ui/badge';

interface NewsSentimentBadgeProps {
  score: number;
}

export default function NewsSentimentBadge({ score }: NewsSentimentBadgeProps) {
  const getSentiment = () => {
    if (score > 0.3) return { label: 'Positive', variant: 'default' as const, color: 'bg-bullish text-white' };
    if (score < -0.3) return { label: 'Negative', variant: 'destructive' as const, color: 'bg-bearish text-white' };
    return { label: 'Neutral', variant: 'secondary' as const, color: 'bg-neutral text-white' };
  };

  const sentiment = getSentiment();

  return (
    <Badge variant={sentiment.variant} className={sentiment.color}>
      {sentiment.label}
    </Badge>
  );
}

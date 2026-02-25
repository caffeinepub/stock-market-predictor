import { Badge } from '@/components/ui/badge';
import { Sentiment } from '../backend';

interface NewsSentimentBadgeProps {
  sentiment: Sentiment;
}

export default function NewsSentimentBadge({ sentiment }: NewsSentimentBadgeProps) {
  const getConfig = () => {
    switch (sentiment) {
      case Sentiment.positive:
        return { label: 'Positive', className: 'bg-bullish/15 text-bullish border-bullish/30 hover:bg-bullish/20' };
      case Sentiment.negative:
        return { label: 'Negative', className: 'bg-bearish/15 text-bearish border-bearish/30 hover:bg-bearish/20' };
      default:
        return { label: 'Neutral', className: 'bg-neutral/15 text-neutral border-neutral/30 hover:bg-neutral/20' };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="outline" className={`text-xs font-semibold border ${config.className}`}>
      {config.label}
    </Badge>
  );
}

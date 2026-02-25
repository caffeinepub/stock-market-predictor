import { type NewsArticle, type NewsSource } from '../backend';
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import NewsSentimentBadge from './NewsSentimentBadge';

interface NewsArticlesListProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

function getSourceLabel(source: NewsSource): string {
  switch (source.__kind__) {
    case 'cnbc': return 'CNBC';
    case 'bloomberg': return 'Bloomberg';
    case 'bbc': return 'BBC';
    case 'reuters': return 'Reuters';
    case 'economicTimes': return 'Economic Times';
    case 'mint': return 'Mint';
    case 'yahooFinance': return 'Yahoo Finance';
    case 'barrons': return "Barron's";
    case 'fortune': return 'Fortune';
    case 'marketWatch': return 'MarketWatch';
    case 'other': return source.other || 'Other';
    default: return 'Other';
  }
}

export default function NewsArticlesList({ articles, isLoading }: NewsArticlesListProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
        <Newspaper className="h-10 w-10 opacity-30" />
        <p className="text-sm">No news articles available for this stock at the moment.</p>
        <p className="text-xs opacity-70">Articles will appear here once the prediction is generated.</p>
      </div>
    );
  }

  // Show up to 8 most recent articles
  const displayArticles = articles.slice(0, 8);

  return (
    <div className="space-y-3">
      {displayArticles.map((article, index) => (
        <div
          key={index}
          className="p-4 border border-border rounded-xl hover:border-primary/40 hover:bg-muted/20 transition-all duration-150"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2 min-w-0">
              {/* Title */}
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1.5"
                >
                  <h4 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ) : (
                <h4 className="font-semibold text-foreground leading-snug line-clamp-2">
                  {article.title}
                </h4>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="font-semibold text-foreground/70">{getSourceLabel(article.source)}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.publishedDate)}
                </span>
              </div>

              {/* Summary */}
              {article.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              )}
            </div>

            {/* Sentiment Badge */}
            <div className="shrink-0 pt-0.5">
              <NewsSentimentBadge sentiment={article.sentiment} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

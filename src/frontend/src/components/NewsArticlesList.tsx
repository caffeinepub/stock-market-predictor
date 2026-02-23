import { type NewsArticle } from '../backend';
import { ExternalLink, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import NewsSentimentBadge from './NewsSentimentBadge';

interface NewsArticlesListProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

export default function NewsArticlesList({ articles, isLoading }: NewsArticlesListProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No news articles available at the moment.</p>
      </div>
    );
  }

  // Show up to 10 most recent articles
  const displayArticles = articles.slice(0, 10);

  return (
    <div className="space-y-4">
      {displayArticles.map((article, index) => (
        <div
          key={index}
          className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-foreground leading-tight">
                {article.title}
              </h4>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium">{article.source}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.timestamp)}
                </span>
              </div>

              {article.content && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.content}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <NewsSentimentBadge score={0} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

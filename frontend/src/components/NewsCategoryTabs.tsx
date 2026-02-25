import { type NewsArticle, NewsCategory } from '../backend';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import NewsSentimentBadge from './NewsSentimentBadge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewsCategoryTabsProps {
  articles: NewsArticle[];
  isLoading: boolean;
}

function getSourceLabel(source: NewsArticle['source']): string {
  switch (source.__kind__) {
    case 'cnbc': return 'CNBC';
    case 'bloomberg': return 'Bloomberg';
    case 'bbc': return 'BBC';
    case 'reuters': return 'Reuters';
    case 'economicTimes': return 'Economic Times';
    case 'mint': return 'Mint';
    case 'yahooFinance': return 'Yahoo Finance';
    case 'barrons': return 'Barron\'s';
    case 'fortune': return 'Fortune';
    case 'marketWatch': return 'MarketWatch';
    case 'other': return source.other || 'Other';
    default: return 'Other';
  }
}

function getCategoryLabel(category: NewsCategory): string {
  switch (category) {
    case NewsCategory.worldMarkets: return 'World Markets';
    case NewsCategory.indiaTradeDeals: return 'India Trade Deals';
    case NewsCategory.tariffs: return 'Tariffs';
    case NewsCategory.importExport: return 'Import/Export';
    case NewsCategory.regulatory: return 'Regulatory';
    case NewsCategory.general: return 'General';
    default: return 'General';
  }
}

const TABS = [
  { value: 'all', label: 'All', category: null },
  { value: 'worldMarkets', label: 'World Markets', category: NewsCategory.worldMarkets },
  { value: 'indiaTradeDeals', label: 'India Trade Deals', category: NewsCategory.indiaTradeDeals },
  { value: 'tariffs', label: 'Tariffs & Import/Export', category: null, categories: [NewsCategory.tariffs, NewsCategory.importExport] },
  { value: 'regulatory', label: 'Regulatory', category: NewsCategory.regulatory },
];

function ArticleCard({ article }: { article: NewsArticle }) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const sourceLabel = getSourceLabel(article.source);

  return (
    <div className="p-4 border border-border rounded-xl hover:border-primary/40 hover:bg-muted/20 transition-all duration-150">
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-semibold">
              {sourceLabel}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 text-muted-foreground">
              {getCategoryLabel(article.category)}
            </Badge>
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
  );
}

function ArticleList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
        <Newspaper className="h-8 w-8 opacity-30" />
        <p className="text-sm">No articles in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.slice(0, 20).map((article, index) => (
        <ArticleCard key={index} article={article} />
      ))}
    </div>
  );
}

export default function NewsCategoryTabs({ articles, isLoading }: NewsCategoryTabsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border border-border rounded-xl space-y-2 animate-pulse">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
        <Newspaper className="h-10 w-10 opacity-30" />
        <p className="text-sm">No news articles available at the moment.</p>
        <p className="text-xs opacity-70">Articles will appear here once the prediction is generated.</p>
      </div>
    );
  }

  const getFilteredArticles = (tab: typeof TABS[number]) => {
    if (tab.value === 'all') return articles;
    if ('categories' in tab && tab.categories) {
      return articles.filter((a) => tab.categories!.includes(a.category));
    }
    if (tab.category) {
      return articles.filter((a) => a.category === tab.category);
    }
    return articles;
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="flex w-max min-w-full gap-1 h-auto p-1 mb-4">
          {TABS.map((tab) => {
            const count = getFilteredArticles(tab).length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs sm:text-sm whitespace-nowrap px-3 py-1.5 data-[state=active]:font-semibold"
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </ScrollArea>

      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          <ArticleList articles={getFilteredArticles(tab)} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

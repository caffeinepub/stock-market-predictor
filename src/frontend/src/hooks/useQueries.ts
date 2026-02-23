import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type StockPrediction, type NewsArticle } from '../backend';

export function useStockPrediction(symbol: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StockPrediction | null>({
    queryKey: ['stockPrediction', symbol],
    queryFn: async () => {
      if (!actor) return null;
      const prediction = await actor.getStockPrediction(symbol.toUpperCase());
      return prediction;
    },
    enabled: !!actor && !isFetching && !!symbol,
  });
}

export function useStockPredictions(symbol: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StockPrediction[]>({
    queryKey: ['stockPredictions', symbol],
    queryFn: async () => {
      if (!actor) return [];
      const predictions = await actor.getStockPredictionsBySymbol(symbol.toUpperCase());
      // Sort by timestamp descending (most recent first)
      return predictions.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching && !!symbol,
  });
}

export function useNewsArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<NewsArticle[]>({
    queryKey: ['newsArticles'],
    queryFn: async () => {
      if (!actor) return [];
      const articles = await actor.getAllNewsArticles();
      // Sort by timestamp descending (most recent first)
      return articles.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHistoricalPredictions(startTime: bigint, endTime: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<StockPrediction[]>({
    queryKey: ['historicalPredictions', startTime.toString(), endTime.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStockPredictionsBetweenTimes(startTime, endTime);
    },
    enabled: !!actor && !isFetching,
  });
}

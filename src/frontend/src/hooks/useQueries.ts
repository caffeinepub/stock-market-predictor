import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type StockPrediction, type NewsArticle, PredictedMovement } from '../backend';
import { toast } from 'sonner';

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

// Generate mock prediction data for a stock
function generateMockPrediction(symbol: string): StockPrediction {
  const timestamp = BigInt(Date.now() * 1000000); // Convert to nanoseconds
  
  // Generate random but realistic values
  const predictionScore = Math.random() * 100;
  const confidenceLevel = 60 + Math.random() * 35; // 60-95%
  
  // Determine movement based on prediction score
  let predictedMovement: PredictedMovement;
  if (predictionScore > 60) {
    predictedMovement = PredictedMovement.bullish;
  } else if (predictionScore < 40) {
    predictedMovement = PredictedMovement.bearish;
  } else {
    predictedMovement = PredictedMovement.neutral;
  }
  
  // Generate FII/DII data
  const fiiBuying = Math.random() * 1000 + 500;
  const fiiSelling = Math.random() * 1000 + 300;
  const diiBuying = Math.random() * 800 + 400;
  const diiSelling = Math.random() * 800 + 200;
  
  // Generate news sentiment
  const newsSentimentScore = (Math.random() * 2 - 1) * 100; // -100 to 100
  
  // Generate chart patterns
  const patterns = [
    'Head and Shoulders',
    'Double Bottom',
    'Ascending Triangle',
    'Bull Flag',
    'Cup and Handle',
    'Falling Wedge',
    'Rising Wedge',
    'Symmetrical Triangle'
  ];
  
  const numPatterns = Math.floor(Math.random() * 3) + 1;
  const chartPatterns = Array.from({ length: numPatterns }, () => ({
    patternName: patterns[Math.floor(Math.random() * patterns.length)],
    confidenceScore: 60 + Math.random() * 35
  }));
  
  return {
    stockSymbol: symbol.toUpperCase(),
    predictionScore,
    confidenceLevel,
    timestamp,
    predictedMovement,
    newsSentimentScore,
    fiiBuying,
    fiiSelling,
    diiBuying,
    diiSelling,
    chartPatterns
  };
}

export function useAddStockPrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) {
        throw new Error('Backend actor not initialized');
      }

      const upperSymbol = symbol.toUpperCase();
      
      // Check if prediction already exists
      const existing = await actor.getStockPrediction(upperSymbol);
      if (existing) {
        return { symbol: upperSymbol, isNew: false };
      }

      // Generate and store new prediction
      const prediction = generateMockPrediction(upperSymbol);
      await actor.storePrediction(prediction);
      
      return { symbol: upperSymbol, isNew: true };
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch the new data
      queryClient.invalidateQueries({ queryKey: ['stockPrediction', data.symbol] });
      queryClient.invalidateQueries({ queryKey: ['stockPredictions', data.symbol] });
      
      if (data.isNew) {
        toast.success(`Successfully added prediction for ${data.symbol}`);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to add stock prediction:', error);
      toast.error('Failed to add stock prediction. Please try again.');
    }
  });
}

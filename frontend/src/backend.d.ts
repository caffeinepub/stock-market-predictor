import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type MarketCallConfidenceScore = bigint;
export interface StockPrediction {
    stockSymbol: string;
    shortTermPriceTargetLower: number;
    riskFactors: Array<RiskFactor>;
    diiSelling: number;
    confidenceScore: number;
    shortTermPriceTargetUpper: number;
    priceDirection: PriceDirection;
    fiiBuying: number;
    timestamp: Time;
    technicalIndicators: Array<TechnicalIndicator>;
    newsSentimentScore: number;
    fiiSelling: number;
    aiRationale: string;
    diiBuying: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export type NewsSource = {
    __kind__: "bbc";
    bbc: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "yahooFinance";
    yahooFinance: null;
} | {
    __kind__: "cnbc";
    cnbc: null;
} | {
    __kind__: "mint";
    mint: null;
} | {
    __kind__: "bloomberg";
    bloomberg: null;
} | {
    __kind__: "economicTimes";
    economicTimes: null;
} | {
    __kind__: "reuters";
    reuters: null;
} | {
    __kind__: "barrons";
    barrons: null;
} | {
    __kind__: "marketWatch";
    marketWatch: null;
} | {
    __kind__: "fortune";
    fortune: null;
};
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TechnicalIndicator {
    indicatorName: string;
    weightedScore: number;
}
export interface RiskFactor {
    impactLevel: number;
    description: string;
}
export interface DailyStockPick {
    trend: Variant_bullish_bearish;
    newsSentiment: number;
    fiiFlow: Variant_buy_sell_neutral;
    globalCues: Sentiment;
    callAction: Variant_buy_sell;
    sectorOverrideApplied: boolean;
    strikePrice: number;
    putAction: Variant_buy_sell;
    timestamp: Time;
    recommendedOption: Variant_ce_pe;
    sectorDirection: Variant_bullish_bearish_neutral;
    expiry: string;
    regulatorySignal: RegulatorySignal;
    worldMarketTrend: Variant_bullish_bearish_neutral;
    symbol: string;
    isHighVolume: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface NewsArticle {
    url: string;
    title: string;
    source: NewsSource;
    publishedDate: Time;
    sentiment: Sentiment;
    summary: string;
    category: NewsCategory;
}
export interface MarketCall {
    call: Variant_bullish_bearish_moderate;
    confidenceScore: MarketCallConfidenceScore;
    rationale: string;
    timestamp: Time;
    individualScores: {
        chartPatternSignal: number;
        fiiDiiFlowScore: number;
        regulatoryOverhang: number;
        newsSentimentScore: number;
    };
}
export interface PredictionAnalysis {
    predictionId: bigint;
    analyticalNotes: string;
    prediction: StockPrediction;
    newsArticles: Array<NewsArticle>;
    timestamp: Time;
}
export enum NewsCategory {
    regulatory = "regulatory",
    tariffs = "tariffs",
    indiaTradeDeals = "indiaTradeDeals",
    worldMarkets = "worldMarkets",
    general = "general",
    importExport = "importExport"
}
export enum Sentiment {
    negative = "negative",
    positive = "positive",
    neutral = "neutral"
}
export enum Variant_bullish_bearish {
    bullish = "bullish",
    bearish = "bearish"
}
export enum Variant_bullish_bearish_moderate {
    bullish = "bullish",
    bearish = "bearish",
    moderate = "moderate"
}
export enum Variant_bullish_bearish_neutral {
    bullish = "bullish",
    bearish = "bearish",
    neutral = "neutral"
}
export enum Variant_buy_sell {
    buy = "buy",
    sell = "sell"
}
export enum Variant_buy_sell_neutral {
    buy = "buy",
    sell = "sell",
    neutral = "neutral"
}
export enum Variant_ce_pe {
    ce = "ce",
    pe = "pe"
}
export interface backendInterface {
    fetchStockSummaryFromWikipedia(stockSymbol: string): Promise<string>;
    generateAndStoreDailyStockPicks(picks: Array<DailyStockPick>): Promise<void>;
    getAllMarketCalls(): Promise<Array<MarketCall>>;
    getAllNewsFeeds(): Promise<Array<NewsArticle>>;
    getAnalysisOfStockPredictions(analysisId: bigint): Promise<PredictionAnalysis | null>;
    getDaysMarketCall(marketCallId: bigint): Promise<MarketCall | null>;
    getHistoricalForecast(stockSymbol: string): Promise<Array<StockPrediction>>;
    getLastTradingDaysStockPicks(): Promise<Array<DailyStockPick> | null>;
    storeMarketCall(callType: Variant_bullish_bearish_moderate, confidenceScore: MarketCallConfidenceScore, rationale: string, newsSentimentScore: number, fiiDiiFlowScore: number, chartPatternSignal: number, regulatoryOverhang: number): Promise<bigint>;
    storeNewsArticle(title: string, source: NewsSource, category: NewsCategory, url: string, summary: string, sentiment: Sentiment): Promise<bigint>;
    storePredictionAnalysis(predictionId: bigint, analyticalNotes: string): Promise<bigint | null>;
    storePredictionForStock(symbol: string, priceDirection: PriceDirection, targetLower: number, targetUpper: number, confidence: number, rationale: string, riskFactors: Array<RiskFactor>, technicalIndicators: Array<TechnicalIndicator>, newsSentiment: number, fiiBuying: number, fiiSelling: number, diiBuying: number, diiSelling: number): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DetectedChartPattern {
    patternName: string;
    confidenceScore: number;
}
export interface StockPrediction {
    stockSymbol: string;
    predictedMovement: PredictedMovement;
    predictionScore: number;
    diiSelling: number;
    confidenceLevel: number;
    fiiBuying: number;
    timestamp: Time;
    chartPatterns: Array<DetectedChartPattern>;
    newsSentimentScore: number;
    fiiSelling: number;
    diiBuying: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface NewsArticle {
    title: string;
    content: string;
    source: string;
    timestamp: Time;
}
export interface http_header {
    value: string;
    name: string;
}
export enum PredictedMovement {
    bullish = "bullish",
    bearish = "bearish",
    neutral = "neutral"
}
export interface backendInterface {
    fetchNewsFromGoogle(): Promise<void>;
    getAllNewsArticles(): Promise<Array<NewsArticle>>;
    getAllStockPredictions(): Promise<Array<StockPrediction>>;
    getAuthor(): Promise<string>;
    getLatestNewsArticle(): Promise<NewsArticle | null>;
    getLatestStockPrediction(): Promise<StockPrediction | null>;
    getNewsArticleById(id: bigint): Promise<NewsArticle | null>;
    getStockPrediction(symbol: string): Promise<StockPrediction | null>;
    getStockPredictionById(id: bigint): Promise<StockPrediction | null>;
    getStockPredictionsBetweenTimes(startTime: Time, endTime: Time): Promise<Array<StockPrediction>>;
    getStockPredictionsBySymbol(symbol: string): Promise<Array<StockPrediction>>;
    storeNewsArticle(article: NewsArticle): Promise<bigint>;
    storePrediction(prediction: StockPrediction): Promise<void>;
    storeStockPrediction(prediction: StockPrediction): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}

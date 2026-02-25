import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";

module {
  type PriceDirection = {
    #bullish;
    #bearish;
    #neutral;
  };

  type NewsSource = {
    #cnbc;
    #bloomberg;
    #yahooFinance;
    #barrons;
    #fortune;
    #marketWatch;
    #bbc;
    #reuters;
    #economicTimes;
    #mint;
    #other : Text;
  };

  type NewsCategory = {
    #worldMarkets;
    #indiaTradeDeals;
    #tariffs;
    #importExport;
    #regulatory;
    #general;
  };

  type MarketCallConfidenceScore = Nat;

  type StockPrediction = {
    stockSymbol : Text;
    priceDirection : PriceDirection;
    shortTermPriceTargetLower : Float;
    shortTermPriceTargetUpper : Float;
    confidenceScore : Float;
    aiRationale : Text;
    riskFactors : [RiskFactor];
    technicalIndicators : [TechnicalIndicator];
    newsSentimentScore : Float;
    fiiBuying : Float;
    fiiSelling : Float;
    diiBuying : Float;
    diiSelling : Float;
    timestamp : Time.Time;
  };

  type TechnicalIndicator = {
    indicatorName : Text;
    weightedScore : Float;
  };

  type RiskFactor = {
    description : Text;
    impactLevel : Float;
  };

  type NewsArticle = {
    title : Text;
    source : NewsSource;
    category : NewsCategory;
    url : Text;
    publishedDate : Time.Time;
    summary : Text;
    sentiment : Sentiment;
  };

  type Sentiment = {
    #positive;
    #negative;
    #neutral;
  };

  type PredictionAnalysis = {
    predictionId : Nat;
    prediction : StockPrediction;
    newsArticles : [NewsArticle];
    analyticalNotes : Text;
    timestamp : Time.Time;
  };

  type MarketCall = {
    call : {
      #bullish;
      #bearish;
      #moderate;
    };
    confidenceScore : MarketCallConfidenceScore;
    rationale : Text;
    individualScores : {
      newsSentimentScore : Float;
      fiiDiiFlowScore : Float;
      chartPatternSignal : Float;
      regulatoryOverhang : Float;
    };
    timestamp : Time.Time;
  };

  type RegulatorySignal = {
    #positive;
    #negative;
    #neutral;
  };

  type DailyStockPick = {
    symbol : Text;
    trend : {
      #bullish;
      #bearish;
    };
    recommendedOption : {
      #ce;
      #pe;
    };
    strikePrice : Float;
    expiry : Text;
    isHighVolume : Bool;
    callAction : { #buy; #sell };
    putAction : { #buy; #sell };
    newsSentiment : Float;
    fiiFlow : {
      #buy;
      #sell;
      #neutral;
    };
    globalCues : {
      #positive;
      #negative;
      #neutral;
    };
    worldMarketTrend : {
      #bullish;
      #bearish;
      #neutral;
    };
    regulatorySignal : RegulatorySignal;
    sectorDirection : {
      #bullish;
      #bearish;
      #neutral;
    };
    sectorOverrideApplied : Bool;
    timestamp : Time.Time;
  };

  type OldActor = {
    predictions : Map.Map<Nat, StockPrediction>;
    newsArticles : Map.Map<Nat, NewsArticle>;
    analyses : Map.Map<Nat, PredictionAnalysis>;
    marketCalls : Map.Map<Nat, MarketCall>;
    dailyStockPicks : Map.Map<Time.Time, [DailyStockPick]>;
    stockPredictions : Map.Map<Text, StockPrediction>;
    nextPredictionId : Nat;
    nextNewsArticleId : Nat;
    nextAnalysisId : Nat;
    nextMarketCallId : Nat;
  };

  type NewActor = {
    predictions : Map.Map<Nat, StockPrediction>;
    newsArticles : Map.Map<Nat, NewsArticle>;
    analyses : Map.Map<Nat, PredictionAnalysis>;
    marketCalls : Map.Map<Nat, MarketCall>;
    dailyStockPicks : Map.Map<Time.Time, [DailyStockPick]>;
    stockPredictions : Map.Map<Text, StockPrediction>;
    nextPredictionId : Nat;
    nextNewsArticleId : Nat;
    nextAnalysisId : Nat;
    nextMarketCallId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};

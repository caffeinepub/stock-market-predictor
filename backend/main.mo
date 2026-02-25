import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Migration "migration";

(with migration = Migration.run)
actor {
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

  let predictions = Map.empty<Nat, StockPrediction>();
  let newsArticles = Map.empty<Nat, NewsArticle>();
  let analyses = Map.empty<Nat, PredictionAnalysis>();
  let marketCalls = Map.empty<Nat, MarketCall>();
  let dailyStockPicks = Map.empty<Time.Time, [DailyStockPick]>();
  let stockPredictions = Map.empty<Text, StockPrediction>();

  var nextPredictionId = 0;
  var nextNewsArticleId = 0;
  var nextAnalysisId = 0;
  var nextMarketCallId = 0;

  public shared ({ caller }) func storePredictionForStock(symbol : Text, priceDirection : PriceDirection, targetLower : Float, targetUpper : Float, confidence : Float, rationale : Text, riskFactors : [RiskFactor], technicalIndicators : [TechnicalIndicator], newsSentiment : Float, fiiBuying : Float, fiiSelling : Float, diiBuying : Float, diiSelling : Float) : async Nat {
    let predictionId = nextPredictionId;
    let stockPrediction : StockPrediction = {
      stockSymbol = symbol;
      priceDirection;
      shortTermPriceTargetLower = targetLower;
      shortTermPriceTargetUpper = targetUpper;
      confidenceScore = confidence;
      aiRationale = rationale;
      riskFactors;
      technicalIndicators;
      newsSentimentScore = newsSentiment;
      fiiBuying;
      fiiSelling;
      diiBuying;
      diiSelling;
      timestamp = Time.now();
    };

    predictions.add(predictionId, stockPrediction);
    nextPredictionId += 1;

    predictionId;
  };

  public shared ({ caller }) func storeNewsArticle(title : Text, source : NewsSource, category : NewsCategory, url : Text, summary : Text, sentiment : Sentiment) : async Nat {
    let articleId = nextNewsArticleId;
    let newsArticle = {
      title;
      source;
      category;
      url;
      publishedDate = Time.now();
      summary;
      sentiment;
    };

    newsArticles.add(articleId, newsArticle);
    nextNewsArticleId += 1;

    articleId;
  };

  public shared ({ caller }) func storePredictionAnalysis(predictionId : Nat, analyticalNotes : Text) : async ?Nat {
    switch (predictions.get(predictionId)) {
      case (null) { null };
      case (?prediction) {
        let analysisId = nextAnalysisId;
        let newsArticlesForPrediction = newsArticles.values().toArray();
        let analysis = {
          predictionId;
          prediction;
          newsArticles = newsArticlesForPrediction;
          analyticalNotes;
          timestamp = Time.now();
        };
        analyses.add(analysisId, analysis);
        nextAnalysisId += 1;
        ?analysisId;
      };
    };
  };

  public query ({ caller }) func getAnalysisOfStockPredictions(analysisId : Nat) : async ?PredictionAnalysis {
    analyses.get(analysisId);
  };

  public query ({ caller }) func getHistoricalForecast(stockSymbol : Text) : async [StockPrediction] {
    predictions.values().toArray().filter(func(p) { p.stockSymbol == stockSymbol });
  };

  public query ({ caller }) func getAllNewsFeeds() : async [NewsArticle] {
    newsArticles.values().toArray();
  };

  public shared ({ caller }) func fetchStockSummaryFromWikipedia(stockSymbol : Text) : async Text {
    let url = "https://en.wikipedia.org/api/rest_v1/page/summary/" # stockSymbol;
    await OutCall.httpGetRequest(url, [], transform);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func storeMarketCall(callType : { #bullish; #bearish; #moderate }, confidenceScore : MarketCallConfidenceScore, rationale : Text, newsSentimentScore : Float, fiiDiiFlowScore : Float, chartPatternSignal : Float, regulatoryOverhang : Float) : async Nat {
    let marketCallId = nextMarketCallId;
    let marketCall : MarketCall = {
      call = callType;
      confidenceScore;
      rationale;
      individualScores = {
        newsSentimentScore;
        fiiDiiFlowScore;
        chartPatternSignal;
        regulatoryOverhang;
      };
      timestamp = Time.now();
    };

    marketCalls.add(marketCallId, marketCall);
    nextMarketCallId += 1;

    marketCallId;
  };

  public query ({ caller }) func getDaysMarketCall(marketCallId : Nat) : async ?MarketCall {
    marketCalls.get(marketCallId);
  };

  public query ({ caller }) func getAllMarketCalls() : async [MarketCall] {
    marketCalls.values().toArray();
  };

  public shared ({ caller }) func generateAndStoreDailyStockPicks(
    picks : [DailyStockPick]
  ) : async () {
    let today = Time.now();
    dailyStockPicks.add(today, picks);
  };

  public query ({ caller }) func getLastTradingDaysStockPicks() : async ?[DailyStockPick] {
    if (dailyStockPicks.size() == 0) {
      return null;
    };

    var maxTimestamp = 0 : Int;

    let iter = dailyStockPicks.keys();
    iter.forEach(
      func(ts) {
        if (ts > maxTimestamp) {
          maxTimestamp := ts;
        };
      }
    );

    let maxTimestampNat = maxTimestamp.toNat();
    dailyStockPicks.get(maxTimestampNat);
  };
};

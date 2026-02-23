import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  type PredictedMovement = {
    #bullish;
    #bearish;
    #neutral;
  };

  type StockPrediction = {
    stockSymbol : Text;
    predictionScore : Float;
    confidenceLevel : Float;
    timestamp : Time.Time;
    predictedMovement : PredictedMovement;
    newsSentimentScore : Float;
    fiiBuying : Float;
    fiiSelling : Float;
    diiBuying : Float;
    diiSelling : Float;
    chartPatterns : [DetectedChartPattern];
  };

  type DetectedChartPattern = {
    patternName : Text;
    confidenceScore : Float;
  };

  type NewsArticle = {
    title : Text;
    content : Text;
    source : Text;
    timestamp : Time.Time;
  };

  let predictionsStore = Map.empty<Nat, StockPrediction>();
  var nextPredictionId = 0;

  let newsArticlesStore = Map.empty<Nat, NewsArticle>();
  var nextNewsArticleId = 0;

  let predictionData = Map.empty<Text, StockPrediction>();

  public query ({ caller }) func getStockPrediction(symbol : Text) : async ?StockPrediction {
    predictionData.get(symbol);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchNewsFromGoogle() : async () {
    let url = "https://newsapi.org/v2/everything?q=stock+market+india&apiKey=3506c2bc4e8043bf8356daa6b8a969e4";
    let _ = await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func storeStockPrediction(prediction : StockPrediction) : async Nat {
    let predictionId = nextPredictionId;
    predictionsStore.add(predictionId, prediction);
    nextPredictionId += 1;
    predictionId;
  };

  public shared ({ caller }) func storeNewsArticle(article : NewsArticle) : async Nat {
    let articleId = nextNewsArticleId;
    newsArticlesStore.add(articleId, article);
    nextNewsArticleId += 1;
    articleId;
  };

  public query ({ caller }) func getAuthor() : async Text {
    "blckrock";
  };

  public query ({ caller }) func getStockPredictionById(id : Nat) : async ?StockPrediction {
    predictionsStore.get(id);
  };

  public query ({ caller }) func getAllStockPredictions() : async [StockPrediction] {
    predictionsStore.toArray().map(func((_, prediction)) { prediction });
  };

  public query ({ caller }) func getNewsArticleById(id : Nat) : async ?NewsArticle {
    newsArticlesStore.get(id);
  };

  public query ({ caller }) func getAllNewsArticles() : async [NewsArticle] {
    newsArticlesStore.toArray().map(func((_, article)) { article });
  };

  func safeNatToNat(x : Nat) : Nat {
    if (x == 0) { return 0 };
    x - 1;
  };

  public query ({ caller }) func getLatestStockPrediction() : async ?StockPrediction {
    if (nextPredictionId == 0) { return null };
    predictionsStore.get(safeNatToNat(nextPredictionId));
  };

  public query ({ caller }) func getLatestNewsArticle() : async ?NewsArticle {
    if (nextNewsArticleId == 0) { return null };
    newsArticlesStore.get(safeNatToNat(nextNewsArticleId));
  };

  public query ({ caller }) func getStockPredictionsBySymbol(symbol : Text) : async [StockPrediction] {
    predictionsStore.toArray().filter(
      func((_, prediction)) { prediction.stockSymbol == symbol }
    ).map(func((_, prediction)) { prediction });
  };

  public query ({ caller }) func getStockPredictionsBetweenTimes(startTime : Time.Time, endTime : Time.Time) : async [StockPrediction] {
    predictionsStore.toArray().filter(
      func((_, prediction)) {
        prediction.timestamp >= startTime and prediction.timestamp <= endTime
      }
    ).map(func((_, prediction)) { prediction });
  };
};

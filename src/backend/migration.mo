import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  type OldActor = {
    predictionsStore : Map.Map<Nat, StockPrediction>;
    nextPredictionId : Nat;
    newsArticlesStore : Map.Map<Nat, NewsArticle>;
    nextNewsArticleId : Nat;
    predictionData : Map.Map<Text, StockPrediction>;
  };

  type StockPrediction = {
    stockSymbol : Text;
    predictionScore : Float;
    confidenceLevel : Float;
    timestamp : Int;
    predictedMovement : PredictedMovement;
    newsSentimentScore : Float;
    fiiBuying : Float;
    fiiSelling : Float;
    diiBuying : Float;
    diiSelling : Float;
    chartPatterns : [DetectedChartPattern];
  };

  type PredictedMovement = {
    #bullish;
    #bearish;
    #neutral;
  };

  type DetectedChartPattern = {
    patternName : Text;
    confidenceScore : Float;
  };

  type NewsArticle = {
    title : Text;
    content : Text;
    source : Text;
    timestamp : Int;
  };

  type NewActor = {
    predictionsStore : Map.Map<Nat, StockPrediction>;
    nextPredictionId : Nat;
    newsArticlesStore : Map.Map<Nat, NewsArticle>;
    nextNewsArticleId : Nat;
    predictionData : Map.Map<Text, StockPrediction>;
  };

  public func run(old : OldActor) : NewActor {
    { old with predictionData = Map.empty<Text, StockPrediction>() };
  };
};

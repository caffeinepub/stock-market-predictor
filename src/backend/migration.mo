import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
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

  type OldActor = {
    predictionsStore : Map.Map<Nat, StockPrediction>;
    newsArticlesStore : Map.Map<Nat, NewsArticle>;
    nextPredictionId : Nat;
    nextNewsArticleId : Nat;
  };

  type NewActor = {
    predictionsStore : Map.Map<Nat, StockPrediction>;
    newsArticlesStore : Map.Map<Nat, NewsArticle>;
    nextPredictionId : Nat;
    nextNewsArticleId : Nat;
    predictionData : Map.Map<Text, StockPrediction>;
  };

  public func run(old : OldActor) : NewActor {
    let predictionData = Map.empty<Text, StockPrediction>();

    // Example data
    predictionData.add(
      "SBIN",
      {
        stockSymbol = "SBIN";
        predictionScore = 0.7;
        confidenceLevel = 0.85;
        timestamp = 1717595394414;
        predictedMovement = #bullish;
        newsSentimentScore = 0.6;
        fiiBuying = 1.2;
        fiiSelling = 0.8;
        diiBuying = 1.0;
        diiSelling = 0.5;
        chartPatterns = [{
          patternName = "cup and handle";
          confidenceScore = 0.4;
        }];
      },
    );
    predictionData.add(
      "TCS",
      {
        stockSymbol = "TCS";
        predictionScore = 0.65;
        confidenceLevel = 0.8;
        timestamp = 1717595394414;
        predictedMovement = #neutral;
        newsSentimentScore = 0.7;
        fiiBuying = 1.1;
        fiiSelling = 0.9;
        diiBuying = 0.8;
        diiSelling = 1.2;
        chartPatterns = [{
          patternName = "pennant";
          confidenceScore = 0.55;
        }];
      },
    );
    predictionData.add(
      "INFY",
      {
        stockSymbol = "INFY";
        predictionScore = 0.60;
        confidenceLevel = 0.78;
        timestamp = 1717595394414;
        predictedMovement = #bearish;
        newsSentimentScore = 0.5;
        fiiBuying = 1.3;
        fiiSelling = 1.0;
        diiBuying = 1.2;
        diiSelling = 0.9;
        chartPatterns = [{
          patternName = "cup";
          confidenceScore = 0.45;
        }];
      },
    );
    predictionData.add(
      "HDFC",
      {
        stockSymbol = "HDFC";
        predictionScore = 0.75;
        confidenceLevel = 0.88;
        timestamp = 1717595394414;
        predictedMovement = #bullish;
        newsSentimentScore = 0.8;
        fiiBuying = 1.1;
        fiiSelling = 0.7;
        diiBuying = 1.0;
        diiSelling = 0.6;
        chartPatterns = [{
          patternName = "cup and handle";
          confidenceScore = 0.7;
        }];
      },
    );
    predictionData.add(
      "RELIANCE",
      {
        stockSymbol = "RELIANCE";
        predictionScore = 0.68;
        confidenceLevel = 0.82;
        timestamp = 1717595394414;
        predictedMovement = #neutral;
        newsSentimentScore = 0.65;
        fiiBuying = 1.2;
        fiiSelling = 1.1;
        diiBuying = 1.0;
        diiSelling = 1.3;
        chartPatterns = [{
          patternName = "pennant";
          confidenceScore = 0.8;
        }];
      },
    );
    predictionData.add(
      "ICICIBANK",
      {
        stockSymbol = "ICICIBANK";
        predictionScore = 0.72;
        confidenceLevel = 0.86;
        timestamp = 1717595394414;
        predictedMovement = #bullish;
        newsSentimentScore = 0.75;
        fiiBuying = 1.3;
        fiiSelling = 0.8;
        diiBuying = 1.1;
        diiSelling = 0.7;
        chartPatterns = [{
          patternName = "cup";
          confidenceScore = 0.4;
        }];
      },
    );
    predictionData.add(
      "KOTAKBANK",
      {
        stockSymbol = "KOTAKBANK";
        predictionScore = 0.63;
        confidenceLevel = 0.79;
        timestamp = 1717595394414;
        predictedMovement = #neutral;
        newsSentimentScore = 0.6;
        fiiBuying = 1.0;
        fiiSelling = 1.2;
        diiBuying = 0.9;
        diiSelling = 1.1;
        chartPatterns = [{
          patternName = "cup and handle";
          confidenceScore = 0.58;
        }];
      },
    );

    { old with predictionData };
  };
};

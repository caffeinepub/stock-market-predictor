import { useState, useCallback } from 'react';

interface Stock {
  symbol: string;
  name: string;
}

const NSE_STOCKS: Stock[] = [
  // Banking & Financial Services
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd' },
  { symbol: 'ICICIGI', name: 'ICICI Lombard General Insurance Company Ltd' },
  { symbol: 'BAJAJHLDNG', name: 'Bajaj Holdings & Investment Ltd' },
  
  // IT & Technology
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd' },
  { symbol: 'INFY', name: 'Infosys Ltd' },
  { symbol: 'WIPRO', name: 'Wipro Ltd' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd' },
  { symbol: 'COFORGE', name: 'Coforge Ltd' },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd' },
  { symbol: 'LTTS', name: 'L&T Technology Services Ltd' },
  
  // Energy & Oil/Gas
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd' },
  { symbol: 'NTPC', name: 'NTPC Ltd' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd' },
  { symbol: 'ADANIPOWER', name: 'Adani Power Ltd' },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd' },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd' },
  
  // Automobiles
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd' },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd' },
  { symbol: 'ASHOKLEY', name: 'Ashok Leyland Ltd' },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd' },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International Ltd' },
  
  // Pharmaceuticals
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd' },
  { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories Ltd' },
  { symbol: 'CIPLA', name: 'Cipla Ltd' },
  { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd' },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd' },
  { symbol: 'LUPIN', name: 'Lupin Ltd' },
  { symbol: 'BIOCON', name: 'Biocon Ltd' },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Ltd' },
  { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd' },
  { symbol: 'ABBOTINDIA', name: 'Abbott India Ltd' },
  
  // FMCG & Consumer Goods
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd' },
  { symbol: 'ITC', name: 'ITC Ltd' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd' },
  { symbol: 'DABUR', name: 'Dabur India Ltd' },
  { symbol: 'MARICO', name: 'Marico Ltd' },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd' },
  { symbol: 'COLPAL', name: 'Colgate Palmolive (India) Ltd' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd' },
  { symbol: 'EMAMILTD', name: 'Emami Ltd' },
  { symbol: 'VBL', name: 'Varun Beverages Ltd' },
  
  // Metals & Mining
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd' },
  { symbol: 'VEDL', name: 'Vedanta Ltd' },
  { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power Ltd' },
  { symbol: 'SAIL', name: 'Steel Authority of India Ltd' },
  { symbol: 'NMDC', name: 'NMDC Ltd' },
  { symbol: 'NATIONALUM', name: 'National Aluminium Company Ltd' },
  { symbol: 'HINDZINC', name: 'Hindustan Zinc Ltd' },
  
  // Cement
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd' },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd' },
  { symbol: 'ACC', name: 'ACC Ltd' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd' },
  { symbol: 'DALMIACEM', name: 'Dalmia Bharat Ltd' },
  { symbol: 'JKCEMENT', name: 'JK Cement Ltd' },
  
  // Telecom
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd' },
  { symbol: 'INDUSINDBK', name: 'Vodafone Idea Ltd' },
  
  // Retail & E-commerce
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd' },
  { symbol: 'TRENT', name: 'Trent Ltd' },
  { symbol: 'TITAN', name: 'Titan Company Ltd' },
  
  // Infrastructure & Construction
  { symbol: 'LT', name: 'Larsen & Toubro Ltd' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd' },
  { symbol: 'SIEMENS', name: 'Siemens Ltd' },
  { symbol: 'ABB', name: 'ABB India Ltd' },
  { symbol: 'HAVELLS', name: 'Havells India Ltd' },
  { symbol: 'VOLTAS', name: 'Voltas Ltd' },
  
  // Paints & Chemicals
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd' },
  { symbol: 'BERGER', name: 'Berger Paints India Ltd' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd' },
  { symbol: 'AARTI', name: 'Aarti Industries Ltd' },
  
  // Hospitality & Travel
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd' },
  { symbol: 'INDIANHUME', name: 'Indian Hotels Company Ltd' },
  
  // Media & Entertainment
  { symbol: 'ZEEL', name: 'Zee Entertainment Enterprises Ltd' },
  { symbol: 'PVRINOX', name: 'PVR INOX Ltd' },
  
  // Real Estate
  { symbol: 'DLF', name: 'DLF Ltd' },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd' },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd' },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects Ltd' },
  
  // Diversified
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd' },
  { symbol: 'IEX', name: 'Indian Energy Exchange Ltd' },
  { symbol: 'IRCTC', name: 'Indian Railway Catering and Tourism Corporation Ltd' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd' },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd' },
  { symbol: 'PAYTM', name: 'One 97 Communications Ltd' },
];

export function useStockAutocomplete() {
  const [suggestions] = useState<Stock[]>(NSE_STOCKS);

  const filterSuggestions = useCallback((query: string): Stock[] => {
    if (!query || query.length < 1) return [];
    
    const upperQuery = query.toUpperCase();
    return suggestions.filter(
      (stock) =>
        stock.symbol.includes(upperQuery) ||
        stock.name.toUpperCase().includes(upperQuery)
    ).slice(0, 10); // Limit to 10 suggestions
  }, [suggestions]);

  return {
    suggestions,
    filterSuggestions,
  };
}

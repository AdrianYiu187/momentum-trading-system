// Vercel/Netlify API endpoint for stock data
const fetch = require('node-fetch');

// Environment variables
const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || 'e9827dca7dae7177259fcbbbc618a9689a482887a3daddd0bbcc5c32';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'LAHWHIN15OAVH7I3';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'bdcc5675-0e2b-4413-88be-4b9d16e25528';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
};

// Main handler function
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    const { method, query } = req;
    const { action, symbol, period, market } = query;

    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });

    switch (action) {
      case 'quote':
        return await getStockQuote(req, res, symbol);
      
      case 'history':
        return await getStockHistory(req, res, symbol, period);
      
      case 'screen':
        return await screenStocks(req, res, query);
      
      case 'indicators':
        return await getTechnicalIndicators(req, res, symbol);
      
      case 'news':
        return await getStockNews(req, res, symbol);
      
      case 'test':
        return await testConnection(req, res);
      
      default:
        return res.status(400).json({ 
          error: 'Invalid action parameter',
          validActions: ['quote', 'history', 'screen', 'indicators', 'news', 'test']
        });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Get stock quote
async function getStockQuote(req, res, symbol) {
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    // Try Alpha Vantage API first
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API rate limit exceeded');
    }

    const quote = data['Global Quote'];
    if (!quote) {
      throw new Error('No quote data available');
    }

    const result = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close'])
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Quote API error:', error);
    
    // Return mock data as fallback
    const mockQuote = generateMockQuote(symbol);
    return res.status(200).json({
      ...mockQuote,
      _isMockData: true,
      _error: error.message
    });
  }
}

// Get stock historical data
async function getStockHistory(req, res, symbol, period = '1Y') {
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    const func = period === '1D' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
    const interval = period === '1D' ? '&interval=5min' : '';
    
    const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API rate limit exceeded');
    }

    // Parse the time series data
    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    const timeSeries = data[timeSeriesKey];

    if (!timeSeries) {
      throw new Error('No historical data available');
    }

    const labels = [];
    const prices = [];
    const high = [];
    const low = [];
    const close = [];
    const volumes = [];

    Object.keys(timeSeries).reverse().forEach(date => {
      const dayData = timeSeries[date];
      labels.push(new Date(date).toLocaleDateString());
      prices.push(parseFloat(dayData['4. close']));
      high.push(parseFloat(dayData['2. high']));
      low.push(parseFloat(dayData['3. low']));
      close.push(parseFloat(dayData['4. close']));
      volumes.push(parseInt(dayData['5. volume']));
    });

    return res.status(200).json({ labels, prices, high, low, close, volumes });

  } catch (error) {
    console.error('History API error:', error);
    
    // Return mock data as fallback
    const mockHistory = generateMockHistory(getPeriodDays(period));
    return res.status(200).json({
      ...mockHistory,
      _isMockData: true,
      _error: error.message
    });
  }
}

// Screen stocks
async function screenStocks(req, res, criteria) {
  try {
    // In a real implementation, this would query multiple APIs
    // For now, return mock screening results
    const mockResults = await generateMockScreeningResults(criteria);
    
    return res.status(200).json({
      results: mockResults,
      criteria: criteria,
      timestamp: new Date().toISOString(),
      _isMockData: true
    });

  } catch (error) {
    console.error('Screening error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get technical indicators
async function getTechnicalIndicators(req, res, symbol) {
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    const [rsiData, macdData] = await Promise.all([
      getRSI(symbol),
      getMACD(symbol)
    ]);

    return res.status(200).json({
      symbol: symbol,
      rsi: rsiData,
      macd: macdData,
      labels: generateDateLabels(90)
    });

  } catch (error) {
    console.error('Indicators API error:', error);
    
    // Return mock data as fallback
    return res.status(200).json({
      symbol: symbol,
      rsi: generateMockRSI(90),
      macd: generateMockMACD(90),
      labels: generateDateLabels(90),
      _isMockData: true,
      _error: error.message
    });
  }
}

// Get stock news
async function getStockNews(req, res, symbol) {
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${symbol}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'News API error');
    }

    return res.status(200).json({
      articles: data.articles,
      totalResults: data.totalResults
    });

  } catch (error) {
    console.error('News API error:', error);
    
    // Return mock news as fallback
    const mockNews = generateMockNews(symbol);
    return res.status(200).json({
      articles: mockNews,
      totalResults: mockNews.length,
      _isMockData: true,
      _error: error.message
    });
  }
}

// Test API connections
async function testConnection(req, res) {
  const tests = {
    alphaVantage: false,
    newsAPI: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Test Alpha Vantage
    const avUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const avResponse = await fetch(avUrl);
    const avData = await avResponse.json();
    tests.alphaVantage = !avData['Error Message'] && !avData['Note'];
  } catch (error) {
    console.error('Alpha Vantage test failed:', error);
  }

  try {
    // Test News API
    const newsUrl = `https://newsapi.org/v2/everything?q=AAPL&pageSize=1&apiKey=${NEWS_API_KEY}`;
    const newsResponse = await fetch(newsUrl);
    const newsData = await newsResponse.json();
    tests.newsAPI = newsData.status === 'ok';
  } catch (error) {
    console.error('News API test failed:', error);
  }

  return res.status(200).json(tests);
}

// Helper functions for Alpha Vantage indicators
async function getRSI(symbol, period = 14) {
  const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=${period}&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data['Error Message'] || data['Note']) {
    throw new Error('RSI API error');
  }

  const rsiData = data['Technical Analysis: RSI'];
  return Object.keys(rsiData).reverse().map(date => parseFloat(rsiData[date]['RSI']));
}

async function getMACD(symbol) {
  const url = `https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data['Error Message'] || data['Note']) {
    throw new Error('MACD API error');
  }

  const macdData = data['Technical Analysis: MACD'];
  return Object.keys(macdData).reverse().map(date => parseFloat(macdData[date]['MACD']));
}

// Mock data generators
function generateMockQuote(symbol) {
  const basePrice = Math.random() * 200 + 50;
  const change = (Math.random() - 0.5) * 20;
  
  return {
    symbol: symbol,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    high: parseFloat((basePrice * 1.05).toFixed(2)),
    low: parseFloat((basePrice * 0.95).toFixed(2)),
    open: parseFloat((basePrice * (0.98 + Math.random() * 0.04)).toFixed(2)),
    previousClose: parseFloat((basePrice - change).toFixed(2))
  };
}

function generateMockHistory(days) {
  const labels = [];
  const prices = [];
  const high = [];
  const low = [];
  const close = [];
  const volumes = [];
  
  let currentPrice = 100 + Math.random() * 100;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    labels.push(date.toLocaleDateString());
    
    const change = (Math.random() - 0.5) * 0.1;
    currentPrice *= (1 + change);
    
    const dailyHigh = currentPrice * (1 + Math.random() * 0.05);
    const dailyLow = currentPrice * (1 - Math.random() * 0.05);
    const volume = Math.floor(Math.random() * 5000000) + 1000000;
    
    prices.push(parseFloat(currentPrice.toFixed(2)));
    high.push(parseFloat(dailyHigh.toFixed(2)));
    low.push(parseFloat(dailyLow.toFixed(2)));
    close.push(parseFloat(currentPrice.toFixed(2)));
    volumes.push(volume);
  }
  
  return { labels, prices, high, low, close, volumes };
}

function generateMockScreeningResults(criteria) {
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'US' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US' },
    { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US' },
    { symbol: '0700.HK', name: 'Tencent Holdings', market: 'HK' },
    { symbol: '0941.HK', name: 'China Mobile', market: 'HK' },
    { symbol: '000001.SZ', name: '平安银行', market: 'CN' },
    { symbol: '000002.SZ', name: '万科A', market: 'CN' }
  ];
  
  return mockStocks.map(stock => {
    const quote = generateMockQuote(stock.symbol);
    const rsi = 30 + Math.random() * 40;
    const volumeRatio = 1 + Math.random() * 2;
    const score = Math.floor(60 + Math.random() * 40);
    
    return {
      ...stock,
      price: quote.price,
      change: quote.changePercent,
      volumeRatio: parseFloat(volumeRatio.toFixed(1)),
      rsi: parseFloat(rsi.toFixed(1)),
      score: score
    };
  });
}

function generateMockRSI(days) {
  const data = [];
  let rsi = 50;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 10;
    rsi += change;
    rsi = Math.max(0, Math.min(100, rsi));
    data.push(parseFloat(rsi.toFixed(2)));
  }
  
  return data;
}

function generateMockMACD(days) {
  const data = [];
  let macd = 0;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 2;
    macd += change;
    data.push(parseFloat(macd.toFixed(4)));
  }
  
  return data;
}

function generateMockNews(symbol) {
  return [
    {
      title: `${symbol} Announces Strong Quarterly Results`,
      description: 'Company reports better than expected earnings and revenue growth.',
      url: '#',
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: 'Financial News' }
    },
    {
      title: `Analysts Upgrade ${symbol} Stock Rating`,
      description: 'Multiple analysts raise price targets citing strong fundamentals.',
      url: '#',
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: { name: 'Investment Research' }
    }
  ];
}

function generateDateLabels(days) {
  const labels = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    labels.push(date.toLocaleDateString());
  }
  
  return labels;
}

function getPeriodDays(period) {
  const periodMap = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '2Y': 730,
    '3Y': 1095,
    '5Y': 1825
  };
  return periodMap[period] || 90;
} 
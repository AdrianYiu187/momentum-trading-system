// 直接API調用版本 - 僅用於GitHub Pages測試
// ⚠️ 警告：這會暴露API keys，不建議用於生產環境

class DirectAPIManager {
    constructor() {
        this.isConnected = false;
        this.cache = new Map();
        this.cacheExpiry = new Map();
        
        // 直接使用API keys (不安全，但能在GitHub Pages工作)
        this.apiKeys = {
            alphaVantage: 'LAHWHIN15OAVH7I3',
            tushare: 'e9827dca7dae7177259fcbbbc618a9689a482887a3daddd0bbcc5c32',
            newsAPI: 'bdcc5675-0e2b-4413-88be-4b9d16e25528'
        };
        
        this.apiUrls = {
            alphaVantage: 'https://www.alphavantage.co/query',
            tushare: 'https://api.tushare.pro',
            newsAPI: 'https://newsapi.org/v2'
        };
    }
    
    // 快取管理
    setCache(key, data, expiry = 300000) { // 5分鐘快取
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + expiry);
    }
    
    getFromCache(key) {
        if (this.cache.has(key) && this.cacheExpiry.get(key) > Date.now()) {
            return this.cache.get(key);
        }
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        return null;
    }
    
    // 測試API連接
    async testConnections() {
        try {
            console.log('Testing direct API connections...');
            
            const tests = await Promise.allSettled([
                this.testAlphaVantage(),
                this.testNewsAPI()
            ]);
            
            const alphaVantageOK = tests[0].status === 'fulfilled';
            const newsOK = tests[1].status === 'fulfilled';
            
            const successful = tests.filter(result => result.status === 'fulfilled').length;
            this.isConnected = successful > 0;
            
            console.log('Direct API Test Results:', {
                alphaVantage: alphaVantageOK,
                news: newsOK,
                totalConnected: successful
            });
            
            return {
                connected: this.isConnected,
                alphaVantage: alphaVantageOK,
                tushare: false, // Tushare需要後端代理，無法直接調用
                news: newsOK,
                connectedCount: successful
            };
        } catch (error) {
            console.error('Direct API connection test failed:', error);
            this.isConnected = false;
            return { connected: false, error: error.message };
        }
    }
    
    // 測試Alpha Vantage API
    async testAlphaVantage() {
        const url = `${this.apiUrls.alphaVantage}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${this.apiKeys.alphaVantage}`;
        
        console.log('Testing Alpha Vantage API...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error(`Alpha Vantage: ${data['Error Message']}`);
        }
        if (data['Note']) {
            throw new Error('Alpha Vantage API rate limited');
        }
        if (data['Information']) {
            throw new Error('Alpha Vantage API rate limited');
        }
        
        console.log('Alpha Vantage API test successful');
        return data;
    }
    
    // 測試News API
    async testNewsAPI() {
        // 使用CORS代理來避免跨域問題
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = `${this.apiUrls.newsAPI}/everything?q=stock&pageSize=1&apiKey=${this.apiKeys.newsAPI}`;
        
        console.log('Testing News API...');
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        
        if (!response.ok) {
            throw new Error(`News API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data.status === 'error') {
            throw new Error(`News API: ${data.message}`);
        }
        
        console.log('News API test successful');
        return data;
    }
    
    // 獲取股票報價
    async getStockQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching quote for ${symbol} directly from Alpha Vantage...`);
        
        try {
            const url = `${this.apiUrls.alphaVantage}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKeys.alphaVantage}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Alpha Vantage API HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(`Alpha Vantage: ${data['Error Message']}`);
            }
            if (data['Note']) {
                throw new Error('Alpha Vantage API rate limited');
            }
            if (data['Information']) {
                throw new Error('Alpha Vantage API rate limited');
            }
            
            const quote = data['Global Quote'];
            if (!quote) {
                throw new Error('No quote data returned');
            }
            
            const formattedQuote = {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                high: parseFloat(quote['03. high']),
                low: parseFloat(quote['04. low']),
                open: parseFloat(quote['02. open']),
                previousClose: parseFloat(quote['08. previous close']),
                _source: 'api',
                _provider: 'Alpha Vantage (Direct)'
            };
            
            this.setCache(cacheKey, formattedQuote);
            console.log(`✓ Successfully fetched ${symbol} quote from Alpha Vantage`);
            return formattedQuote;
            
        } catch (error) {
            console.warn(`Alpha Vantage failed for ${symbol}:`, error.message);
            
            // 回退到Mock數據
            console.log(`Using mock data for ${symbol} (API unavailable)`);
            const mockData = this.getMockQuote(symbol);
            mockData._source = 'mock';
            mockData._reason = 'API unavailable';
            return mockData;
        }
    }
    
    // 獲取歷史數據
    async getStockHistory(symbol, period = '1Y') {
        const cacheKey = `history_${symbol}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching history for ${symbol} (${period}) directly from Alpha Vantage...`);
        
        try {
            let apiFunction = 'TIME_SERIES_DAILY';
            if (period === '1D' || period === '1W') {
                apiFunction = 'TIME_SERIES_INTRADAY';
            } else if (period === '5Y' || period === '10Y') {
                apiFunction = 'TIME_SERIES_WEEKLY';
            }
            
            let url = `${this.apiUrls.alphaVantage}?function=${apiFunction}&symbol=${symbol}&apikey=${this.apiKeys.alphaVantage}`;
            
            if (apiFunction === 'TIME_SERIES_INTRADAY') {
                url += '&interval=5min';
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Alpha Vantage API HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(`Alpha Vantage: ${data['Error Message']}`);
            }
            if (data['Note']) {
                throw new Error('Alpha Vantage API rate limited');
            }
            if (data['Information']) {
                throw new Error('Alpha Vantage API rate limited');
            }
            
            let timeSeries = data['Time Series (Daily)'] || 
                            data['Time Series (5min)'] || 
                            data['Weekly Time Series'] ||
                            data['Time Series (1min)'];
            
            if (!timeSeries) {
                throw new Error('No historical data returned');
            }
            
            const dates = Object.keys(timeSeries).slice(0, 100).reverse();
            const labels = dates.map(date => new Date(date).toLocaleDateString());
            const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
            const high = dates.map(date => parseFloat(timeSeries[date]['2. high']));
            const low = dates.map(date => parseFloat(timeSeries[date]['3. low']));
            const volumes = dates.map(date => parseInt(timeSeries[date]['5. volume']));
            
            const formattedHistory = {
                labels: labels,
                prices: prices,
                high: high,
                low: low,
                close: prices,
                volumes: volumes,
                _source: 'api',
                _provider: 'Alpha Vantage (Direct)'
            };
            
            this.setCache(cacheKey, formattedHistory);
            console.log(`✓ Successfully fetched ${symbol} history from Alpha Vantage (${prices.length} data points)`);
            return formattedHistory;
            
        } catch (error) {
            console.warn(`Alpha Vantage history failed for ${symbol}:`, error.message);
            
            // 回退到Mock數據
            console.log(`Using mock history for ${symbol} (API unavailable)`);
            const mockData = MockDataGenerator.generatePriceData(this.getPeriodDays(period));
            mockData._source = 'mock';
            mockData._reason = 'API unavailable';
            return mockData;
        }
    }
    
    // 獲取新聞
    async getStockNews(symbol, limit = 10) {
        const cacheKey = `news_${symbol}_${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching news for ${symbol} from NewsAPI...`);
        
        try {
            // 使用CORS代理
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = `${this.apiUrls.newsAPI}/everything?q=${symbol}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.apiKeys.newsAPI}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
            
            if (!response.ok) {
                throw new Error(`News API HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(`News API: ${data.message}`);
            }
            
            const formattedNews = data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                source: article.source,
                _source: 'api',
                _provider: 'NewsAPI (Direct)'
            }));
            
            this.setCache(cacheKey, formattedNews);
            console.log(`✓ Successfully fetched ${formattedNews.length} news articles for ${symbol}`);
            return formattedNews;
            
        } catch (error) {
            console.warn(`News API failed for ${symbol}:`, error.message);
            
            // 回退到Mock新聞
            console.log(`Using mock news for ${symbol} (API unavailable)`);
            const mockNews = this.getMockNews(symbol);
            mockNews._source = 'mock';
            mockNews._reason = 'API unavailable';
            return mockNews;
        }
    }
    
    // 股票篩選 (Tushare無法直接調用，使用增強Mock)
    async screenStocks(criteria) {
        console.log('Screening stocks with enhanced mock data (Tushare requires backend proxy)...');
        
        // 因為Tushare API需要後端代理，這裡使用增強的Mock數據
        const mockData = await this.getMockScreeningResults(criteria);
        mockData._source = 'mock';
        mockData._reason = 'Tushare API requires backend proxy';
        return mockData;
    }
    
    // 技術指標
    async getTechnicalIndicators(symbol, indicators = ['RSI', 'MACD']) {
        console.log(`Calculating indicators for ${symbol} (based on Alpha Vantage data)...`);
        
        try {
            // 先獲取歷史數據
            const history = await this.getStockHistory(symbol, '3M');
            
            // 基於真實歷史數據計算指標
            const result = {
                rsi: this.calculateRSI(history.prices),
                macd: this.calculateMACD(history.prices),
                labels: history.labels,
                _source: history._source,
                _provider: 'Calculated from ' + (history._provider || 'data')
            };
            
            return result;
        } catch (error) {
            console.warn(`Indicators calculation failed for ${symbol}:`, error.message);
            
            // 回退到Mock指標
            return {
                rsi: MockDataGenerator.generateRSIData(),
                macd: MockDataGenerator.generateMACDData(),
                labels: this.generateDateLabels(90),
                _source: 'mock',
                _reason: 'Calculation failed'
            };
        }
    }
    
    // 簡化的RSI計算
    calculateRSI(prices, period = 14) {
        const rsi = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period) {
                rsi.push(50); // 預設值
            } else {
                // 簡化的RSI計算
                const recentPrices = prices.slice(i - period, i);
                const gains = [];
                const losses = [];
                
                for (let j = 1; j < recentPrices.length; j++) {
                    const change = recentPrices[j] - recentPrices[j - 1];
                    if (change > 0) gains.push(change);
                    else losses.push(Math.abs(change));
                }
                
                const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b) / gains.length : 0;
                const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b) / losses.length : 0;
                
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsiValue = 100 - (100 / (1 + rs));
                rsi.push(Math.max(0, Math.min(100, rsiValue)));
            }
        }
        return rsi;
    }
    
    // 簡化的MACD計算
    calculateMACD(prices) {
        const macd = [];
        for (let i = 0; i < prices.length; i++) {
            // 簡化的MACD計算
            const ema12 = this.calculateEMA(prices.slice(0, i + 1), 12);
            const ema26 = this.calculateEMA(prices.slice(0, i + 1), 26);
            macd.push(ema12 - ema26);
        }
        return macd;
    }
    
    calculateEMA(prices, period) {
        if (prices.length === 0) return 0;
        if (prices.length === 1) return prices[0];
        
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }
    
    // Helper functions
    getPeriodDays(period) {
        const periodMap = {
            '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180,
            '1Y': 365, '2Y': 730, '3Y': 1095, '5Y': 1825
        };
        return periodMap[period] || 90;
    }
    
    generateDateLabels(days) {
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
    
    // Mock data generators (from original api.js)
    getMockQuote(symbol) {
        const basePrice = Math.random() * 200 + 50;
        const change = (Math.random() - 0.5) * 20;
        
        return {
            symbol: symbol,
            price: basePrice,
            change: change,
            changePercent: (change / basePrice) * 100,
            volume: Math.floor(Math.random() * 10000000) + 1000000,
            high: basePrice * 1.05,
            low: basePrice * 0.95,
            open: basePrice * (0.98 + Math.random() * 0.04),
            previousClose: basePrice - change
        };
    }
    
    getMockNews(symbol) {
        return [
            {
                title: `${symbol} 發布強勁季度業績`,
                description: '公司報告超預期盈利和收入增長。',
                url: '#',
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: { name: 'Financial News' }
            },
            {
                title: `分析師上調 ${symbol} 股票評級`,
                description: '多位分析師基於強勁基本面提高目標價。',
                url: '#',
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: { name: 'Investment Research' }
            }
        ];
    }
    
    async getMockScreeningResults(criteria) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', sector: 'Technology' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US', sector: 'Technology' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US', sector: 'Technology' },
            { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US', sector: 'Automotive' },
            { symbol: '0700.HK', name: '騰訊控股', market: 'HK', sector: 'Technology' },
            { symbol: '0941.HK', name: '中國移動', market: 'HK', sector: 'Telecommunications' },
            { symbol: '000001.SZ', name: '平安銀行', market: 'CN', sector: 'Financial' },
            { symbol: '600519.SH', name: '貴州茅台', market: 'CN', sector: 'Consumer Staples' }
        ];
        
        return mockStocks.map(stock => {
            const quote = this.getMockQuote(stock.symbol);
            const rsi = 30 + Math.random() * 40;
            const volumeRatio = 0.5 + Math.random() * 3;
            const score = 50 + Math.random() * 40;
            
            return {
                ...stock,
                price: quote.price,
                change: quote.changePercent,
                volumeRatio: volumeRatio,
                rsi: rsi,
                score: Math.round(score)
            };
        }).filter(stock => {
            if (criteria.markets && criteria.markets.length > 0 && !criteria.markets.includes('all')) {
                const marketMatches = criteria.markets.some(market => 
                    market.toLowerCase() === stock.market.toLowerCase()
                );
                if (!marketMatches) return false;
            }
            
            if (criteria.priceChange && Math.abs(stock.change) < criteria.priceChange) {
                return false;
            }
            
            if (criteria.volumeRatio && stock.volumeRatio < criteria.volumeRatio) {
                return false;
            }
            
            return true;
        }).sort((a, b) => b.score - a.score);
    }
}

// 創建直接API管理器實例
const directApiManager = new DirectAPIManager();

// 如果在GitHub Pages環境下，替換原來的apiManager
if (!window.location.hostname.includes('vercel.app') && 
    !window.location.hostname.includes('netlify.app')) {
    console.log('🔄 Using Direct API Manager for GitHub Pages');
    window.apiManager = directApiManager;
} 
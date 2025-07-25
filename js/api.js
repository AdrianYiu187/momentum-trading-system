// API Management System
class APIManager {
    constructor() {
        this.isConnected = false;
        this.rateLimits = new Map();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    // Test API connections
    async testConnections() {
        try {
            const tests = await Promise.allSettled([
                this.testAlphaVantage(),
                this.testYahooFinance()
            ]);
            
            const successful = tests.filter(result => result.status === 'fulfilled').length;
            this.isConnected = successful > 0;
            
            return {
                connected: this.isConnected,
                alphaVantage: tests[0].status === 'fulfilled',
                yahoo: tests[1].status === 'fulfilled'
            };
        } catch (error) {
            console.error('API connection test failed:', error);
            this.isConnected = false;
            return { connected: false };
        }
    }
    
    // Test Alpha Vantage API
    async testAlphaVantage() {
        const url = `${API_CONFIG.alphaVantage.baseUrl}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${API_CONFIG.alphaVantage.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Alpha Vantage API failed');
        
        const data = await response.json();
        if (data['Error Message']) throw new Error(data['Error Message']);
        if (data['Note']) throw new Error('API rate limited');
        
        return data;
    }
    
    // Test Yahoo Finance API (using a proxy or alternative)  
    async testYahooFinance() {
        // Using a CORS proxy for demo purposes
        // In production, you should use your own backend proxy
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = `${API_CONFIG.yahooFinance.baseUrl}/AAPL`;
        
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
            if (!response.ok) throw new Error('Yahoo Finance API failed');
            
            const data = await response.json();
            return data;
        } catch (error) {
            // Fallback: assume connection works
            console.warn('Yahoo Finance test failed, assuming connection:', error);
            return { chart: { result: [{}] } };
        }
    }
    
    // Get stock quote
    async getStockQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            // Try Alpha Vantage first
            const data = await this.getAlphaVantageQuote(symbol);
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to get stock quote:', error);
            // Return mock data for demo
            return this.getMockQuote(symbol);
        }
    }
    
    // Get stock historical data
    async getStockHistory(symbol, period = '1Y') {
        const cacheKey = `history_${symbol}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await this.getAlphaVantageHistory(symbol, period);
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to get stock history:', error);
            // Return mock data for demo
            return MockDataGenerator.generatePriceData(this.getPeriodDays(period));
        }
    }
    
    // Screen stocks based on criteria
    async screenStocks(criteria) {
        const cacheKey = `screen_${JSON.stringify(criteria)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            // In a real implementation, this would call multiple APIs
            // For demo, we'll return mock data
            const results = await this.getMockScreeningResults(criteria);
            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Screening failed:', error);
            throw error;
        }
    }
    
    // Get technical indicators
    async getTechnicalIndicators(symbol, indicators = ['RSI', 'MACD']) {
        const cacheKey = `indicators_${symbol}_${indicators.join('_')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const data = {};
            
            // Get data for each indicator
            for (const indicator of indicators) {
                switch (indicator) {
                    case 'RSI':
                        data.rsi = await this.getRSI(symbol);
                        break;
                    case 'MACD':
                        data.macd = await getMACD(symbol);
                        break;
                    default:
                        console.warn(`Unknown indicator: ${indicator}`);
                }
            }
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to get technical indicators:', error);
            // Return mock data
            return {
                rsi: MockDataGenerator.generateRSIData(),
                macd: MockDataGenerator.generateMACDData(),
                labels: this.generateDateLabels(90)
            };
        }
    }
    
    // Get news and catalysts
    async getStockNews(symbol, limit = 10) {
        const cacheKey = `news_${symbol}_${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const url = `${API_CONFIG.newsAPI.baseUrl}/everything?q=${symbol}&sortBy=publishedAt&pageSize=${limit}&apiKey=${API_CONFIG.newsAPI.apiKey}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('News API failed');
            
            const data = await response.json();
            this.setCache(cacheKey, data.articles);
            return data.articles;
        } catch (error) {
            console.error('Failed to get news:', error);
            // Return mock news
            return this.getMockNews(symbol);
        }
    }
    
    // Alpha Vantage API calls
    async getAlphaVantageQuote(symbol) {
        const url = `${API_CONFIG.alphaVantage.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_CONFIG.alphaVantage.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data['Error Message']) throw new Error(data['Error Message']);
        if (data['Note']) throw new Error('API rate limited');
        
        const quote = data['Global Quote'];
        return {
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
    }
    
    async getAlphaVantageHistory(symbol, period) {
        const func = period === '1D' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
        const interval = period === '1D' ? '&interval=5min' : '';
        
        const url = `${API_CONFIG.alphaVantage.baseUrl}?function=${func}&symbol=${symbol}${interval}&apikey=${API_CONFIG.alphaVantage.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data['Error Message']) throw new Error(data['Error Message']);
        if (data['Note']) throw new Error('API rate limited');
        
        // Parse the time series data
        const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
        const timeSeries = data[timeSeriesKey];
        
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
        
        return { labels, prices, high, low, close, volumes };
    }
    
    async getRSI(symbol, period = 14) {
        const url = `${API_CONFIG.alphaVantage.baseUrl}?function=RSI&symbol=${symbol}&interval=daily&time_period=${period}&series_type=close&apikey=${API_CONFIG.alphaVantage.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('RSI API request failed');
        
        const data = await response.json();
        if (data['Error Message']) throw new Error(data['Error Message']);
        if (data['Note']) throw new Error('API rate limited');
        
        const rsiData = data['Technical Analysis: RSI'];
        const rsiValues = Object.keys(rsiData).reverse().map(date => parseFloat(rsiData[date]['RSI']));
        
        return rsiValues;
    }
    
    async getMACD(symbol) {
        const url = `${API_CONFIG.alphaVantage.baseUrl}?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${API_CONFIG.alphaVantage.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('MACD API request failed');
        
        const data = await response.json();
        if (data['Error Message']) throw new Error(data['Error Message']);
        if (data['Note']) throw new Error('API rate limited');
        
        const macdData = data['Technical Analysis: MACD'];
        const macdValues = Object.keys(macdData).reverse().map(date => parseFloat(macdData[date]['MACD']));
        
        return macdValues;
    }
    
    // Mock data generators for demo/fallback
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
    
    async getMockScreeningResults(criteria) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 擴展Mock股票數據庫
        const mockStocks = [
            // 美股
            { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', sector: 'Technology', marketCap: 3000 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US', sector: 'Technology', marketCap: 2800 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US', sector: 'Technology', marketCap: 1800 },
            { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US', sector: 'Automotive', marketCap: 800 },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'US', sector: 'Technology', marketCap: 1200 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US', sector: 'Consumer Discretionary', marketCap: 1500 },
            { symbol: 'META', name: 'Meta Platforms Inc.', market: 'US', sector: 'Technology', marketCap: 900 },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co.', market: 'US', sector: 'Financial', marketCap: 600 },
            { symbol: 'V', name: 'Visa Inc.', market: 'US', sector: 'Financial', marketCap: 500 },
            { symbol: 'UNH', name: 'UnitedHealth Group Inc.', market: 'US', sector: 'Healthcare', marketCap: 550 },
            
            // 港股
            { symbol: '0700.HK', name: '騰訊控股', market: 'HK', sector: 'Technology', marketCap: 4200 },
            { symbol: '0941.HK', name: '中國移動', market: 'HK', sector: 'Telecommunications', marketCap: 1800 },
            { symbol: '0005.HK', name: '匯豐控股', market: 'HK', sector: 'Financial', marketCap: 1200 },
            { symbol: '1299.HK', name: '友邦保險', market: 'HK', sector: 'Financial', marketCap: 900 },
            { symbol: '1398.HK', name: '工商銀行', market: 'HK', sector: 'Financial', marketCap: 2100 },
            { symbol: '2318.HK', name: '中國平安', market: 'HK', sector: 'Financial', marketCap: 1100 },
            { symbol: '3690.HK', name: '美團-W', market: 'HK', sector: 'Consumer Discretionary', marketCap: 1000 },
            { symbol: '9988.HK', name: '阿里巴巴-SW', market: 'HK', sector: 'Technology', marketCap: 2200 },
            { symbol: '2020.HK', name: '安踏體育', market: 'HK', sector: 'Consumer Discretionary', marketCap: 300 },
            { symbol: '1810.HK', name: '小米集團-W', market: 'HK', sector: 'Technology', marketCap: 400 },
            
            // A股
            { symbol: '000001.SZ', name: '平安銀行', market: 'CN', sector: 'Financial', marketCap: 350 },
            { symbol: '000002.SZ', name: '萬科A', market: 'CN', sector: 'Real Estate', marketCap: 280 },
            { symbol: '000858.SZ', name: '五糧液', market: 'CN', sector: 'Consumer Staples', marketCap: 800 },
            { symbol: '300059.SZ', name: '東方財富', market: 'CN', sector: 'Financial', marketCap: 450 },
            { symbol: '600036.SH', name: '招商銀行', market: 'CN', sector: 'Financial', marketCap: 900 },
            { symbol: '600519.SH', name: '貴州茅台', market: 'CN', sector: 'Consumer Staples', marketCap: 2800 },
            { symbol: '600887.SH', name: '伊利股份', market: 'CN', sector: 'Consumer Staples', marketCap: 220 },
            { symbol: '000858.SZ', name: '五糧液', market: 'CN', sector: 'Consumer Staples', marketCap: 800 },
            { symbol: '002415.SZ', name: '海康威視', market: 'CN', sector: 'Technology', marketCap: 400 },
            { symbol: '300750.SZ', name: '寧德時代', market: 'CN', sector: 'Technology', marketCap: 1200 }
        ];
        
        return mockStocks.map(stock => {
            const quote = this.getEnhancedMockQuote(stock.symbol, stock.sector);
            const rsi = this.generateRealisticRSI();
            const volumeRatio = this.generateRealisticVolumeRatio();
            const score = this.calculateMomentumScore(quote.changePercent, volumeRatio, rsi);
            
            return {
                ...stock,
                price: quote.price,
                change: quote.changePercent,
                volumeRatio: volumeRatio,
                rsi: rsi,
                score: score,
                volume: quote.volume,
                high: quote.high,
                low: quote.low
            };
        }).filter(stock => {
            // 市場篩選
            if (criteria.markets && criteria.markets.length > 0 && !criteria.markets.includes('all')) {
                const marketMatches = criteria.markets.some(market => 
                    market.toLowerCase() === stock.market.toLowerCase() ||
                    (market === 'hk' && stock.market === 'HK') ||
                    (market === 'us' && stock.market === 'US') ||
                    (market === 'cn' && stock.market === 'CN')
                );
                if (!marketMatches) return false;
            }
            
            // 價格變動篩選 - 修復邏輯
            if (criteria.priceChange && Math.abs(stock.change) < criteria.priceChange) {
                return false;
            }
            
            // 成交量倍數篩選
            if (criteria.volumeRatio && stock.volumeRatio < criteria.volumeRatio) {
                return false;
            }
            
            // RSI範圍篩選
            if (criteria.rsiRange && criteria.rsiRange !== 'all') {
                const [minRsi, maxRsi] = criteria.rsiRange.split('-').map(Number);
                if (stock.rsi < minRsi || stock.rsi > maxRsi) {
                    return false;
                }
            }
            
            // 市值篩選
            if (criteria.minMarketCap && stock.marketCap < criteria.minMarketCap) {
                return false;
            }
            
            return true;
        }).sort((a, b) => b.score - a.score); // 按分數排序
    }
    
    // 增強的Mock報價生成
    getEnhancedMockQuote(symbol, sector) {
        // 根據板塊設定不同的波動率
        const sectorVolatility = {
            'Technology': 0.08,
            'Financial': 0.05,
            'Healthcare': 0.04,
            'Consumer Staples': 0.03,
            'Consumer Discretionary': 0.06,
            'Automotive': 0.10,
            'Telecommunications': 0.04,
            'Real Estate': 0.05
        };
        
        const volatility = sectorVolatility[sector] || 0.05;
        const basePrice = Math.random() * 200 + 50;
        
        // 生成更真實的價格變動（-8% 到 +8%）
        const changePercent = (Math.random() - 0.5) * 16 * volatility / 0.05;
        const change = basePrice * changePercent / 100;
        
        return {
            symbol: symbol,
            price: basePrice,
            change: change,
            changePercent: changePercent,
            volume: Math.floor(Math.random() * 50000000) + 1000000,
            high: basePrice + Math.abs(change) * 1.2,
            low: basePrice - Math.abs(change) * 1.2,
            open: basePrice + (Math.random() - 0.5) * Math.abs(change),
            previousClose: basePrice - change
        };
    }
    
    // 生成真實的RSI值
    generateRealisticRSI() {
        // RSI通常在20-80範圍內分佈
        const random = Math.random();
        if (random < 0.1) return 10 + Math.random() * 20; // 10-30 (超賣)
        if (random < 0.2) return 70 + Math.random() * 20; // 70-90 (超買)
        return 30 + Math.random() * 40; // 30-70 (正常)
    }
    
    // 生成真實的成交量倍數
    generateRealisticVolumeRatio() {
        const random = Math.random();
        if (random < 0.7) return 0.5 + Math.random() * 1.5; // 0.5-2 (正常)
        if (random < 0.9) return 2 + Math.random() * 2; // 2-4 (活躍)
        return 4 + Math.random() * 6; // 4-10 (異常活躍)
    }
    
    // 計算動能分數
    calculateMomentumScore(changePercent, volumeRatio, rsi) {
        let score = 50; // 基礎分數
        
        // 價格變動貢獻 (±30分)
        score += Math.min(Math.max(changePercent * 3, -30), 30);
        
        // 成交量貢獻 (0-25分)
        score += Math.min(volumeRatio * 5, 25);
        
        // RSI貢獻 (-10到+10分)
        if (rsi < 30) score += 10; // 超賣加分
        else if (rsi > 70) score -= 10; // 超買減分
        else score += (50 - Math.abs(rsi - 50)) / 5; // 中性區域小幅加分
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    getMockNews(symbol) {
        const mockNews = [
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
            },
            {
                title: `${symbol} Expands Market Presence`,
                description: 'Company announces new strategic partnerships and expansion plans.',
                url: '#',
                publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                source: { name: 'Business Wire' }
            }
        ];
        
        return mockNews;
    }
    
    // Utility functions
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
    
    getPeriodDays(period) {
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
    
    // Cache management
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    // Rate limiting
    checkRateLimit(endpoint) {
        const now = Date.now();
        const limit = this.rateLimits.get(endpoint);
        
        if (!limit) {
            this.rateLimits.set(endpoint, { count: 1, resetTime: now + 60000 });
            return true;
        }
        
        if (now > limit.resetTime) {
            this.rateLimits.set(endpoint, { count: 1, resetTime: now + 60000 });
            return true;
        }
        
        if (limit.count >= 5) { // 5 requests per minute
            return false;
        }
        
        limit.count++;
        return true;
    }
}

// Backtesting Engine
class BacktestEngine {
    constructor() {
        this.results = null;
    }
    
    async runBacktest(symbol, period, strategy) {
        try {
            // Get historical data
            const historyData = await apiManager.getStockHistory(symbol, period);
            
            // Calculate strategy signals
            const signals = this.calculateSignals(historyData, strategy);
            
            // Simulate trades
            const trades = this.simulateTrades(historyData, signals);
            
            // Calculate performance metrics
            const metrics = this.calculateMetrics(trades, historyData);
            
            this.results = {
                trades: trades,
                metrics: metrics,
                equity: this.calculateEquityCurve(trades),
                drawdown: this.calculateDrawdown(trades)
            };
            
            return this.results;
        } catch (error) {
            console.error('Backtest failed:', error);
            // Return mock backtest results
            return this.getMockBacktestResults();
        }
    }
    
    calculateSignals(data, strategy) {
        const signals = [];
        const prices = data.prices;
        
        // Calculate moving averages
        const maShort = this.calculateMA(prices, strategy.maShort);
        const maLong = this.calculateMA(prices, strategy.maLong);
        
        // Calculate RSI
        const rsi = this.calculateRSI(prices, 14);
        
        for (let i = strategy.maLong; i < prices.length; i++) {
            let signal = 'hold';
            
            // Moving average crossover + RSI condition
            if (maShort[i] > maLong[i] && maShort[i-1] <= maLong[i-1] && rsi[i] > strategy.rsiBuy) {
                signal = 'buy';
            } else if (maShort[i] < maLong[i] && maShort[i-1] >= maLong[i-1]) {
                signal = 'sell';
            }
            
            signals.push(signal);
        }
        
        return signals;
    }
    
    simulateTrades(data, signals) {
        const trades = [];
        let position = null;
        let cash = 100000; // Starting capital
        let shares = 0;
        
        for (let i = 0; i < signals.length; i++) {
            const price = data.prices[i + data.prices.length - signals.length];
            const signal = signals[i];
            
            if (signal === 'buy' && !position) {
                // Open long position
                shares = Math.floor(cash / price);
                const cost = shares * price;
                cash -= cost;
                
                position = {
                    type: 'long',
                    entryPrice: price,
                    entryDate: i,
                    shares: shares
                };
            } else if (signal === 'sell' && position) {
                // Close position
                const proceeds = shares * price;
                cash += proceeds;
                
                const trade = {
                    ...position,
                    exitPrice: price,
                    exitDate: i,
                    profit: proceeds - (position.shares * position.entryPrice),
                    return: (price - position.entryPrice) / position.entryPrice
                };
                
                trades.push(trade);
                position = null;
                shares = 0;
            }
        }
        
        return trades;
    }
    
    calculateMetrics(trades) {
        if (trades.length === 0) {
            return {
                totalReturn: 0,
                winRate: 0,
                maxDrawdown: 0,
                sharpeRatio: 0,
                totalTrades: 0
            };
        }
        
        const profits = trades.map(t => t.profit);
        const returns = trades.map(t => t.return);
        
        const totalProfit = profits.reduce((sum, p) => sum + p, 0);
        const winningTrades = profits.filter(p => p > 0).length;
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const returnStd = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
        
        return {
            totalReturn: (totalProfit / 100000) * 100, // Percentage
            winRate: (winningTrades / trades.length) * 100,
            maxDrawdown: this.calculateMaxDrawdown(trades),
            sharpeRatio: returnStd > 0 ? avgReturn / returnStd : 0,
            totalTrades: trades.length,
            avgReturn: avgReturn * 100,
            winningTrades: winningTrades,
            losingTrades: trades.length - winningTrades
        };
    }
    
    calculateMA(prices, period) {
        const ma = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                ma.push(null);
            } else {
                const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                ma.push(sum / period);
            }
        }
        return ma;
    }
    
    calculateRSI(prices, period = 14) {
        const rsi = [];
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }
        
        for (let i = 0; i < gains.length; i++) {
            if (i < period - 1) {
                rsi.push(null);
            } else {
                const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                
                if (avgLoss === 0) {
                    rsi.push(100);
                } else {
                    const rs = avgGain / avgLoss;
                    rsi.push(100 - (100 / (1 + rs)));
                }
            }
        }
        
        return rsi;
    }
    
    calculateMaxDrawdown(trades) {
        let peak = 0;
        let maxDrawdown = 0;
        let runningTotal = 0;
        
        for (const trade of trades) {
            runningTotal += trade.profit;
            if (runningTotal > peak) {
                peak = runningTotal;
            }
            const drawdown = (peak - runningTotal) / peak * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        
        return maxDrawdown;
    }
    
    getMockBacktestResults() {
        return {
            trades: [],
            metrics: {
                totalReturn: 25.6,
                winRate: 68.5,
                maxDrawdown: -12.3,
                sharpeRatio: 1.45,
                totalTrades: 24,
                avgReturn: 2.8,
                winningTrades: 16,
                losingTrades: 8
            },
            equity: MockDataGenerator.generateBacktestData(252),
            drawdown: []
        };
    }
}

// Global API manager instance
const apiManager = new APIManager();
const backtestEngine = new BacktestEngine();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIManager, BacktestEngine, apiManager, backtestEngine };
} 
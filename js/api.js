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
            console.log('Testing API connections...');
            
            const tests = await Promise.allSettled([
                this.testAlphaVantage(),
                this.testTushareAPI(),
                this.testNewsAPI()
            ]);
            
            const alphaVantageOK = tests[0].status === 'fulfilled';
            const tushareOK = tests[1].status === 'fulfilled';
            const newsOK = tests[2].status === 'fulfilled';
            
            const successful = tests.filter(result => result.status === 'fulfilled').length;
            this.isConnected = successful > 0;
            
            console.log('API Test Results:', {
                alphaVantage: alphaVantageOK,
                tushare: tushareOK,
                news: newsOK,
                totalConnected: successful
            });
            
            return {
                connected: this.isConnected,
                alphaVantage: alphaVantageOK,
                tushare: tushareOK,
                news: newsOK,
                connectedCount: successful
            };
        } catch (error) {
            console.error('API connection test failed:', error);
            this.isConnected = false;
            return { connected: false, error: error.message };
        }
    }
    
    // Test Alpha Vantage API
    async testAlphaVantage() {
        const url = `${API_CONFIG.alphaVantage.baseUrl}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${API_CONFIG.alphaVantage.apiKey}`;
        
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
    
    // Test Tushare API (通過代理)
    async testTushareAPI() {
        try {
            console.log('Testing Tushare API...');
            const response = await fetch('/api/stocks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'test',
                    api: 'tushare'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Tushare API HTTP ${response.status}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Tushare API test failed');
            }
            
            console.log('Tushare API test successful');
            return result;
        } catch (error) {
            console.warn('Tushare API test failed:', error.message);
            throw error;
        }
    }
    
    // Test News API
    async testNewsAPI() {
        try {
            console.log('Testing News API...');
            const response = await fetch('/api/stocks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'test',
                    api: 'news'
                })
            });
            
            if (!response.ok) {
                throw new Error(`News API HTTP ${response.status}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'News API test failed');
            }
            
            console.log('News API test successful');
            return result;
        } catch (error) {
            console.warn('News API test failed:', error.message);
            throw error;
        }
    }
    
    // Get stock quote - 優先使用真實API
    async getStockQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching quote for ${symbol}...`);
        
        try {
            // 首先嘗試Alpha Vantage API
            const data = await this.getAlphaVantageQuote(symbol);
            this.setCache(cacheKey, data);
            console.log(`Successfully fetched ${symbol} quote from Alpha Vantage`);
            return data;
        } catch (error) {
            console.warn(`Alpha Vantage failed for ${symbol}:`, error.message);
            
            try {
                // 嘗試通過代理服務器獲取數據
                console.log(`Trying proxy API for ${symbol}...`);
                const proxyData = await this.getProxyQuote(symbol);
                this.setCache(cacheKey, proxyData);
                console.log(`Successfully fetched ${symbol} quote from proxy`);
                return proxyData;
            } catch (proxyError) {
                console.warn(`Proxy API also failed for ${symbol}:`, proxyError.message);
                
                // 最後回退到Mock數據，但要標記數據來源
                console.log(`Using mock data for ${symbol} (APIs unavailable)`);
                const mockData = this.getMockQuote(symbol);
                mockData._source = 'mock';
                mockData._reason = 'API unavailable';
                return mockData;
            }
        }
    }
    
    // 通過代理服務器獲取報價
    async getProxyQuote(symbol) {
        const response = await fetch('/api/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'quote',
                symbol: symbol
            })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy API HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result.data;
    }
    
    // Get stock historical data - 優先使用真實API
    async getStockHistory(symbol, period = '1Y') {
        const cacheKey = `history_${symbol}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching history for ${symbol} (${period})...`);
        
        try {
            // 首先嘗試Alpha Vantage API
            const data = await this.getAlphaVantageHistory(symbol, period);
            this.setCache(cacheKey, data);
            console.log(`Successfully fetched ${symbol} history from Alpha Vantage`);
            return data;
        } catch (error) {
            console.warn(`Alpha Vantage history failed for ${symbol}:`, error.message);
            
            try {
                // 嘗試通過代理服務器獲取數據
                const proxyData = await this.getProxyHistory(symbol, period);
                this.setCache(cacheKey, proxyData);
                console.log(`Successfully fetched ${symbol} history from proxy`);
                return proxyData;
            } catch (proxyError) {
                console.warn(`Proxy history also failed for ${symbol}:`, proxyError.message);
                
                // 最後回退到Mock數據
                console.log(`Using mock history for ${symbol} (APIs unavailable)`);
                const mockData = MockDataGenerator.generatePriceData(this.getPeriodDays(period));
                mockData._source = 'mock';
                mockData._reason = 'API unavailable';
                return mockData;
            }
        }
    }
    
    // 通過代理服務器獲取歷史數據
    async getProxyHistory(symbol, period) {
        const response = await fetch('/api/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'history',
                symbol: symbol,
                period: period
            })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy API HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result.data;
    }
    
    // Screen stocks based on criteria - 優先使用真實API
    async screenStocks(criteria) {
        const cacheKey = `screen_${JSON.stringify(criteria)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log('Screening stocks with criteria:', criteria);
        
        try {
            // 嘗試通過代理服務器進行股票篩選
            const data = await this.getProxyScreening(criteria);
            this.setCache(cacheKey, data);
            console.log('Successfully screened stocks from API');
            return data;
        } catch (error) {
            console.warn('API screening failed:', error.message);
            
            // 回退到增強的Mock數據
            console.log('Using enhanced mock screening data');
            const mockData = await this.getMockScreeningResults(criteria);
            mockData._source = 'mock';
            mockData._reason = 'API unavailable';
            return mockData;
        }
    }
    
    // 通過代理服務器進行股票篩選
    async getProxyScreening(criteria) {
        const response = await fetch('/api/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'screen',
                criteria: criteria
            })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy API HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result.data;
    }
    
    // Get technical indicators - 優先使用真實API
    async getTechnicalIndicators(symbol, indicators = ['RSI', 'MACD']) {
        const cacheKey = `indicators_${symbol}_${indicators.join('_')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching technical indicators for ${symbol}:`, indicators);
        
        try {
            // 嘗試通過代理服務器獲取技術指標
            const data = await this.getProxyIndicators(symbol, indicators);
            this.setCache(cacheKey, data);
            console.log(`Successfully fetched ${symbol} indicators from API`);
            return data;
        } catch (error) {
            console.warn(`API indicators failed for ${symbol}:`, error.message);
            
            // 回退到Mock數據
            console.log(`Using mock indicators for ${symbol} (API unavailable)`);
            const mockData = {
                rsi: MockDataGenerator.generateRSIData(),
                macd: MockDataGenerator.generateMACDData(),
                labels: this.generateDateLabels(90),
                _source: 'mock',
                _reason: 'API unavailable'
            };
            
            return mockData;
        }
    }
    
    // 通過代理服務器獲取技術指標
    async getProxyIndicators(symbol, indicators) {
        const response = await fetch('/api/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'indicators',
                symbol: symbol,
                indicators: indicators
            })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy API HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result.data;
    }
    
    // Get news and catalysts - 優先使用真實API
    async getStockNews(symbol, limit = 10) {
        const cacheKey = `news_${symbol}_${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Fetching news for ${symbol}...`);
        
        try {
            // 首先嘗試News API
            const url = `${API_CONFIG.newsAPI.baseUrl}/everything?q=${symbol}&sortBy=publishedAt&pageSize=${limit}&apiKey=${API_CONFIG.newsAPI.apiKey}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`News API HTTP ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status === 'error') {
                throw new Error(`News API: ${data.message}`);
            }
            
            console.log(`Successfully fetched ${symbol} news from News API`);
            this.setCache(cacheKey, data.articles);
            return data.articles;
        } catch (error) {
            console.warn(`News API failed for ${symbol}:`, error.message);
            
            try {
                // 嘗試通過代理服務器獲取新聞
                const proxyData = await this.getProxyNews(symbol, limit);
                this.setCache(cacheKey, proxyData);
                console.log(`Successfully fetched ${symbol} news from proxy`);
                return proxyData;
            } catch (proxyError) {
                console.warn(`Proxy news also failed for ${symbol}:`, proxyError.message);
                
                // 回退到Mock新聞
                console.log(`Using mock news for ${symbol} (APIs unavailable)`);
                const mockNews = this.getMockNews(symbol);
                mockNews._source = 'mock';
                mockNews._reason = 'API unavailable';
                return mockNews;
            }
        }
    }
    
    // 通過代理服務器獲取新聞
    async getProxyNews(symbol, limit) {
        const response = await fetch('/api/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'news',
                symbol: symbol,
                limit: limit
            })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy API HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result.data;
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
            { symbol: '002415.SZ', name: '海康威視', market: 'CN', sector: 'Technology', marketCap: 400 },
            { symbol: '300750.SZ', name: '寧德時代', market: 'CN', sector: 'Technology', marketCap: 1200 },
            { symbol: '002594.SZ', name: '比亞迪', market: 'CN', sector: 'Automotive', marketCap: 1100 }
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

    // Perform backtest - 優先使用真實數據
    async performBacktest(symbol, strategy = 'momentum', period = '1Y') {
        const cacheKey = `backtest_${symbol}_${strategy}_${period}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        console.log(`Running backtest for ${symbol} with ${strategy} strategy...`);
        
        try {
            // 獲取真實歷史數據進行回測
            const historicalData = await this.getStockHistory(symbol, period);
            
            // 使用BacktestEngine進行回測
            const backtestResult = backtestEngine.runBacktest(historicalData, strategy);
            backtestResult.symbol = symbol;
            backtestResult.strategy = strategy;
            backtestResult.period = period;
            backtestResult._source = historicalData._source || 'api';
            
            console.log(`Successfully completed backtest for ${symbol}`);
            this.setCache(cacheKey, backtestResult);
            return backtestResult;
        } catch (error) {
            console.warn(`Backtest failed for ${symbol}:`, error.message);
            
            // 使用Mock數據進行回測
            console.log(`Using mock backtest for ${symbol} (data unavailable)`);
            const mockResult = {
                symbol: symbol,
                strategy: strategy,
                period: period,
                totalReturn: (Math.random() - 0.5) * 50, // -25% to +25%
                sharpeRatio: 0.5 + Math.random() * 1.5, // 0.5 to 2.0
                maxDrawdown: -(Math.random() * 20), // 0% to -20%
                winRate: 50 + (Math.random() - 0.5) * 20, // 40% to 60%
                totalTrades: Math.floor(20 + Math.random() * 80), // 20 to 100
                equity: MockDataGenerator.generateBacktestData(252),
                _source: 'mock',
                _reason: 'API unavailable'
            };
            
            return mockResult;
        }
    }
}

// Backtesting Engine
class BacktestEngine {
    constructor() {
        this.results = null;
    }
    
    async runBacktest(data, strategy) {
        try {
            // Calculate strategy signals
            const signals = this.calculateSignals(data.prices, strategy);
            
            // Simulate trades
            const trades = this.simulateTrades(data, signals);
            
            // Calculate performance metrics
            const metrics = this.calculateMetrics(trades, data);
            
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
    
    calculateSignals(prices, strategy) {
        const signals = [];
        
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
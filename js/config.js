// API Configuration
const API_CONFIG = {
    // 股票數據API
    tushare: {
        token: 'e9827dca7dae7177259fcbbbc618a9689a482887a3daddd0bbcc5c32',
        baseUrl: 'https://api.tushare.pro'
    },
    alphaVantage: {
        apiKey: 'LAHWHIN15OAVH7I3',
        baseUrl: 'https://www.alphavantage.co/query'
    },
    // 新聞API
    newsAPI: {
        apiKey: 'bdcc5675-0e2b-4413-88be-4b9d16e25528',
        baseUrl: 'https://newsapi.org/v2'
    },
    // 雅虎財經
    yahooFinance: {
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart'
    }
};

// Application Settings
const APP_CONFIG = {
    defaultLanguage: 'zh-TW',
    supportedLanguages: ['zh-TW', 'en', 'zh-CN'],
    charts: {
        theme: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            backgroundColor: '#ffffff',
            gridColor: '#f0f0f0',
            textColor: '#333333'
        },
        defaultHeight: 400,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad'
        }
    },
    screening: {
        maxResults: 50,
        defaultCriteria: {
            priceChange: 10,
            volumeRatio: 1.5,
            rsiRange: '50-70',
            timePeriod: '1M',
            minMarketCap: 100
        }
    },
    backtest: {
        defaultPeriod: '1Y',
        maxPeriod: '5Y',
        defaultStrategy: {
            maShort: 50,
            maLong: 200,
            rsiBuy: 50,
            rsiSell: 70
        }
    }
};

// Market Configuration
const MARKET_CONFIG = {
    us: {
        name: 'US Stock Market',
        suffix: '',
        currency: 'USD',
        timezone: 'America/New_York',
        tradingHours: {
            open: '09:30',
            close: '16:00'
        },
        holidays: [] // 可以添加美股假日
    },
    hk: {
        name: 'Hong Kong Stock Market',
        suffix: '.HK',
        currency: 'HKD',
        timezone: 'Asia/Hong_Kong',
        tradingHours: {
            open: '09:30',
            close: '16:00'
        },
        holidays: []
    },
    cn: {
        name: 'China A-Share Market',
        suffix: '.SZ',
        altSuffix: '.SS',
        currency: 'CNY',
        timezone: 'Asia/Shanghai',
        tradingHours: {
            open: '09:30',
            close: '15:00'
        },
        holidays: []
    }
};

// Technical Indicators Configuration
const INDICATOR_CONFIG = {
    rsi: {
        period: 14,
        overbought: 70,
        oversold: 30
    },
    macd: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
    },
    bollingerBands: {
        period: 20,
        stdDev: 2
    },
    movingAverage: {
        short: 50,
        long: 200
    }
};

// Error Messages
const ERROR_MESSAGES = {
    'zh-TW': {
        apiError: 'API連接失敗，請檢查網絡連接',
        invalidSymbol: '無效的股票代碼',
        noData: '沒有找到相關數據',
        rateLimitExceeded: 'API請求頻率超限，請稍後再試',
        networkError: '網絡連接錯誤',
        serverError: '服務器錯誤，請稍後再試'
    },
    'en': {
        apiError: 'API connection failed, please check network connection',
        invalidSymbol: 'Invalid stock symbol',
        noData: 'No data found',
        rateLimitExceeded: 'API rate limited exceeded, please try again later',
        networkError: 'Network connection error',
        serverError: 'Server error, please try again later'
    },
    'zh-CN': {
        apiError: 'API连接失败，请检查网络连接',
        invalidSymbol: '无效的股票代码', 
        noData: '没有找到相关数据',
        rateLimitExceeded: 'API请求频率超限，请稍后再试',
        networkError: '网络连接错误',
        serverError: '服务器错误，请稍后再试'
    }
};

// Export configuration (for module systems, if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        APP_CONFIG,
        MARKET_CONFIG,
        INDICATOR_CONFIG,
        ERROR_MESSAGES
    };
} 
// Language Translations
const translations = {
    'zh-TW': {
        // Page Title and Header
        'page-title': '動能交易策略系統',
        'logo': '動能交易策略系統',
        'api-status-connected': 'API 已連接',
        'api-status-disconnected': 'API 未連接',
        
        // Navigation
        'nav-screening': '股票篩選',
        'nav-analysis': '技術分析',
        'nav-backtest': '歷史回測',
        'nav-trading': '交易決策',
        
        // Screening Section
        'screening-title': '股票篩選系統',
        'screening-desc': '選擇市場並設定篩選條件，系統將基於動能交易策略為您篩選潛力股票',
        'market-selection-title': '市場選擇',
        'market-all': '全部市場',
        'market-us': '美國股市',
        'market-hk': '香港股市',
        'market-cn': '中國A股',
        'technical-criteria-title': '技術指標條件',
        'price-change-label': '價格變動 (%)',
        'volume-ratio-label': '成交量倍數',
        'rsi-range-label': 'RSI 範圍',
        'timeframe-title': '時間範圍',
        'time-period-label': '分析期間',
        'min-market-cap-label': '最小市值 (億)',
        'start-screening-btn': '開始篩選',
        'loading-text': '正在篩選股票，請稍候...',
        'results-title': '篩選結果',
        
        // Table Headers
        'th-symbol': '股票代碼',
        'th-name': '公司名稱',
        'th-market': '市場',
        'th-price': '股價',
        'th-change': '變動%',
        'th-volume': '成交量比',
        'th-rsi': 'RSI',
        'th-score': '評分',
        'th-action': '操作',
        
        // Analysis Section
        'analysis-title': '深度技術分析',
        'analysis-desc': '選擇股票進行深度技術分析，包含價格圖表、技術指標和催化劑分析',
        'stock-selection-title': '選擇分析股票',
        'analysis-symbol-label': '股票代碼',
        'analyze-btn': '開始分析',
        'analysis-loading-text': '正在分析股票數據，請稍候...',
        'price-chart-title': '價格走勢圖',
        'volume-chart-title': '成交量圖',
        'indicators-chart-title': '技術指標',
        'catalyst-title': '催化劑分析',
        
        // Backtest Section
        'backtest-title': '歷史回測系統',
        'backtest-desc': '基於歷史數據驗證動能交易策略的有效性',
        'backtest-params-title': '回測參數',
        'backtest-symbol-label': '股票代碼',
        'backtest-period-label': '回測期間',
        'strategy-params-title': '策略參數',
        'ma-short-label': '短期均線',
        'ma-long-label': '長期均線',
        'rsi-buy-label': 'RSI買入閾值',
        'run-backtest-btn': '運行回測',
        'backtest-loading-text': '正在運行回測，請稍候...',
        'backtest-performance-title': '策略表現',
        'performance-metrics-title': '績效指標',
        
        // Trading Section
        'trading-title': '交易決策系統',
        'trading-desc': '基於分析結果制定具體的交易計劃',
        'selected-stocks-title': '已選股票',
        'generate-plan-btn': '生成交易計劃',
        'risk-analysis-title': '風險分析',
        'trading-plan-title': '交易計劃',
        'th-trading-symbol': '股票',
        'th-entry-price': '入場價',
        'th-target-price': '目標價',
        'th-stop-loss': '停損價',
        'th-position-size': '倉位大小',
        'th-risk-reward': '風險回報比',
        
        // Select Options
        'rsi-range-strong': '50-70 (強勢)',
        'rsi-range-neutral': '30-50 (中性)',
        'rsi-range-all': '全部範圍',
        'period-1m': '近1個月',
        'period-3m': '近3個月',
        'period-6m': '近6個月',
        'period-1y': '近1年',
        'period-2y': '2年',
        'period-3y': '3年',
        'period-5y': '5年',
        
        // Actions
        'select-stock': '選擇',
        'remove-stock': '移除',
        'export-results': '匯出結果',
        'reset-filters': '重置篩選',
        
        // Messages
        'no-stocks-selected': '尚未選擇任何股票',
        'stock-added': '股票已添加到選股清單',
        'stock-removed': '股票已從選股清單移除',
        'screening-completed': '股票篩選完成',
        'analysis-completed': '技術分析完成',
        'backtest-completed': '歷史回測完成',
        'trading-plan-generated': '交易計劃已生成',
        'enter-stock-symbol': '請輸入股票代碼',
        'invalid-stock-symbol': '無效的股票代碼格式'
    },
    
    'en': {
        // Page Title and Header
        'page-title': 'Momentum Trading System',
        'logo': 'Momentum Trading System',
        'api-status-connected': 'API Connected',
        'api-status-disconnected': 'API Disconnected',
        
        // Navigation
        'nav-screening': 'Stock Screening',
        'nav-analysis': 'Technical Analysis',
        'nav-backtest': 'Historical Backtest',
        'nav-trading': 'Trading Decisions',
        
        // Screening Section
        'screening-title': 'Stock Screening System',
        'screening-desc': 'Select markets and set screening criteria, the system will filter potential stocks based on momentum trading strategy',
        'market-selection-title': 'Market Selection',
        'market-all': 'All Markets',
        'market-us': 'US Stock Market',
        'market-hk': 'Hong Kong Stock Market',
        'market-cn': 'China A-Shares',
        'technical-criteria-title': 'Technical Criteria',
        'price-change-label': 'Price Change (%)',
        'volume-ratio-label': 'Volume Ratio',
        'rsi-range-label': 'RSI Range',
        'timeframe-title': 'Time Frame',
        'time-period-label': 'Analysis Period',
        'min-market-cap-label': 'Min Market Cap (100M)',
        'start-screening-btn': 'Start Screening',
        'loading-text': 'Screening stocks, please wait...',
        'results-title': 'Screening Results',
        
        // Table Headers
        'th-symbol': 'Symbol',
        'th-name': 'Company Name',
        'th-market': 'Market',
        'th-price': 'Price',
        'th-change': 'Change%',
        'th-volume': 'Volume Ratio',
        'th-rsi': 'RSI',
        'th-score': 'Score',
        'th-action': 'Action',
        
        // Analysis Section
        'analysis-title': 'In-depth Technical Analysis',
        'analysis-desc': 'Select stocks for in-depth technical analysis, including price charts, technical indicators and catalyst analysis',
        'stock-selection-title': 'Select Stock for Analysis',
        'analysis-symbol-label': 'Stock Symbol',
        'analyze-btn': 'Start Analysis',
        'analysis-loading-text': 'Analyzing stock data, please wait...',
        'price-chart-title': 'Price Chart',
        'volume-chart-title': 'Volume Chart',
        'indicators-chart-title': 'Technical Indicators',
        'catalyst-title': 'Catalyst Analysis',
        
        // Backtest Section
        'backtest-title': 'Historical Backtest System',
        'backtest-desc': 'Validate the effectiveness of momentum trading strategy based on historical data',
        'backtest-params-title': 'Backtest Parameters',
        'backtest-symbol-label': 'Stock Symbol',
        'backtest-period-label': 'Backtest Period',
        'strategy-params-title': 'Strategy Parameters',
        'ma-short-label': 'Short MA',
        'ma-long-label': 'Long MA',
        'rsi-buy-label': 'RSI Buy Threshold',
        'run-backtest-btn': 'Run Backtest',
        'backtest-loading-text': 'Running backtest, please wait...',
        'backtest-performance-title': 'Strategy Performance',
        'performance-metrics-title': 'Performance Metrics',
        
        // Trading Section
        'trading-title': 'Trading Decision System',
        'trading-desc': 'Formulate specific trading plans based on analysis results',
        'selected-stocks-title': 'Selected Stocks',
        'generate-plan-btn': 'Generate Trading Plan',
        'risk-analysis-title': 'Risk Analysis',
        'trading-plan-title': 'Trading Plan',
        'th-trading-symbol': 'Stock',
        'th-entry-price': 'Entry Price',
        'th-target-price': 'Target Price',
        'th-stop-loss': 'Stop Loss',
        'th-position-size': 'Position Size',
        'th-risk-reward': 'Risk/Reward',
        
        // Select Options
        'rsi-range-strong': '50-70 (Strong)',
        'rsi-range-neutral': '30-50 (Neutral)',
        'rsi-range-all': 'All Range',
        'period-1m': 'Last 1 Month',
        'period-3m': 'Last 3 Months',
        'period-6m': 'Last 6 Months',
        'period-1y': 'Last 1 Year',
        'period-2y': '2 Years',
        'period-3y': '3 Years',
        'period-5y': '5 Years',
        
        // Actions
        'select-stock': 'Select',
        'remove-stock': 'Remove',
        'export-results': 'Export Results',
        'reset-filters': 'Reset Filters',
        
        // Messages
        'no-stocks-selected': 'No stocks selected yet',
        'stock-added': 'Stock added to watchlist',
        'stock-removed': 'Stock removed from watchlist',
        'screening-completed': 'Stock screening completed',
        'analysis-completed': 'Technical analysis completed',
        'backtest-completed': 'Historical backtest completed',
        'trading-plan-generated': 'Trading plan generated',
        'enter-stock-symbol': 'Please enter stock symbol',
        'invalid-stock-symbol': 'Invalid stock symbol format'
    },
    
    'zh-CN': {
        // Page Title and Header
        'page-title': '动能交易策略系统',
        'logo': '动能交易策略系统',
        'api-status-connected': 'API 已连接',
        'api-status-disconnected': 'API 未连接',
        
        // Navigation
        'nav-screening': '股票筛选',
        'nav-analysis': '技术分析',
        'nav-backtest': '历史回测',
        'nav-trading': '交易决策',
        
        // Screening Section
        'screening-title': '股票筛选系统',
        'screening-desc': '选择市场并设定筛选条件，系统将基于动能交易策略为您筛选潜力股票',
        'market-selection-title': '市场选择',
        'market-all': '全部市场',
        'market-us': '美国股市',
        'market-hk': '香港股市',
        'market-cn': '中国A股',
        'technical-criteria-title': '技术指标条件',
        'price-change-label': '价格变动 (%)',
        'volume-ratio-label': '成交量倍数',
        'rsi-range-label': 'RSI 范围',
        'timeframe-title': '时间范围',
        'time-period-label': '分析期间',
        'min-market-cap-label': '最小市值 (亿)',
        'start-screening-btn': '开始筛选',
        'loading-text': '正在筛选股票，请稍候...',
        'results-title': '筛选结果',
        
        // Table Headers
        'th-symbol': '股票代码',
        'th-name': '公司名称',
        'th-market': '市场',
        'th-price': '股价',
        'th-change': '变动%',
        'th-volume': '成交量比',
        'th-rsi': 'RSI',
        'th-score': '评分',
        'th-action': '操作',
        
        // Analysis Section
        'analysis-title': '深度技术分析',
        'analysis-desc': '选择股票进行深度技术分析，包含价格图表、技术指标和催化剂分析',
        'stock-selection-title': '选择分析股票',
        'analysis-symbol-label': '股票代码',
        'analyze-btn': '开始分析',
        'analysis-loading-text': '正在分析股票数据，请稍候...',
        'price-chart-title': '价格走势图',
        'volume-chart-title': '成交量图',
        'indicators-chart-title': '技术指标',
        'catalyst-title': '催化剂分析',
        
        // Backtest Section
        'backtest-title': '历史回测系统',
        'backtest-desc': '基于历史数据验证动能交易策略的有效性',
        'backtest-params-title': '回测参数',
        'backtest-symbol-label': '股票代码',
        'backtest-period-label': '回测期间',
        'strategy-params-title': '策略参数',
        'ma-short-label': '短期均线',
        'ma-long-label': '长期均线',
        'rsi-buy-label': 'RSI买入阈值',
        'run-backtest-btn': '运行回测',
        'backtest-loading-text': '正在运行回测，请稍候...',
        'backtest-performance-title': '策略表现',
        'performance-metrics-title': '绩效指标',
        
        // Trading Section
        'trading-title': '交易决策系统',
        'trading-desc': '基于分析结果制定具体的交易计划',
        'selected-stocks-title': '已选股票',
        'generate-plan-btn': '生成交易计划',
        'risk-analysis-title': '风险分析',
        'trading-plan-title': '交易计划',
        'th-trading-symbol': '股票',
        'th-entry-price': '入场价',
        'th-target-price': '目标价',
        'th-stop-loss': '停损价',
        'th-position-size': '仓位大小',
        'th-risk-reward': '风险回报比',
        
        // Select Options
        'rsi-range-strong': '50-70 (强势)',
        'rsi-range-neutral': '30-50 (中性)',
        'rsi-range-all': '全部范围',
        'period-1m': '近1个月',
        'period-3m': '近3个月',
        'period-6m': '近6个月',
        'period-1y': '近1年',
        'period-2y': '2年',
        'period-3y': '3年',
        'period-5y': '5年',
        
        // Actions
        'select-stock': '选择',
        'remove-stock': '移除',
        'export-results': '导出结果',
        'reset-filters': '重置筛选',
        
        // Messages
        'no-stocks-selected': '尚未选择任何股票',
        'stock-added': '股票已添加到选股清单',
        'stock-removed': '股票已从选股清单移除',
        'screening-completed': '股票筛选完成',
        'analysis-completed': '技术分析完成',
        'backtest-completed': '历史回测完成',
        'trading-plan-generated': '交易计划已生成',
        'enter-stock-symbol': '请输入股票代码',
        'invalid-stock-symbol': '无效的股票代码格式'
    }
};

// Translation utility functions
const i18n = {
    currentLanguage: 'zh-TW',
    
    // Set current language
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            return true;
        }
        return false;
    },
    
    // Get translation for a key
    t(key, fallback = key) {
        const langData = translations[this.currentLanguage];
        return langData && langData[key] ? langData[key] : fallback;
    },
    
    // Apply translations to DOM elements
    applyTranslations() {
        const langData = translations[this.currentLanguage];
        if (!langData) return;
        
        Object.keys(langData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                // Handle different element types
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = langData[key];
                } else if (element.tagName === 'TITLE') {
                    element.textContent = langData[key];
                    document.title = langData[key];
                } else {
                    element.textContent = langData[key];
                }
            }
        });
        
        // Update select options
        this.updateSelectOptions();
    },
    
    // Update select option texts
    updateSelectOptions() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                let translationKey = '';
                
                // Map option values to translation keys
                switch(value) {
                    case '50-70':
                        translationKey = 'rsi-range-strong';
                        break;
                    case '30-50':
                        translationKey = 'rsi-range-neutral';
                        break;
                    case 'all':
                        translationKey = 'rsi-range-all';
                        break;
                    case '1M':
                        translationKey = 'period-1m';
                        break;
                    case '3M':
                        translationKey = 'period-3m';
                        break;
                    case '6M':
                        translationKey = 'period-6m';
                        break;
                    case '1Y':
                        translationKey = 'period-1y';
                        break;
                    case '2Y':
                        translationKey = 'period-2y';
                        break;
                    case '3Y':
                        translationKey = 'period-3y';
                        break;
                    case '5Y':
                        translationKey = 'period-5y';
                        break;
                }
                
                if (translationKey) {
                    const translation = this.t(translationKey);
                    if (translation !== translationKey) {
                        option.textContent = translation;
                    }
                }
            });
        });
    },
    
    // Format number based on language
    formatNumber(number, options = {}) {
        const locale = this.getLocale();
        return new Intl.NumberFormat(locale, options).format(number);
    },
    
    // Format currency based on language and market
    formatCurrency(amount, currency = 'USD') {
        const locale = this.getLocale();
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },
    
    // Get browser locale for current language
    getLocale() {
        const localeMap = {
            'zh-TW': 'zh-TW',
            'zh-CN': 'zh-CN',
            'en': 'en-US'
        };
        return localeMap[this.currentLanguage] || 'en-US';
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, i18n };
} 
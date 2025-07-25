// Main Application Logic
class MomentumTradingApp {
    constructor() {
        this.currentLanguage = APP_CONFIG.defaultLanguage;
        this.selectedMarkets = ['all'];
        this.selectedStocks = [];
        this.chartManager = new ChartManager();
        this.isInitialized = false;
    }
    
    // Initialize the application
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize language system
            i18n.setLanguage(this.currentLanguage);
            i18n.applyTranslations();
            
            // Test API connections
            this.showLoading('Initializing APIs...');
            const apiStatus = await apiManager.testConnections();
            this.updateAPIStatus(apiStatus.connected, apiStatus);
            
            // Initialize UI
            this.initializeUI();
            
            this.hideLoading();
            this.isInitialized = true;
            
            console.log('Momentum Trading App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError(i18n.t('initialization-failed', 'Application initialization failed'));
            this.hideLoading();
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Market selection buttons
        document.querySelectorAll('.market-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleMarketSelection(e.target));
        });
        
        // Form submissions
        const screeningForm = document.getElementById('screening-section');
        if (screeningForm) {
            screeningForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startScreening();
            });
        }
        
        // Window resize handler for charts
        window.addEventListener('resize', () => {
            this.chartManager.destroyAllCharts();
            // Charts will be recreated when sections are shown
        });
        
        // Before unload handler
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    // Initialize UI components
    initializeUI() {
        // Set up default values
        this.resetFilters();
        
        // Initialize tooltips if available
        this.initializeTooltips();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    // Language switching
    switchLanguage(lang) {
        if (!APP_CONFIG.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return false;
        }
        
        this.currentLanguage = lang;
        document.documentElement.lang = lang;
        
        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Apply translations
        i18n.setLanguage(lang);
        i18n.applyTranslations();
        
        // Update charts if any are displayed
        this.updateChartsLanguage();
        
        return true;
    }
    
    // Section navigation
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        // Section-specific initialization
        this.initializeSection(sectionName);
    }
    
    // Initialize specific sections
    initializeSection(sectionName) {
        switch (sectionName) {
            case 'screening':
                this.initializeScreeningSection();
                break;
            case 'analysis':
                this.initializeAnalysisSection();
                break;
            case 'backtest':
                this.initializeBacktestSection();
                break;
            case 'trading':
                this.initializeTradingSection();
                break;
        }
    }
    
    // Market selection handling
    handleMarketSelection(button) {
        const market = button.dataset.market;
        
        if (market === 'all') {
            // Select all markets
            document.querySelectorAll('.market-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
            this.selectedMarkets = ['all'];
        } else {
            // Toggle individual market
            const allBtn = document.querySelector('[data-market="all"]');
            if (allBtn) allBtn.classList.remove('selected');
            
            button.classList.toggle('selected');
            
            // Update selected markets array
            this.selectedMarkets = Array.from(document.querySelectorAll('.market-btn.selected'))
                .map(btn => btn.dataset.market)
                .filter(m => m !== 'all');
            
            if (this.selectedMarkets.length === 0) {
                if (allBtn) allBtn.classList.add('selected');
                this.selectedMarkets = ['all'];
            }
        }
    }
    
    // Stock screening functionality
    async startScreening() {
        try {
            this.showLoading('screening-loading');
            this.hideError();
            
            const criteria = this.getScreeningCriteria();
            console.log('Screening with criteria:', criteria);
            
            const results = await apiManager.screenStocks(criteria);
            this.displayScreeningResults(results);
            
            this.showSuccess(i18n.t('screening-completed', 'Stock screening completed'));
            
        } catch (error) {
            console.error('Screening failed:', error);
            this.showError(i18n.t('screening-failed', 'Stock screening failed: ') + error.message);
        } finally {
            this.hideLoading('screening-loading');
        }
    }
    
    getScreeningCriteria() {
        return {
            markets: this.selectedMarkets,
            priceChange: parseFloat(document.getElementById('price-change')?.value || 10),
            volumeRatio: parseFloat(document.getElementById('volume-ratio')?.value || 1.5),
            rsiRange: document.getElementById('rsi-range')?.value || '50-70',
            timePeriod: document.getElementById('time-period')?.value || '1M',
            minMarketCap: parseFloat(document.getElementById('min-market-cap')?.value || 100)
        };
    }
    
    displayScreeningResults(results) {
        const tbody = document.getElementById('results-tbody');
        const resultsContainer = document.getElementById('screening-results');
        
        if (!tbody || !resultsContainer) return;
        
        tbody.innerHTML = '';
        
        // Add data source warning if using mock data
        this.showDataSourceWarning(results);
        
        results.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${stock.symbol}
                    ${this.getDataSourceBadge(stock)}
                </td>
                <td>${stock.name}</td>
                <td>${this.getMarketName(stock.market)}</td>
                <td>${this.formatCurrency(stock.price, this.getMarketCurrency(stock.market))}</td>
                <td class="${stock.change >= 0 ? 'status-positive' : 'status-negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(1)}%
                </td>
                <td>${stock.volumeRatio.toFixed(1)}x</td>
                <td class="${this.getRSIClass(stock.rsi)}">${stock.rsi.toFixed(0)}</td>
                <td><strong>${stock.score}</strong></td>
                <td>
                    <button class="btn-secondary" onclick="app.selectStock('${stock.symbol}')" style="padding: 5px 10px; font-size: 12px;">
                        <i class="fas fa-plus"></i> ${i18n.t('select-stock', '選擇')}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        resultsContainer.style.display = 'block';
        
        // Update results count
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) {
            resultsTitle.textContent = `${i18n.t('results-title', '篩選結果')} (${results.length})`;
        }
    }
    
    // Stock analysis functionality
    async analyzeStock() {
        const symbol = document.getElementById('analysis-symbol')?.value?.trim();
        if (!symbol) {
            this.showError(i18n.t('enter-stock-symbol', 'Please enter stock symbol'));
            return;
        }
        
        try {
            this.showLoading('analysis-loading');
            this.hideError();
            
            console.log('Analyzing stock:', symbol);
            
            // Get stock data
            const [quote, history, indicators, news] = await Promise.all([
                apiManager.getStockQuote(symbol),
                apiManager.getStockHistory(symbol, '6M'),
                apiManager.getTechnicalIndicators(symbol, ['RSI', 'MACD']),
                apiManager.getStockNews(symbol, 5)
            ]);
            
            // Display analysis results
            this.displayAnalysisResults({
                quote,
                history,
                indicators,
                news
            });
            
            this.showSuccess(i18n.t('analysis-completed', 'Technical analysis completed'));
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError(i18n.t('analysis-failed', 'Analysis failed: ') + error.message);
        } finally {
            this.hideLoading('analysis-loading');
        }
    }
    
    displayAnalysisResults(data) {
        // Create charts
        this.chartManager.createPriceChart('price-chart', data.history);
        this.chartManager.createVolumeChart('volume-chart', {
            labels: data.history.labels,
            volumes: data.history.volumes
        });
        this.chartManager.createIndicatorsChart('indicators-chart', {
            labels: data.history.labels,
            rsi: data.indicators.rsi,
            macd: data.indicators.macd
        });
        
        // Display catalysts/news
        this.displayCatalysts(data.news);
        
        // Show results container
        const resultsContainer = document.getElementById('analysis-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
    }
    
    // Backtest functionality
    async runBacktest() {
        const symbol = document.getElementById('backtest-symbol')?.value?.trim();
        if (!symbol) {
            this.showError(i18n.t('enter-stock-symbol', 'Please enter stock symbol'));
            return;
        }
        
        try {
            this.showLoading('backtest-loading');
            this.hideError();
            
            const strategy = this.getBacktestStrategy(); 
            const period = document.getElementById('backtest-period')?.value || '1Y';
            
            console.log('Running backtest for:', symbol, strategy, period);
            
            const results = await backtestEngine.runBacktest(symbol, period, strategy);
            this.displayBacktestResults(results);
            
            this.showSuccess(i18n.t('backtest-completed', 'Historical backtest completed'));
            
        } catch (error) {
            console.error('Backtest failed:', error);
            this.showError(i18n.t('backtest-failed', 'Backtest failed: ') + error.message);
        } finally {
            this.hideLoading('backtest-loading');
        }
    }
    
    getBacktestStrategy() {
        return {
            maShort: parseInt(document.getElementById('ma-short')?.value || 50),
            maLong: parseInt(document.getElementById('ma-long')?.value || 200), 
            rsiBuy: parseInt(document.getElementById('rsi-buy')?.value || 50),
            rsiSell: 70 // Fixed for now
        };
    }
    
    displayBacktestResults(results) {
        // Create performance chart
        this.chartManager.createBacktestChart('backtest-chart', results.equity);
        
        // Display performance metrics
        this.displayPerformanceMetrics(results.metrics);
        
        // Show results container
        const resultsContainer = document.getElementById('backtest-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
    }
    
    // Trading plan functionality
    async generateTradingPlan() {
        if (this.selectedStocks.length === 0) {
            this.showError(i18n.t('no-stocks-selected', 'Please select stocks first'));
            return;
        }
        
        try {
            console.log('Generating trading plan for:', this.selectedStocks);
            
            const tradingPlan = await this.createTradingPlan(this.selectedStocks);
            this.displayTradingPlan(tradingPlan);
            
            this.showSuccess(i18n.t('trading-plan-generated', 'Trading plan generated'));
            
        } catch (error) {
            console.error('Trading plan generation failed:', error);
            this.showError(i18n.t('trading-plan-failed', 'Trading plan generation failed: ') + error.message);
        }
    }
    
    async createTradingPlan(symbols) {
        // Simulate trading plan generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const plans = [];
        for (const symbol of symbols) {
            const quote = await apiManager.getStockQuote(symbol);
            const plan = {
                symbol: symbol,
                entryPrice: quote.price,
                targetPrice: quote.price * (1.15 + Math.random() * 0.1), // 15-25% upside
                stopLoss: quote.price * (0.90 - Math.random() * 0.05), // 5-10% downside
                positionSize: (5 + Math.random() * 10).toFixed(1), // 5-15% position
                riskReward: ((quote.price * 1.2 - quote.price) / (quote.price - quote.price * 0.9)).toFixed(1)
            };
            plans.push(plan);
        }
        
        return plans;
    }
    
    displayTradingPlan(plans) {
        const tbody = document.getElementById('trading-plan-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.symbol}</td>
                <td>${this.formatCurrency(plan.entryPrice)}</td>
                <td class="status-positive">${this.formatCurrency(plan.targetPrice)}</td>
                <td class="status-negative">${this.formatCurrency(plan.stopLoss)}</td>
                <td>${plan.positionSize}%</td>
                <td>${plan.riskReward}:1</td>
            `;
            tbody.appendChild(row);
        });
        
        // Create risk analysis chart
        const riskData = {
            labels: plans.map(p => p.symbol),
            values: plans.map(p => parseFloat(p.positionSize))
        };
        this.chartManager.createRiskChart('risk-chart', riskData);
        
        // Show results container
        const resultsContainer = document.getElementById('trading-plan-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
    }
    
    // Stock selection management
    selectStock(symbol) {
        if (!this.selectedStocks.includes(symbol)) {
            this.selectedStocks.push(symbol);
            this.updateSelectedStocksList();
            this.showSuccess(`${i18n.t('stock-added', 'Stock added')}: ${symbol}`);
        }
    }
    
    removeStock(symbol) {
        this.selectedStocks = this.selectedStocks.filter(s => s !== symbol);
        this.updateSelectedStocksList();
        this.showSuccess(`${i18n.t('stock-removed', 'Stock removed')}: ${symbol}`);
    }
    
    updateSelectedStocksList() {
        const container = document.getElementById('selected-stocks-list');
        if (!container) return;
        
        if (this.selectedStocks.length === 0) {
            container.innerHTML = `<p class="text-center" style="color: #666; margin: 20px 0;">${i18n.t('no-stocks-selected', 'No stocks selected yet')}</p>`;
            return;
        }
        
        container.innerHTML = this.selectedStocks.map(symbol => 
            `<span class="selected-stock-item">
                ${symbol}
                <button class="remove-btn" onclick="app.removeStock('${symbol}')" title="${i18n.t('remove-stock', 'Remove')}">
                    <i class="fas fa-times"></i>
                </button>
            </span>`
        ).join('');
    }
    
    // Display helpers
    displayCatalysts(news) {
        const container = document.getElementById('catalyst-content');
        if (!container) return;
        
        if (!news || news.length === 0) {
            container.innerHTML = `<p>${i18n.t('no-news-available', 'No recent news available')}</p>`;
            return;
        }
        
        container.innerHTML = news.map(article => 
            `<div class="catalyst-item">
                <i class="fas fa-newspaper"></i>
                <div>
                    <strong>${article.title}</strong>
                    <p>${article.description}</p>
                    <small>${new Date(article.publishedAt).toLocaleDateString()} - ${article.source.name}</small>
                </div>
            </div>`
        ).join('');
    }
    
    displayPerformanceMetrics(metrics) {
        const container = document.getElementById('performance-metrics');
        if (!container) return;
        
        container.innerHTML = `
            <div class="performance-metrics">
                <div class="metric-item">
                    <span class="metric-value ${metrics.totalReturn >= 0 ? 'status-positive' : 'status-negative'}">
                        ${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(1)}%
                    </span>
                    <div class="metric-label">${i18n.t('total-return', '總收益率')}</div>
                </div>
                <div class="metric-item">
                    <span class="metric-value status-positive">${metrics.winRate.toFixed(1)}%</span>
                    <div class="metric-label">${i18n.t('win-rate', '勝率')}</div>
                </div>
                <div class="metric-item">
                    <span class="metric-value status-negative">${metrics.maxDrawdown.toFixed(1)}%</span>
                    <div class="metric-label">${i18n.t('max-drawdown', '最大回撤')}</div>
                </div>
                <div class="metric-item">
                    <span class="metric-value">${metrics.sharpeRatio.toFixed(2)}</span>
                    <div class="metric-label">${i18n.t('sharpe-ratio', '夏普比率')}</div>
                </div>
                <div class="metric-item">
                    <span class="metric-value">${metrics.totalTrades}</span>
                    <div class="metric-label">${i18n.t('total-trades', '交易次數')}</div>
                </div>
            </div>
        `;
    }
    
    // Utility functions
    formatCurrency(amount, currency) {
        if (currency) {
            return i18n.formatCurrency(amount, currency);
        }
        return new Intl.NumberFormat(i18n.getLocale(), {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    getMarketName(market) {
        const names = {
            'zh-TW': { US: '美股', HK: '港股', CN: 'A股' },
            'en': { US: 'US', HK: 'HK', CN: 'CN' },
            'zh-CN': { US: '美股', HK: '港股', CN: 'A股' }
        };
        return names[this.currentLanguage]?.[market.toUpperCase()] || market;
    }
    
    getMarketCurrency(market) {
        const currencies = { US: 'USD', HK: 'HKD', CN: 'CNY' };
        return currencies[market.toUpperCase()] || 'USD';
    }
    
    getRSIClass(rsi) {
        if (rsi >= 70) return 'status-negative'; // Overbought
        if (rsi <= 30) return 'status-positive'; // Oversold
        return 'status-neutral';
    }
    
    // UI state management
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }
    
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }
    
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        console.error(message);
    }
    
    showSuccess(message) {
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
        console.log(message);
    }
    
    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    // Update API status display with detailed information
    updateAPIStatus(connected, details = {}) {
        const statusElement = document.getElementById('api-status');
        const statusText = statusElement?.querySelector('.status-text');
        
        if (!statusElement || !statusText) return;
        
        if (connected) {
            statusElement.className = 'api-status connected';
            
            // Show detailed API status
            let statusMessage = i18n.t('api-status-connected', 'API Connected');
            if (details.connectedCount) {
                statusMessage += ` (${details.connectedCount}/3)`;
            }
            
            statusText.textContent = statusMessage;
            
            // Add detailed tooltip
            statusElement.title = this.buildAPIStatusTooltip(details);
        } else {
            statusElement.className = 'api-status disconnected';
            statusText.textContent = i18n.t('api-status-disconnected', 'API Disconnected');
            
            if (details.error) {
                statusElement.title = `錯誤: ${details.error}`;
            } else {
                statusElement.title = '所有API連接失敗，將使用模擬數據';
            }
        }
    }
    
    // Build detailed API status tooltip
    buildAPIStatusTooltip(details) {
        const status = [];
        if (details.alphaVantage !== undefined) {
            status.push(`Alpha Vantage: ${details.alphaVantage ? '✓' : '✗'}`);
        }
        if (details.tushare !== undefined) {
            status.push(`Tushare: ${details.tushare ? '✓' : '✗'}`);
        }
        if (details.news !== undefined) {
            status.push(`News API: ${details.news ? '✓' : '✗'}`);
        }
        return status.join('\n');
    }
    
    // Reset filters to default values
    resetFilters() {
        const defaults = APP_CONFIG.screening.defaultCriteria;
        
        const priceChange = document.getElementById('price-change');
        const volumeRatio = document.getElementById('volume-ratio');
        const rsiRange = document.getElementById('rsi-range');
        const timePeriod = document.getElementById('time-period');
        const minMarketCap = document.getElementById('min-market-cap');
        
        if (priceChange) priceChange.value = defaults.priceChange;
        if (volumeRatio) volumeRatio.value = defaults.volumeRatio;
        if (rsiRange) rsiRange.value = defaults.rsiRange;
        if (timePeriod) timePeriod.value = defaults.timePeriod;
        if (minMarketCap) minMarketCap.value = defaults.minMarketCap;
    }
    
    // Initialize section-specific features
    initializeScreeningSection() {
        // Any screening-specific initialization
    }
    
    initializeAnalysisSection() {
        // Pre-populate with first selected stock if any
        if (this.selectedStocks.length > 0) {
            const symbolInput = document.getElementById('analysis-symbol');
            if (symbolInput && !symbolInput.value) {
                symbolInput.value = this.selectedStocks[0];
            }
        }
    }
    
    initializeBacktestSection() {
        // Pre-populate with first selected stock if any
        if (this.selectedStocks.length > 0) {
            const symbolInput = document.getElementById('backtest-symbol');
            if (symbolInput && !symbolInput.value) {
                symbolInput.value = this.selectedStocks[0];
            }
        }
    }
    
    initializeTradingSection() {
        this.updateSelectedStocksList();
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + number keys for section switching
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.showSection('screening');
                        break;
                    case '2':
                        e.preventDefault();
                        this.showSection('analysis');
                        break;
                    case '3':
                        e.preventDefault();
                        this.showSection('backtest');
                        break;
                    case '4':
                        e.preventDefault();
                        this.showSection('trading');
                        break;
                }
            }
        });
    }
    
    // Initialize tooltips
    initializeTooltips() {
        // Add tooltips to elements with title attributes
        const elementsWithTooltips = document.querySelectorAll('[title]');
        elementsWithTooltips.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                // Could implement custom tooltip logic here
            });
        });
    }
    
    // Update charts language
    updateChartsLanguage() {
        // Recreate charts with new language labels
        // This would be called when language changes
        Object.keys(this.chartManager.charts).forEach(chartId => {
            const chart = this.chartManager.charts[chartId];
            if (chart) {
                // Update chart labels based on new language
                chart.update();
            }
        });
    }
    
    // Display screening results with data source information
    displayScreeningResults(results) {
        const tbody = document.getElementById('results-tbody');
        const resultsContainer = document.getElementById('screening-results');
        
        if (!tbody || !resultsContainer) return;
        
        tbody.innerHTML = '';
        
        // Add data source warning if using mock data
        this.showDataSourceWarning(results);
        
        results.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${stock.symbol}
                    ${this.getDataSourceBadge(stock)}
                </td>
                <td>${stock.name}</td>
                <td>${this.getMarketName(stock.market)}</td>
                <td>${this.formatCurrency(stock.price, this.getMarketCurrency(stock.market))}</td>
                <td class="${stock.change >= 0 ? 'status-positive' : 'status-negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(1)}%
                </td>
                <td>${stock.volumeRatio.toFixed(1)}x</td>
                <td class="${this.getRSIClass(stock.rsi)}">${stock.rsi.toFixed(0)}</td>
                <td><strong>${stock.score}</strong></td>
                <td>
                    <button class="btn-secondary" onclick="app.selectStock('${stock.symbol}')" style="padding: 5px 10px; font-size: 12px;">
                        <i class="fas fa-plus"></i> ${i18n.t('select-stock', '選擇')}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        resultsContainer.style.display = 'block';
        
        // Update results count
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) {
            resultsTitle.textContent = `${i18n.t('results-title', '篩選結果')} (${results.length})`;
        }
    }
    
    // Show data source warning
    showDataSourceWarning(data) {
        const warningContainer = document.getElementById('data-source-warning');
        
        if (data._source === 'mock') {
            if (!warningContainer) {
                // Create warning container if it doesn't exist
                const warning = document.createElement('div');
                warning.id = 'data-source-warning';
                warning.className = 'alert alert-warning';
                warning.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>數據來源提醒：</strong> 
                    當前顯示的是模擬數據，原因：${data._reason || 'API不可用'}。
                    模擬數據僅供演示，請勿用於實際投資決策。
                `;
                
                const resultsContainer = document.getElementById('screening-results');
                if (resultsContainer) {
                    resultsContainer.insertBefore(warning, resultsContainer.firstChild);
                }
            } else {
                warningContainer.style.display = 'block';
            }
        } else if (warningContainer) {
            warningContainer.style.display = 'none';
        }
    }
    
    // Get data source badge
    getDataSourceBadge(data) {
        if (data._source === 'mock') {
            return '<span class="badge badge-warning" title="模擬數據">Mock</span>';
        } else if (data._source === 'api') {
            return '<span class="badge badge-success" title="真實API數據">Real</span>';
        }
        return '';
    }
    
    // Display analysis results with data source information
    async displayAnalysisResults(data) {
        const { quote, history, indicators, news } = data;
        
        // Show data source warnings
        this.showDataSourceWarning(quote);
        if (history._source === 'mock') this.showDataSourceWarning(history);
        if (indicators._source === 'mock') this.showDataSourceWarning(indicators);
        
        // Update stock info with data quality indicators
        const stockInfo = document.getElementById('stock-info');
        if (stockInfo && quote) {
            stockInfo.innerHTML = `
                <div class="stock-header">
                    <h3>
                        ${quote.symbol} 
                        ${this.getDataSourceBadge(quote)}
                    </h3>
                    <div class="stock-price">
                        <span class="price">${this.formatCurrency(quote.price)}</span>
                        <span class="change ${quote.changePercent >= 0 ? 'positive' : 'negative'}">
                            ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%
                        </span>
                    </div>
                </div>
                <div class="stock-details">
                    <div class="detail-item">
                        <span class="label">成交量:</span>
                        <span class="value">${this.formatNumber(quote.volume)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">最高:</span>
                        <span class="value">${this.formatCurrency(quote.high)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">最低:</span>
                        <span class="value">${this.formatCurrency(quote.low)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">數據質量:</span>
                        <span class="value ${quote._source === 'mock' ? 'warning' : 'success'}">
                            ${quote._source === 'mock' ? '模擬數據' : '真實數據'}
                        </span>
                    </div>
                </div>
            `;
        }
        
        // Create charts with data source information
        if (history && history.labels && history.prices) {
            chartManager.createPriceChart({
                labels: history.labels,
                prices: history.prices,
                _source: history._source
            });
            
            // Only create volume chart if we have volume data
            if (history.volumes && history.volumes.length > 0) {
                chartManager.createVolumeChart({
                    labels: history.labels,
                    volumes: history.volumes,
                    _source: history._source
                });
            } else {
                // Show message about missing volume data
                const volumeContainer = document.getElementById('volume-chart');
                if (volumeContainer) {
                    volumeContainer.innerHTML = `
                        <div class="no-data-message">
                            <i class="fas fa-info-circle"></i>
                            <p>成交量數據不可用</p>
                            <small>API暫時無法提供成交量數據</small>
                        </div>
                    `;
                }
            }
        }
        
        if (indicators) {
            chartManager.createIndicatorsChart(indicators);
        }
        
        if (news && news.length > 0) {
            this.displayCatalysts(news);
        }
        
        document.getElementById('analysis-results').style.display = 'block';
    }
    
    // Display backtest results with data source information
    displayBacktestResults(data) {
        // Show data source warning
        this.showDataSourceWarning(data);
        
        const metricsContainer = document.getElementById('backtest-metrics');
        const chartContainer = document.getElementById('backtest-chart');
        
        if (metricsContainer) {
            metricsContainer.innerHTML = `
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">總回報率</div>
                        <div class="metric-value ${data.totalReturn >= 0 ? 'positive' : 'negative'}">
                            ${data.totalReturn.toFixed(2)}%
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">夏普比率</div>
                        <div class="metric-value">${data.sharpeRatio.toFixed(2)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">最大回撤</div>
                        <div class="metric-value negative">${data.maxDrawdown.toFixed(2)}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">勝率</div>
                        <div class="metric-value">${data.winRate.toFixed(1)}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">交易次數</div>
                        <div class="metric-value">${data.totalTrades}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">數據來源</div>
                        <div class="metric-value ${data._source === 'mock' ? 'warning' : 'success'}">
                            ${data._source === 'mock' ? '模擬數據' : '真實數據'}
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (chartContainer && data.equity) {
            chartManager.createBacktestChart(data);
        }
        
        document.getElementById('backtest-results').style.display = 'block';
    }
    
    // Display trading plans with data source information
    displayTradingPlan(plans) {
        const container = document.getElementById('trading-plan-results');
        if (!container) return;
        
        let html = '<div class="trading-plans">';
        
        plans.forEach(plan => {
            const signalClass = plan.signal.toLowerCase();
            const dataQualityClass = plan._dataQuality === 'simulated' ? 'warning' : 'success';
            
            html += `
                <div class="trading-plan-card">
                    <div class="plan-header">
                        <h4>
                            ${plan.symbol} 
                            <span class="badge badge-${dataQualityClass}">
                                ${plan._dataQuality === 'simulated' ? '模擬' : '真實'}
                            </span>
                        </h4>
                        <div class="signal-badge signal-${signalClass}">
                            ${plan.signal}
                        </div>
                    </div>
                    
                    <div class="plan-details">
                        <div class="detail-row">
                            <span class="label">當前價格:</span>
                            <span class="value">${this.formatCurrency(plan.currentPrice)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">目標價格:</span>
                            <span class="value">${this.formatCurrency(plan.targetPrice)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">止損價格:</span>
                            <span class="value">${this.formatCurrency(plan.stopLoss)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">風險回報比:</span>
                            <span class="value">${plan.riskReward.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">信心度:</span>
                            <span class="value">${plan.confidence}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">建議持倉:</span>
                            <span class="value">${plan.position}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">時間框架:</span>
                            <span class="value">${plan.timeframe}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add overall data quality warning
        if (plans.some(plan => plan._dataQuality === 'simulated')) {
            html = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>數據質量提醒：</strong> 部分交易計劃基於模擬數據生成，請謹慎參考。
                </div>
            ` + html;
        }
        
        container.innerHTML = html;
        container.style.display = 'block';
    }
    
    // Cleanup resources
    cleanup() {
        this.chartManager.destroyAllCharts();
        apiManager.clearCache();
    }
}

// Global functions for HTML onclick handlers
function switchLanguage(lang) {
    app.switchLanguage(lang);
}

function showSection(section) {
    app.showSection(section);
}

function startScreening() {
    app.startScreening();
}

function analyzeStock() {
    app.analyzeStock();
}

function runBacktest() {
    app.runBacktest();
}

function generateTradingPlan() {
    app.generateTradingPlan();
}

function selectStock(symbol) {
    app.selectStock(symbol);
}

function removeStock(symbol) {
    app.removeStock(symbol);
}

// Initialize app when DOM is loaded
const app = new MomentumTradingApp();

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing Momentum Trading App...');
    await app.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MomentumTradingApp, app };
} 
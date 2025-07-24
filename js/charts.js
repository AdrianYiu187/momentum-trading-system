// Chart Management System
class ChartManager {
    constructor() {
        this.charts = {};
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        };
    }
    
    // Create or update price chart
    createPriceChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const config = {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: i18n.t('price-chart-title', '股價'),
                    data: data.prices || [],
                    borderColor: APP_CONFIG.charts.theme.primaryColor,
                    backgroundColor: `${APP_CONFIG.charts.theme.primaryColor}20`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        title: {
                            display: true,
                            text: i18n.t('date', '日期')
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: i18n.t('price', '價格')
                        },
                        beginAtZero: false
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // Create volume chart
    createVolumeChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const config = {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: i18n.t('volume-chart-title', '成交量'),
                    data: data.volumes || [],
                    backgroundColor: `${APP_CONFIG.charts.theme.secondaryColor}60`,
                    borderColor: APP_CONFIG.charts.theme.secondaryColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        title: {
                            display: true,
                            text: i18n.t('date', '日期')
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: i18n.t('volume', '成交量')
                        }
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // Create technical indicators chart
    createIndicatorsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const datasets = [];
        
        // RSI dataset
        if (data.rsi && data.rsi.length > 0) {
            datasets.push({
                label: 'RSI',
                data: data.rsi,
                borderColor: '#28a745',
                backgroundColor: '#28a74520',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y'
            });
        }
        
        // MACD dataset
        if (data.macd && data.macd.length > 0) {
            datasets.push({
                label: 'MACD',
                data: data.macd,
                borderColor: '#dc3545',
                backgroundColor: '#dc354520',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1'
            });
        }
        
        const config = {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: datasets
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        title: {
                            display: true,
                            text: i18n.t('date', '日期')
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'RSI'
                        },
                        min: 0,
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'MACD'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // Create backtest performance chart
    createBacktestChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const config = {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: i18n.t('strategy-return', '策略收益'),
                    data: data.returns || [],
                    borderColor: APP_CONFIG.charts.theme.primaryColor,
                    backgroundColor: `${APP_CONFIG.charts.theme.primaryColor}20`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: i18n.t('benchmark-return', '基準收益'),
                    data: data.benchmark || [],
                    borderColor: APP_CONFIG.charts.theme.secondaryColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5]
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        title: {
                            display: true,
                            text: i18n.t('date', '日期')
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: i18n.t('cumulative-return', '累積收益率 (%)')
                        }
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // Create risk analysis chart (pie chart)
    createRiskChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const config = {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#667eea',
                        '#764ba2'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...this.defaultOptions,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // Create candlestick chart (using line chart as approximation)
    createCandlestickChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        // For simplicity, we'll use high-low-close as a line chart
        // In a production environment, you might want to use a candlestick plugin
        const config = {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: i18n.t('high', '最高價'),
                    data: data.high || [],
                    borderColor: '#28a745',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 1
                }, {
                    label: i18n.t('low', '最低價'),
                    data: data.low || [],
                    borderColor: '#dc3545',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 1
                }, {
                    label: i18n.t('close', '收盤價'),
                    data: data.close || [],
                    borderColor: APP_CONFIG.charts.theme.primaryColor,
                    backgroundColor: `${APP_CONFIG.charts.theme.primaryColor}20`,
                    borderWidth: 2,
                    fill: '+1',
                    pointRadius: 2
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        ...this.defaultOptions.scales.x,
                        title: {
                            display: true,
                            text: i18n.t('date', '日期')
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        title: {
                            display: true,
                            text: i18n.t('price', '價格')
                        },
                        beginAtZero: false
                    }
                }
            }
        };
        
        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }
    
    // Update chart data
    updateChart(canvasId, newData) {
        const chart = this.charts[canvasId];
        if (!chart) return false;
        
        chart.data.labels = newData.labels || chart.data.labels;
        chart.data.datasets.forEach((dataset, index) => {
            if (newData.datasets && newData.datasets[index]) {
                dataset.data = newData.datasets[index].data;
            }
        });
        
        chart.update('active');
        return true;
    }
    
    // Destroy all charts
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            if (this.charts[chartId]) {
                this.charts[chartId].destroy();
                delete this.charts[chartId];
            }
        });
    }
    
    // Destroy specific chart
    destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
            return true;
        }
        return false;
    }
    
    // Get chart instance
    getChart(canvasId) {
        return this.charts[canvasId] || null;
    }
    
    // Check if chart exists
    hasChart(canvasId) {
        return !!this.charts[canvasId];
    }
}

// Mock data generators for demo purposes
const MockDataGenerator = {
    // Generate mock price data
    generatePriceData(days = 90, startPrice = 100) {
        const labels = [];
        const prices = [];
        const high = [];
        const low = [];
        const close = [];
        
        let currentPrice = startPrice;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            labels.push(date.toLocaleDateString());
            
            // Simulate price movement
            const change = (Math.random() - 0.5) * 0.1; // ±5% max change
            currentPrice *= (1 + change);
            
            const dailyHigh = currentPrice * (1 + Math.random() * 0.05);
            const dailyLow = currentPrice * (1 - Math.random() * 0.05);
            
            prices.push(currentPrice.toFixed(2));
            high.push(dailyHigh.toFixed(2));
            low.push(dailyLow.toFixed(2));
            close.push(currentPrice.toFixed(2));
        }
        
        return { labels, prices, high, low, close };
    },
    
    // Generate mock volume data
    generateVolumeData(days = 90) {
        const labels = [];
        const volumes = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            labels.push(date.toLocaleDateString());
            
            // Simulate volume
            const baseVolume = 1000000;
            const volume = baseVolume * (0.5 + Math.random() * 1.5);
            volumes.push(Math.round(volume));
        }
        
        return { labels, volumes };
    },
    
    // Generate mock RSI data
    generateRSIData(days = 90) {
        const data = [];
        let rsi = 50; // Start at neutral
        
        for (let i = 0; i < days; i++) {
            // Simulate RSI oscillation
            const change = (Math.random() - 0.5) * 10;
            rsi += change;
            rsi = Math.max(0, Math.min(100, rsi)); // Keep within 0-100
            data.push(rsi.toFixed(2));
        }
        
        return data;
    },
    
    // Generate mock MACD data
    generateMACDData(days = 90) {
        const data = [];
        let macd = 0;
        
        for (let i = 0; i < days; i++) {
            // Simulate MACD oscillation
            const change = (Math.random() - 0.5) * 2;
            macd += change;
            data.push(macd.toFixed(4));
        }
        
        return data;
    },
    
    // Generate mock backtest data
    generateBacktestData(days = 252) {
        const labels = [];
        const returns = [];
        const benchmark = [];
        
        let strategyValue = 100;
        let benchmarkValue = 100;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            labels.push(date.toLocaleDateString());
            
            // Strategy returns (slightly better than random)
            const strategyReturn = (Math.random() - 0.46) * 0.03; // Slight positive bias
            strategyValue *= (1 + strategyReturn);
            
            // Benchmark returns (market-like)
            const benchmarkReturn = (Math.random() - 0.48) * 0.02;
            benchmarkValue *= (1 + benchmarkReturn);
            
            returns.push(((strategyValue - 100) / 100 * 100).toFixed(2));
            benchmark.push(((benchmarkValue - 100) / 100 * 100).toFixed(2));
        }
        
        return { labels, returns, benchmark };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartManager, MockDataGenerator };
} 
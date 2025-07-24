# 動能交易策略系統 (Momentum Trading System)

一個專業的動能交易策略系統，為尋求短期（1-3個月）高回報的投資者提供股票篩選、技術分析、歷史回測和交易計劃生成功能。

## 🚀 功能特點

### 📊 股票篩選系統
- 支持香港、中國、美國三大股票市場
- 基於價格變動、成交量、RSI等技術指標進行篩選
- 可自定義篩選條件和時間範圍
- 智能評分系統

### 📈 深度技術分析
- 實時股價圖表顯示
- 成交量分析
- RSI、MACD等技術指標
- 新聞催化劑分析

### 🔄 歷史回測系統
- 基於歷史數據驗證交易策略
- 可調整移動平均線和RSI參數
- 詳細的績效指標分析
- 勝率、最大回撤、夏普比率等

### 💼 交易決策系統
- 基於分析結果生成交易計劃
- 明確的入場價、目標價和停損點
- 風險回報比分析
- 倉位大小建議

### 🌐 多語言支持
- 繁體中文
- 英文
- 簡體中文

## 🛠️ 技術架構

### 前端技術
- **HTML5** - 語義化標記
- **CSS3** - 響應式設計，支持多設備
- **JavaScript (ES6+)** - 模塊化架構
- **Chart.js** - 專業圖表顯示
- **Font Awesome** - 圖標系統

### 後端API
- **Node.js** - 服務端運行環境
- **Vercel Functions** - 無服務器函數
- **Netlify Functions** - 替代部署選項

### 數據來源
- **Alpha Vantage API** - 股票報價和技術指標
- **Tushare Pro** - 中國市場數據
- **News API** - 新聞和催化劑分析
- **Yahoo Finance** - 補充數據源

## 📦 項目結構

```
momentum-trading-system/
├── index.html              # 主頁面
├── styles/
│   └── main.css            # 主要樣式文件
├── js/
│   ├── config.js           # 配置文件
│   ├── translations.js     # 多語言翻譯
│   ├── charts.js           # 圖表管理
│   ├── api.js              # API管理
│   └── app.js              # 主應用邏輯
├── api/
│   └── stocks.js           # 後端API處理
├── package.json            # 項目配置
├── vercel.json             # Vercel部署配置
├── netlify.toml            # Netlify部署配置
└── README.md               # 項目說明
```

## 🚀 快速開始

### 本地開發

1. **克隆項目**
```bash
git clone https://github.com/momentum-trading/system.git
cd momentum-trading-system
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發服務器**
```bash
npm run dev
```

4. **瀏覽器訪問**
```
http://localhost:3000
```

### 環境變量設置

創建 `.env` 文件：
```env
TUSHARE_TOKEN=your_tushare_token
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
```

## 🌐 部署選項

### Vercel 部署

1. **連接GitHub倉庫**
```bash
npm install -g vercel
vercel
```

2. **設置環境變量**
在Vercel Dashboard中設置API密鑰

3. **自動部署**
推送到主分支自動觸發部署

### Netlify 部署

1. **連接Git倉庫**
- 登錄Netlify Dashboard
- 選擇"New site from Git"
- 連接GitHub倉庫

2. **構建設置**
```
Build command: (留空)
Publish directory: .
```

3. **環境變量**
在Site settings > Environment variables中添加API密鑰

### GitHub Pages 部署

1. **啟用GitHub Pages**
- 進入倉庫Settings
- 選擇Pages標籤
- 設置Source為main分支

2. **訪問網站**
```
https://username.github.io/momentum-trading-system
```

## 🔧 API密鑰申請

### Alpha Vantage
1. 訪問 [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. 免費註冊獲得API密鑰
3. 每天500次請求限制

### News API
1. 訪問 [News API](https://newsapi.org/)
2. 註冊開發者賬戶
3. 獲得免費API密鑰

### Tushare Pro (可選)
1. 訪問 [Tushare Pro](https://tushare.pro/)
2. 註冊並獲得token
3. 用於中國市場數據

## 📱 響應式設計

系統支持以下設備：
- 🖥️ 桌面電腦 (1200px+)
- 💻 筆記本電腦 (768px-1199px)
- 📱 平板電腦 (481px-767px)
- 📱 手機 (320px-480px)

## 🎨 自定義主題

可以通過修改 `styles/main.css` 中的CSS變量來自定義主題：

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #ffffff;
  --text-color: #333333;
}
```

## 🔒 安全性

- API密鑰通過環境變量管理
- CORS頭部設置防止跨域攻擊
- Content Security Policy設置
- XSS防護和點擊劫持防護

## 📊 性能優化

- 數據緩存機制減少API調用
- 圖表懶加載
- 響應式圖片
- 最小化和壓縮資源

## 🧪 測試

```bash
# 運行測試 (待實現)
npm test

# 代碼檢查 (待實現)
npm run lint
```

## 📈 使用指南

### 1. 股票篩選
- 選擇目標市場（美股、港股、A股）
- 設置技術指標條件
- 運行篩選獲得結果
- 選擇心儀股票到觀察列表

### 2. 技術分析
- 輸入股票代碼
- 查看價格圖表和技術指標
- 分析新聞催化劑
- 做出投資決策

### 3. 歷史回測
- 設置回測參數
- 運行策略回測
- 分析績效指標
- 優化策略參數

### 4. 交易計劃
- 查看已選股票
- 生成交易計劃
- 設置風險管理
- 執行交易決策

## 🤝 貢獻指南

歡迎提交Pull Request或Issue！

1. Fork項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打開Pull Request

## 📄 許可證

此項目採用MIT許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 📞 聯繫方式

- 項目鏈接: [https://github.com/momentum-trading/system](https://github.com/momentum-trading/system)
- 演示網站: [https://momentum-trading-system.vercel.app](https://momentum-trading-system.vercel.app)
- 問題回報: [GitHub Issues](https://github.com/momentum-trading/system/issues)

## ⚠️ 免責聲明

本系統僅用於教育和研究目的。所有交易決策應基於個人分析和風險承受能力。投資有風險，請謹慎決策。

---

**🔮 動能交易策略系統 - 讓數據驅動您的投資決策！** 
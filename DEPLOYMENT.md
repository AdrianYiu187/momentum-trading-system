# 部署指南 (Deployment Guide)

本指南將幫助您快速創建GitHub項目並部署動能交易策略系統到各個平台。

## 📋 前置準備

1. **GitHub賬戶** - 請確認您已有GitHub賬戶
2. **API密鑰** - 準備好以下API密鑰：
   - Alpha Vantage API Key (免費)
   - News API Key (免費)
   - Tushare Token (可選，用於A股數據)

## 🚀 一鍵部署選項

### 方案1: Vercel 部署 (推薦)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/momentum-trading-system)

1. **點擊上方Deploy按鈕**
2. **登錄Vercel賬戶**
3. **設置項目名稱**: `momentum-trading-system`
4. **添加環境變量**:
   ```
   ALPHA_VANTAGE_API_KEY = 您的Alpha Vantage API密鑰
   NEWS_API_KEY = 您的News API密鑰
   TUSHARE_TOKEN = 您的Tushare Token (可選)
   ```
5. **點擊Deploy**
6. **獲得專用網址**: `https://your-project-name.vercel.app`

### 方案2: Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/momentum-trading-system)

1. **點擊上方Deploy按鈕**
2. **連接GitHub賬戶**
3. **設置構建配置**:
   - Build command: (留空)
   - Publish directory: `.`
4. **添加環境變量** (Site settings > Environment variables):
   ```
   ALPHA_VANTAGE_API_KEY = 您的API密鑰
   NEWS_API_KEY = 您的API密鑰
   TUSHARE_TOKEN = 您的Token (可選)
   ```
5. **獲得專用網址**: `https://your-site-name.netlify.app`

### 方案3: GitHub Pages 部署

1. **進入GitHub倉庫 Settings**
2. **選擇 Pages 標籤**
3. **設置 Source**: Deploy from a branch
4. **選擇分支**: `main` / `(root)`
5. **獲得專用網址**: `https://your-username.github.io/momentum-trading-system`

⚠️ **注意**: GitHub Pages是靜態託管，後端API功能受限，建議使用Vercel或Netlify。

## 📂 手動創建GitHub項目

如果您想手動創建項目，請按以下步驟：

### 步驟1: 創建GitHub倉庫

1. **登錄GitHub**：https://github.com
2. **點擊右上角 "+" 按鈕**，選擇 "New repository"
3. **設置倉庫資訊**：
   - Repository name: `momentum-trading-system`
   - Description: `專業動能交易策略系統 - Professional Momentum Trading System`
   - Public/Private: 選擇 Public
   - ✅ Add a README file
   - ✅ Add .gitignore (選擇 Node 模板)
   - ✅ Choose a license (選擇 MIT License)

### 步驟2: 本地開發設置

```bash
# 1. 克隆您的倉庫
git clone https://github.com/YOUR_USERNAME/momentum-trading-system.git
cd momentum-trading-system

# 2. 複製項目文件
# 將所有項目文件複製到這個目錄中

# 3. 初始提交
git add .
git commit -m "Initial commit: 動能交易策略系統"
git push origin main
```

### 步驟3: 設置API密鑰

創建 `.env` 文件 (僅用於本地開發)：
```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
TUSHARE_TOKEN=your_tushare_token
```

## 🔑 API密鑰申請指南

### Alpha Vantage API

1. **訪問**: https://www.alphavantage.co/support/#api-key
2. **註冊免費賬戶**
3. **獲得API密鑰** (每天500次請求)
4. **測試API**:
   ```
   https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY
   ```

### News API

1. **訪問**: https://newsapi.org/
2. **註冊開發者賬戶**
3. **獲得免費API密鑰** (每天1000次請求)
4. **測試API**:
   ```
   https://newsapi.org/v2/everything?q=AAPL&apiKey=YOUR_API_KEY
   ```

### Tushare Pro (可選 - 用於A股數據)

1. **訪問**: https://tushare.pro/
2. **註冊並實名認證**
3. **獲得Token**
4. **用於中國A股市場數據**

## 🌐 部署平台比較

| 平台 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **Vercel** | 無服務器函數支持、自動HTTPS、CDN | - | **推薦**，完整功能 |
| **Netlify** | 豐富的CI/CD、表單處理 | - | 完整功能，替代方案 |
| **GitHub Pages** | 免費、簡單 | 僅靜態、無後端API | 僅展示用途 |

## 🔧 自定義域名設置

### Vercel 自定義域名

1. **進入Vercel Dashboard**
2. **選擇您的項目**
3. **點擊 Settings > Domains**
4. **添加自定義域名**
5. **設置DNS記錄** (CNAME指向vercel.app)

### Netlify 自定義域名

1. **進入Netlify Dashboard**
2. **選擇站點 > Site settings > Domain management**
3. **添加自定義域名**
4. **更新DNS設置**

## 🚨 故障排除

### 常見問題

1. **API調用失敗**
   - 檢查API密鑰是否正確設置
   - 確認API請求限額未超出
   - 查看瀏覽器開發者工具的Network標籤

2. **部署失敗**
   - 檢查環境變量設置
   - 確認所有文件已正確上傳
   - 查看部署日誌

3. **圖表不顯示**
   - 確認Chart.js CDN連接正常
   - 檢查JavaScript控制台錯誤

### 聯繫支持

- **GitHub Issues**: 在您的倉庫中創建Issue
- **部署平台支持**: 
  - Vercel: https://vercel.com/support
  - Netlify: https://www.netlify.com/support/

## 📱 測試清單

部署完成後，請測試以下功能：

- [ ] 多語言切換 (繁中/英文/簡中)
- [ ] 股票篩選功能
- [ ] 技術分析圖表顯示
- [ ] 歷史回測運行
- [ ] 交易計劃生成
- [ ] 響應式設計 (手機/平板/桌面)
- [ ] API連接狀態顯示

## 🎯 下一步

1. **測試所有功能**
2. **自定義配置** (如需要)
3. **監控API使用量**
4. **考慮升級到付費API** (如需更多請求量)

---

**🚀 享受您的專業動能交易策略系統！** 
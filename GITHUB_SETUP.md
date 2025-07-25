# GitHub 設置和推送指南

## 🚨 解決推送權限錯誤 (403)

您遇到的錯誤通常由以下原因造成：

### 1. GitHub 倉庫確認
首先確認倉庫是否存在：
- 訪問：https://github.com/AdrianYiu187/momentum-trading-system
- 如果不存在，需要在GitHub上創建該倉庫

### 2. 認證問題解決

#### 選項 A：使用 GitHub CLI（推薦）
```bash
# 安裝 GitHub CLI
winget install --id GitHub.cli

# 登錄 GitHub
gh auth login

# 重新推送
git push -u origin main
```

#### 選項 B：使用個人訪問令牌 (Personal Access Token)
1. 前往：https://github.com/settings/tokens
2. 點擊「Generate new token (classic)」
3. 設置權限：
   - `repo` (完整倉庫權限)
   - `workflow` (如果使用GitHub Actions)
4. 複製生成的令牌

更新遠程URL：
```bash
git remote set-url origin https://[您的用戶名]:[個人令牌]@github.com/AdrianYiu187/momentum-trading-system.git
git push -u origin main
```

#### 選項 C：使用 SSH (推薦長期使用)
1. 生成SSH密鑰：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. 添加到SSH代理：
```bash
ssh-add ~/.ssh/id_ed25519
```

3. 將公鑰添加到GitHub：
   - 複製 `~/.ssh/id_ed25519.pub` 內容
   - 前往：https://github.com/settings/ssh/new
   - 粘貼公鑰

4. 更新遠程URL：
```bash
git remote set-url origin git@github.com:AdrianYiu187/momentum-trading-system.git
git push -u origin main
```

### 3. 創建 GitHub 倉庫（如果不存在）

#### 通過GitHub網站：
1. 前往：https://github.com/new
2. 倉庫名稱：`momentum-trading-system`
3. 設置為 Public
4. 不初始化（因為本地已有代碼）

#### 通過GitHub CLI：
```bash
gh repo create momentum-trading-system --public --source=. --remote=origin --push
```

### 4. 驗證設置
```bash
# 檢查遠程配置
git remote -v

# 測試連接
git push -u origin main
```

## 🌐 部署選項

### 自動部署到 Vercel
1. 前往：https://vercel.com/new
2. 連接您的GitHub倉庫
3. 項目會自動檢測並部署

### 自動部署到 Netlify
1. 前往：https://app.netlify.com/start
2. 連接您的GitHub倉庫
3. 點擊「Deploy site」

### GitHub Pages
在倉庫 Settings → Pages 中：
1. Source: Deploy from a branch
2. Branch: main
3. Folder: / (root)

## 📞 如需協助
如果仍有問題，請提供錯誤訊息的完整輸出，我會協助您解決。 
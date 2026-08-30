# 哇管家 WowKeeper

<img width="1200" height="630" alt="og" src="https://github.com/user-attachments/assets/149ebb42-fcf2-4962-a0ac-97cbbaeac0fe" />


## 家電耗材管理系統
網址：https://wowkeeper.xin-ping.com/login

>型號一秒查，濾網準時換。


## 功能介紹
1. 拍照自動辨識家電
- 拍一張家電的銘牌、說明書等等，交給 AI 讀出類別、品牌、型號

2. 三步驟新增家電
- 拍照 → 確認資料 → 設定耗材

3. 耗材週期管理
- 每台家電可登記多項耗材，各自設定「更換或清潔週期」

4. 紅黃綠燈號
- 設置三種顏色燈號（綠色正常、黃色快到期、紅色已逾期），並在首頁顯示全部、逾期或快到期的家電及該數量

5. 耗材快到期提醒
- 系統每天早上九點掃描，把到期的項目彙整成一封信寄給你
- 到期前 15 天、7 天，跟逾期後各提醒一次

## 開發環境與技術
### 前端
1. TypeScript、Tailwind
2. React、Vite
3. Cloudflare Workers

### 後端
1. TypeScript
2. Cloudflare Worker
3. 資料庫 D1（SQLite）

### 雲端服務
1. 圖片辨識： Cloudflare Workers AI（Llama 4 Scout）
2. 提醒信：Cloudflare Email Service（Email Sending）
3. 每日排程：Cloudflare Workers Cron Triggers
4. 網域：Cloudflare Registrar



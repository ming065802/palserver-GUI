# palserver Discord Bot

獨立 Node.js Discord bot，透過 palserver-GUI 的 **本機 Management API** 查詢伺服器狀態與受控啟停。

## 需求

- Node.js 18+
- 已啟用的 palserver-GUI **本機 Management API**（預設 `http://127.0.0.1:3435`）
- Discord Bot Token 與 Application Client ID

## 快速開始

```bash
cd discord-bot
cp config.example.json config.json
# 編輯 config.json，填入 discord.token、discord.clientId、discord.guildId
npm install
npm run build
npm start
```

開發模式（免編譯）：

```bash
npm run dev
```

## 設定

見 `config.example.json`。GUI 儲存設定時會自動寫入 `config.json`。

環境變數可覆寫設定：

| 變數 | 說明 |
|------|------|
| `DISCORD_BOT_TOKEN` | Discord Bot Token |
| `MANAGEMENT_API_URL` | Management API 基底 URL |
| `MANAGEMENT_API_KEY` | API 金鑰 |
| `DEFAULT_SERVER_ID` | 預設伺服器 ID |

## Slash 指令

| 指令 | 說明 | 權限 |
|------|------|------|
| `/status [serverId]` | 查詢運行狀態 | 所有人 |
| `/servers` | 列出所有實例 | 所有人 |
| `/start [serverId]` | 啟動本機實例 | Admin 角色／使用者 |
| `/stop [serverId]` | 關閉實例 | Admin 角色／使用者 |
| `/restart [serverId]` | 重啟本機實例 | Admin 角色／使用者 |

遠端實例的 `/start`、`/restart` 會回傳 Management API `501` 的友善說明。

## 獨立部署

在常駐主機上複製 `discord-bot/` 目錄，將 `MANAGEMENT_API_URL` 指向開服主機（需防火牆與 API 金鑰），執行 `npm install && npm start` 即可，無需綁定 GUI 生命週期。

## 申請 Discord Bot

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications) 建立 Application
2. Bot 分頁建立 Bot 並複製 Token
3. OAuth2 → URL Generator：勾選 `bot`、`applications.commands`
4. 將 bot 邀請至伺服器，並在 `config.json` 填入 `guildId`、允許操作的 `allowedRoleIds`／`allowedUserIds`

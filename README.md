# palserver GUI

![RELEASE](https://img.shields.io/badge/RELEASE-1.2.0-green)
[![Website](https://img.shields.io/badge/website-click-blue)](https://dalufishes-team.gitbook.io/palserver-gui-en)
[![Discord](https://img.shields.io/badge/discord-click-blue)](https://discord.gg/sgMMdUZd3V)
![Make With Love](https://img.shields.io/badge/make_with_%E2%9D%A4%EF%B8%8F-white)

#### [English](/README_EN.md) / [繁體中文](/README.md)

> 加入我們的 Discord 以獲得更多資訊 - https://discord.gg/sgMMdUZd3V

palserver GUI 是一款全圖形化介面的專用伺服器架設、管理工具：

- **開箱即用**：易於上手，傻瓜式安裝 + 一鍵啟動伺服器。
- **全圖形化介面**：提供完整且功能強大的 GUI 介面調整世界設定、伺服器設定等。
- **強大功能擴展**：內建 UE4SS 和 Palguard 防作弊系統、玩家列表、線上地圖、多存檔管理和模組管理等功能，大幅提升伺服器的管理效率和玩家體驗。
- **Palworld 1.0 支援**：跨平台設定、語音聊天、REST API 管理、自動重啟與 1.0 世界參數。

---

### Palworld 1.0 專用伺服器支援

palserver-GUI 可協助管理 **Palworld 1.0**（2026/7/10 正式版）專用伺服器，重點包含：

| 功能 | 說明 |
|------|------|
| **跨平台** | GUI 設定 `CrossplayPlatforms`（Steam / Xbox / PS5 / Mac） |
| **REST API** | 官方推薦管理方式：玩家列表、踢人、封禁、廣播、定時重啟 |
| **1.0 世界設定** | 語音聊天、牧場速度、公會會長移交、PvP 掉落等 |
| **自動重啟** | 建議 1.0 伺服器每 6–12 小時重啟，緩解記憶體壓力 |
| **一鍵更新** | 透過 SteamCMD 將專用伺服器更新至 1.0 |

**連線埠參考：**

- `8211/UDP` — 遊戲主埠（必開）
- `8212/TCP` — REST API（建議開啟）
- `27015/UDP` — 社群伺服器列表（主機玩家需要）
- `25575/TCP` — RCON（已棄用，僅 Palguard 進階指令備用）

**1.0 更新建議：**

1. 備份 `Pal/Saved/SaveGames`
2. 在 GUI 中一鍵更新專用伺服器引擎
3. 先停用 Mod，確認能正常啟動後再逐一啟用
4. 舊存檔可沿用，但官方建議開新檔以獲得最佳體驗

---

### 一鍵啟動伺服器

安裝完成後，建立伺服器，點擊「右下角啟動」即成功架設您的第一個伺服器。

> 介面截圖請參考 [官方 GitBook 文檔](https://dalufishes-team.gitbook.io/palserver-gui)。

<!-- Screenshots: /readme/*.png are bundled in release builds -->

### 可視化世界設定選項

使用滑動條和輸入框調整世界設定，不再需要修改原始文件 PalWorldSettings.ini：

> 含 1.0 新增的跨平台、語音聊天、牧場速度等選項（請使用最新開發版或等待 1.2.0 發布）。

<!-- ![world settings](/readme/worldsettings.png) -->

### 在線玩家列表

顯示在線玩家資訊，並提供諸多功能讓房主對玩家操作。

<!-- ![player list](/readme/playerlist.png) -->
<!-- ![player actions](/readme/playeraction.png) -->

### 玩家實時地圖

即時顯示玩家在遊戲內的等級、座標和在地圖上的位置。

<!-- ![online map](/readme/onlinemap.png) -->

### 模組管理、匯出到遊戲

默認安裝 UE4SS 及 Palguard，模組管理面板，一鍵打包到客戶端！

<!-- ![mod management](/readme/mod.png) -->

### 一鍵更新、一鍵最佳化、還有更多

除此之外，還有更多的伺服器設定與功能，微調您的伺服器以達到最佳的遊戲體驗！

---

### 安裝連結及更新

- 安裝包 (推薦)：[點我下載](https://github.com/ming065802/palserver-GUI/releases/download/1.2.0/1.2.0-palserver-gui.exe)
- 免安裝版本：[點我下載](https://github.com/ming065802/palserver-GUI/releases/download/1.2.0/unpack-1.2.0-palserver-gui.zip)

### 常見問題

- 使用 VPN 仍無法進入伺服器：[點我](https://dalufishes-team.gitbook.io/palserver-gui/faq/shi-yong-vpn-reng-wu-fa-jin-ru-si-fu-qi)
- 伺服器無法啟動：[點我](https://dalufishes-team.gitbook.io/palserver-gui/faq/si-fu-qi-wu-fa-qi-dong)
- 伺服器頻繁崩潰：[點我](https://dalufishes-team.gitbook.io/palserver-gui/faq/si-fu-qi-bin-fan-beng-kui)
- 沒有顯示在線玩家：[點我](https://dalufishes-team.gitbook.io/palserver-gui/faq/mei-you-xian-shi-zai-xian-wan-jia)
- 如何將測試版本 GUI 檔案遷移到正式版：[點我](https://dalufishes-team.gitbook.io/palserver-gui/faq/ce-shi-ban-ben-gui-dang-an-qian-yi-dao-zheng-shi-ban)

**Palworld 1.0 相關：**

- 更新到 1.0：在 GUI 首頁或伺服器設定中點「一鍵更新」，更新前請備份存檔
- 跨平台連線：於世界設定啟用 `CrossplayPlatforms`；Xbox/PS5 玩家需開啟「公開到社群選單」並轉發 `27015/UDP`
- Steam 玩家建議使用 Direct Connect：`你的IP:8211`
- 存檔遷移：建議使用 `palworld-save-tools==0.24.0`；1.0 機制變動大，遷移前務必備份
- Mod 與 1.0：更新後先無 Mod 測試，確認穩定後再逐一啟用

完整變更紀錄見 [CHANGELOG.md](/CHANGELOG.md)。

### 相關連結

- Discord： [點我](https://discord.gg/sgMMdUZd3V)
- 官方文檔：[點我](https://dalufishes-team.gitbook.io/palserver-gui)
- 巴哈文：[點我](https://forum.gamer.com.tw/C.php?bsn=71458&snA=2043)
- yahoo 遊戲新聞連結：[點我](https://tw.news.yahoo.com/palserver-gui-041354287.html)
- 電玩誌：[點我](https://gank.fanpiece.com/animeradio/%E5%8F%B0%E7%81%A3%E5%A4%A7%E7%A5%9E%E5%89%B5-%E5%B9%BB%E7%8D%B8%E5%B8%95%E9%AD%AF-%E4%B8%80%E9%8D%B5%E9%96%8B%E8%A8%AD%E4%BC%BA%E6%9C%8D%E5%99%A8-%E5%B7%A5%E5%85%B7-%E5%85%A7%E5%BB%BA%E7%B9%81%E4%B8%AD-%E5%9C%96%E5%83%8FUI-c1452714.html)
- KK3C 狂想曲：[點我](https://kkplay3c.net/steam-pal-server-gui/)
- 夢遊電玩：[點我](https://www.game735.com/forum.php?mod=viewthread&tid=388027&extra=page%3D1&ordertype=1)

### 相關影片

- 捷克的介紹影片：[點我](https://youtu.be/8Vq7uANT0Eo?si=-nH9lkUpsk7DgMW8)

<a href="https://youtu.be/8Vq7uANT0Eo?si=-nH9lkUpsk7DgMW8" target="_blank">
<img src="https://i.ytimg.com/vi_webp/8Vq7uANT0Eo/maxresdefault.webp"/>
</a>

### 條款

程式碼僅供學習用途，不得再次將軟體進行二次打包散佈、販售。也不得進行商業使用。

### 參與貢獻

目前 palserver GUI 是我的一人專案，使用 Typescript + React + Electron 開發。如果你有興趣參與專案開發 (不論是軟體設計上、美術、翻譯或者程序開發)，都歡迎聯繫我的 discord (使用者名稱：dalufish) 討論！

### 給予支持

如果你覺得工具有解決到你的問題 :D，請給專案一顆星星，謝謝。
也可以給予一杯咖啡的支持 [buymeacoffee](https://www.buymeacoffee.com/dalufish) ，鼓勵我繼續創作，感激不盡。

<a href="https://www.buymeacoffee.com/Dalufish"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=Dalufish&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff" /></a>

### 回報問題

目前專案持續維護中，若您使用 Palworld 1.0 專服，建議追蹤 [GitHub Releases](https://github.com/ming065802/palserver-GUI/releases) 與 [CHANGELOG.md](/CHANGELOG.md) 以取得最新 1.0 相容更新。若發現錯誤歡迎到 [issues](https://github.com/ming065802/palserver-GUI/issues) 發表。

### 特別感謝

有大家才有現在的工具可以使用，非常感謝大家。
https://dalufishes-team.gitbook.io/palserver-gui/gei-yu-zhi-chi/te-bie-gan-xie-ming-dan

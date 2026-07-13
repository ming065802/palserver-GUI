# palserver-GUI 文件

本目錄存放專案規劃與實作指引，供後續維護者與 AI 助手參考。

## 文件索引

| 文件 | 說明 |
|------|------|
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Palworld 1.0 **已知問題**：SAV 同步、Mod 檢查、帕魯資料；含情境說明與暫時因應 |
| [ROADMAP_P3_FEATURES.md](./ROADMAP_P3_FEATURES.md) | P3 待實作功能規劃：**遠端伺服器管理**、**Mod 1.0 相容檢查**、**設定產生器整合** |
| [PLAN_P3_REMOTE_TIER1.md](./PLAN_P3_REMOTE_TIER1.md) | 功能 1 Tier 1 **實作計畫**：遠端 REST 管理（6 Phase、5 PR、驗收與測試） |

## 版本對照

- **v1.2.1**（已發布）：1.2.0 後修補（CrossplayPlatforms INI、版本檢查、開發建置）
- **v1.2.0**：Palworld 1.0 對齊（P0 + P1 + P2）
- **P3**（本文件）：v1.2.x 小版本或 v2.0.0 候選功能，尚未實作

## 給 AI / 新貢獻者的提示

1. 實作任一 P3 功能前，請先閱讀對應章節的「目標」「非目標」「驗收條件」。
2. 各功能可獨立開 PR；建議優先順序見 `ROADMAP_P3_FEATURES.md` 文末。
3. 修改 REST/RCON 連線邏輯時，注意本機與遠端實例分支（`isRemote`）。

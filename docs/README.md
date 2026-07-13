# palserver-GUI 文件

本目錄存放專案規劃與實作指引，供後續維護者與 AI 助手參考。

## 文件索引

| 文件 | 說明 |
|------|------|
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Palworld 1.0 **已知問題**：SAV 同步、Mod 檢查、帕魯資料；含情境說明與暫時因應 |
| [ROADMAP_P3_FEATURES.md](./ROADMAP_P3_FEATURES.md) | P3 功能規劃與實作狀態：**遠端管理**、**Mod 檢查**、**設定產生器** |
| [PLAN_P3_REMOTE_TIER1.md](./PLAN_P3_REMOTE_TIER1.md) | 功能 1 Tier 1 **實作計畫**：遠端 REST 管理（6 Phase、5 PR、驗收與測試） |
| [PLAN_P3_REMOTE_TIER2.md](./PLAN_P3_REMOTE_TIER2.md) | 功能 1 Tier 2 **實作計畫**：遠端線上地圖、REST 設定唯讀、Unban UX（4 Phase、4 PR） |
| [WINDOWS_E2E_TEST_CHECKLIST.md](./WINDOWS_E2E_TEST_CHECKLIST.md) | Windows 手動 E2E 測試清單（含 v1.3.3 遠端 Tier 1 完整驗收） |

## 版本對照

| 版本 | 狀態 | 重點 |
|------|------|------|
| **v1.3.3** | 已發布 | 遠端伺服器 REST 管理 Tier 1 完整交付（Phase 1–6）；文件與 E2E 清單 |
| **v1.3.2** | 已發布 | 遠端 Online 狀態輪詢、封禁名單限制說明 |
| **v1.3.1** | 已發布 | 遠端 UI gating、編輯遠端連線 |
| **v1.3.0** | 已發布 | 遠端連線建立、REST 測試、列表 badge |
| **v1.2.1** | 已發布 | CrossplayPlatforms INI、版本檢查、已知問題文件 |
| **v1.2.0** | 已發布 | Palworld 1.0 本機專服對齊 |
| **v1.4.x 後續** | 規劃中 | Mod 相容檢查、設定產生器；遠端 Tier 2 |

## 給 AI / 新貢獻者的提示

1. 實作 P3 剩餘功能前，請先閱讀 `ROADMAP_P3_FEATURES.md` 對應章節的「目標」「非目標」「驗收條件」。
2. 修改 REST/RCON 連線邏輯時，注意本機與遠端實例分支（`isRemote`）。
3. v1.3.3 遠端 Tier 1 已完整交付；遠端實例依 `isRemote` 隱藏本機專用 UI，並以 REST 輪詢顯示 Online 狀態。

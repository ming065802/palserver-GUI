# palserver-GUI 文件

本目錄存放專案規劃與實作指引，供後續維護者與 AI 助手參考。

## 文件索引

| 文件 | 說明 |
|------|------|
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Palworld 1.0 **已知問題**：SAV 同步、Mod 檢查、帕魯資料；含情境說明與暫時因應 |
| [ROADMAP_P3_FEATURES.md](./ROADMAP_P3_FEATURES.md) | P3 功能規劃與實作狀態：**遠端管理**、**Mod 檢查**、**設定產生器** |
| [WINDOWS_E2E_TEST_CHECKLIST.md](./WINDOWS_E2E_TEST_CHECKLIST.md) | Windows 手動 E2E 測試清單（含 v1.3.0 遠端連接） |

## 版本對照

| 版本 | 狀態 | 重點 |
|------|------|------|
| **v1.3.0** | 已發布 | 遠端伺服器 REST 管理 Tier 1（Phase 1–3）；Mod 檢查、設定匯入仍規劃中 |
| **v1.2.1** | 已發布 | CrossplayPlatforms INI、版本檢查、已知問題文件 |
| **v1.2.0** | 已發布 | Palworld 1.0 本機專服對齊 |
| **v1.3.x 後續** | 規劃中 | 遠端 UI gating（Phase 4）、Mod 相容檢查、設定產生器 |

## 給 AI / 新貢獻者的提示

1. 實作 P3 剩餘功能前，請先閱讀 `ROADMAP_P3_FEATURES.md` 對應章節的「目標」「非目標」「驗收條件」。
2. 修改 REST/RCON 連線邏輯時，注意本機與遠端實例分支（`isRemote`）。
3. v1.3.0 遠端實例可 REST 管理，但部分本機 UI 尚未依 `isRemote` 隱藏（Phase 4）。

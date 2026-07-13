# Changelog

All notable changes to **palserver-GUI** are documented in this file.

## [Unreleased]

### Added

- **本機 Management API（方案 A）**：設定頁可啟用 HTTP API（預設關閉、埠 `3435`、`127.0.0.1`），支援本機實例的狀態查詢、啟動、關閉、重啟；遠端實例僅支援狀態與關閉，啟動／重啟回傳 `501`
- 端點：`GET /api/health`、`GET /api/servers`、`GET /api/servers/:id/status`、`POST .../start|stop|restart`
- API 金鑰認證（`Authorization: Bearer` 或 `X-API-Key`）；綁定非本機位址時自動產生金鑰

---

## [1.4.1] — 2026-07-13

Palworld 1.0 **remote server management** Tier 2 — integration tests and binary release.

### Added

- `src/__tests__/remoteTier2Integration.test.js`：Tier 2 端對端整合測試（線上地圖 proxy、REST 設定唯讀、手動解封、錯誤處理）

### Changed

- 版本號更新為 `1.4.1`（`src/constant/app.ts`、`release/app/package.json`）
- README（中／英）安裝連結更新為 `1.4.1`；上一版指向 `v1.3.3`
- `docs/KNOWN_ISSUES.md` 基準版本更新為 v1.4.1
- `docs/README.md` 版本對照表新增 v1.4.1

### Notes (v1.4.1)

- 此為 **v1.4.0 Tier 2 功能的首個二進位發布**（v1.4.0 僅原始碼與文件發布，未上傳安裝包）
- 全測試套件 69 項通過（含 Tier 1／Tier 2 整合測試）

---

## [1.4.0] — 2026-07-13

Palworld 1.0 **remote server management** Tier 2 Phase 4 — documentation and release.

### Added

- README（中／英）新增 **遠端 Tier 2** 章節：線上地圖、世界設定唯讀、手動解封與仍不支援項目
- `docs/WINDOWS_E2E_TEST_CHECKLIST.md` 新增 §2B 遠端 Tier 2 驗收項目（地圖、唯讀設定、手動 unban）

### Changed

- 版本號更新為 `1.4.0`（`src/constant/app.ts`、`release/app/package.json`）
- `docs/ROADMAP_P3_FEATURES.md`：功能 1 Tier 2（Phase 1–4）標記為已交付
- `docs/KNOWN_ISSUES.md` 基準版本更新為 v1.4.0；遠端限制章節對齊 Tier 2 能力
- `docs/PLAN_P3_REMOTE_TIER2.md` 狀態更新為已交付

### Tier 2 交付摘要（v1.4.0）

| Phase | 內容 |
|-------|------|
| 1 | 遠端線上地圖（解除 UI gating、新連線預設啟用、編輯連線開關） |
| 2 | 遠端世界設定唯讀（`GET /v1/api/settings`、60s 快取、重新整理） |
| 3 | 遠端手動解除封禁（`RemoteUnbanPanel`、`POST /unban`） |
| 4 | 文件、E2E 清單、發布 |

### Known limitations (v1.4.0)

- 遠端仍無法從 GUI **列舉**遠端 `banlist.txt`（需 Tier 3 SSH/SFTP 或官方 REST）
- 遠端世界設定為**唯讀**；修改須於遠端主機編輯 INI 並重啟
- Mod 管理、日誌、Steam 更新、程序啟停仍僅適用本機實例

---

## [1.3.3] — 2026-07-13

Palworld 1.0 **remote server management** Tier 1 Phase 6 — documentation and release.

### Added

- README（中／英）新增完整 **遠端伺服器管理** 章節：建立連線、支援／不支援功能、埠與安全說明
- `docs/WINDOWS_E2E_TEST_CHECKLIST.md` 補齊 Phase 4–5 遠端驗收項目（UI 隱藏、Online 狀態、封禁名單限制、編輯連線）

### Changed

- 版本號更新為 `1.3.3`（`src/constant/app.ts`、`release/app/package.json`）
- `docs/ROADMAP_P3_FEATURES.md`：功能 1 Tier 1（Phase 1–6）標記為已交付
- `docs/KNOWN_ISSUES.md` 基準版本更新為 v1.3.3

### Tier 1 交付摘要（v1.3.0 → v1.3.3）

| Phase | 內容 |
|-------|------|
| 1–3（v1.3.0） | 遠端連線解析、建立 UI、REST 測試、列表 badge |
| 4（v1.3.1） | `isRemote` UI gating、編輯遠端連線 |
| 5（v1.3.2） | REST 輪詢 Online 狀態、封禁名單限制說明 |
| 6（v1.3.3） | 文件、E2E 清單、發布 |

### Known limitations (v1.3.3)

- 遠端封禁名單仍無法從 GUI 讀取遠端 `banlist.txt`（需 Tier 2 SSH/SFTP 或官方 REST）
- 線上地圖 proxy 仍僅支援本機實例

---

## [1.3.2] — 2026-07-13

Palworld 1.0 **remote server management** Tier 1 Phase 5 — status display and edge cases.

### Added

- `useServerOnlineStatus` hook：遠端實例每 30 秒輪詢 REST `/info` 判斷 Online/Offline
- 遠端玩家頁面顯示封禁名單限制說明（`RemoteBanListNotAvailable`）
- i18n：`RemoteBanListNotAvailable`（五語系）

### Changed

- `ServerRunningBadge`：遠端實例改依 REST 連線狀態顯示，不再依本機程序
- `getServerBanList`：遠端實例回傳 `{ bans: [], remoteLimited: true }`，避免讀取不存在的本機 `banlist.txt`
- `OnlineMap`：遠端實例不渲染 iframe（防禦性處理）
- `preload.ts`：`SERVER_PALGUARD_VERSION` / `SERVER_UE4SS_VERSION` 對遠端實例 skip
- `sendRCONCommand`：失敗時回傳 `null`，不再吞掉錯誤

### Known limitations (v1.3.2)

- 遠端封禁名單仍無法從 GUI 讀取遠端 `banlist.txt`（需 Tier 2 SSH/SFTP 或官方 REST）
- 線上地圖 proxy 仍僅支援本機實例

---

## [1.3.1] — 2026-07-13

Palworld 1.0 **remote server management** Tier 1 Phase 4 — UI gating (`isRemote`).

### Added

- `useIsRemote` hook：依選中實例判斷是否為遠端連線
- IPC：`editRemoteServerInstance` — 編輯遠端連線參數（`remote-settings.json` 與 `.pal` metadata）
- `RemoteUnsupportedGuard`：世界設定、Mod 管理頁面路由保護
- i18n：`RemoteFeatureNotSupported`、`RemoteEndpoint`、`EditRemoteServer`（五語系）

### Changed

- 遠端實例隱藏本機專用 UI：啟動/停止、世界設定、Mod 管理、伺服器日誌、線上地圖、效能監控、伺服器設定（Steam 更新等）
- 右側 `ServerPreview` 顯示遠端 `host:port`
- 首頁右鍵選單隱藏資料夾、複製、大小；保留編輯遠端連線與刪除
- `EngineNeedInstall` 與 `updateServerInstance` 跳過遠端實例

### Known limitations (v1.3.1)

- ~~遠端 `ServerRunningBadge` 仍依本機程序狀態（Phase 5）~~ → **v1.3.2 Phase 5 已實作**
- ~~遠端封禁列表仍讀不到本機 `banlist.txt`（Phase 5）~~ → **v1.3.2 已顯示限制說明**

---

## [1.3.0] — 2026-07-13

Palworld 1.0 **remote server management** (P3 Feature 1 Tier 1, Phases 1–3).

### Added

- **遠端伺服器連接**：首頁右鍵「建立遠端連接」，可連線至 VPS／遠端主機上已運行的 1.0 專服
- 建立前 **REST 連線測試**（`GET /v1/api/info`），失敗時顯示明確錯誤（埠不通、密碼錯、REST 未啟用）
- 遠端實例列表 **「遠端」badge** 標記
- `getAdminConnectionConfig` / `resolveAdminConnectionConfig`：本機與遠端 admin host 解析
- `remote-settings.json` 讀寫與 `RemoteSettings` 型別
- IPC：`testRemoteConnection`、`createRemoteServerInstance`
- 單元與整合測試（admin 連線解析、遠端建立流程、mock REST）

### Changed

- `ServerInstanceSetting` 新增 `isRemote`、`remoteHost`、`remoteRestPort`、`remoteRconPort`
- `getWorldSettingsByServerId` 對遠端實例讀取 `remote-settings.json`
- REST/RCON、自動重啟、線上地圖 proxy 改為參數化 host（不再硬編碼 `127.0.0.1`）
- 遠端實例：`execStartServer` 不 spawn 本機程序；`execShutdownServer` 改走 REST；不可複製遠端實例

### Known limitations (v1.3.0)

- ~~遠端 Tier 1 **尚未**隱藏啟動按鈕、世界設定、Mod 管理等本機專用 UI（計畫 v1.3.1 / Phase 4）~~ → **v1.3.1 Phase 4 已實作**
- 遠端**不支援**：Steam 更新、Mod 管理、日誌、備份、世界設定 INI 編輯、線上地圖 proxy
- P3 功能 2（Mod 相容檢查）、功能 5（設定匯入／匯出）仍規劃中，見 `docs/ROADMAP_P3_FEATURES.md`

---

## [1.2.1] — 2026-07-13

Patch release after v1.2.0 with INI write fixes, version-check hardening, and documentation.

### Added

- `docs/KNOWN_ISSUES.md` — Palworld 1.0 known issues (SAV sync, mod checks, Pal data) with workarounds
- Unit tests for `worldSettingsIni` round-trip and `resolveLatestVersion`
- Windows E2E manual test checklist (`docs/WINDOWS_E2E_TEST_CHECKLIST.md`)

### Changed

- `writeWorldSettingsini` writes converter output directly, avoiding regex post-processing that corrupted `CrossplayPlatforms` tuples
- Remote version API responses below Palworld 1.0 baseline are ignored in favor of bundled `LATEST_GAME_VERSION` / `VERSION`
- Webpack dev DLL excludes `firebase` subpath-only exports; `release/app` dependencies read safely for lint

### Fixed

- `CrossplayPlatforms` INI corruption when saving world settings from GUI
- `autoUpdater` semver crash in unpackaged dev builds
- Stale `palservergui.net` version data causing incorrect engine update checks
- Dead code in `App.tsx` / `PakMods.tsx`; `Version.tsx` image event handler types
- `devEngines` schema compatibility with npm 10.9+

---

## [1.2.0] — 2026-07-13

Palworld **1.0** alignment release.

### Added

- Palworld **1.0** world settings in GUI: crossplay, proximity voice chat, ranch speed, guild master transfer, PvP drop/map options, difficulty, and more
- REST API admin layer for kick, ban, announce, save, shutdown, and server info
- Auto-restart and crash-restart controls in Server Settings (REST API first, RCON fallback)
- Unit tests for `palServerSettingConverter` and `versionToValue`
- README / changelog documentation for Palworld 1.0 server management

### Changed

- New servers default to `CrossplayPlatforms=(Steam,Xbox,PS5,Mac)`, `RCONPort=25575`, `RESTAPIPort=8212`
- New servers use 1.0 world defaults: 1h egg hatch, `DeathPenalty=Item`, map spawn off
- Player kick/ban and broadcasts prefer REST API over deprecated RCON
- Save migration guide now recommends `palworld-save-tools==0.24.0`
- Engine version tracking uses proper four-part version comparison

### Fixed

- Palguard template was incorrectly loading UE4SS when missing
- `palServerSettingConverter` broke on `CrossplayPlatforms` tuples and quoted server names
- Duplicate `PlayerAutoHPRegeneRate` key in world settings UI

---

## [1.1.0] — 2024

### Highlights

- Visual editor for `PalWorldSettings.ini`
- One-click dedicated server install via SteamCMD (App ID 2394010)
- Online player list, real-time map, mod management (UE4SS / Palguard)
- Multi-save management, server backup, performance tuning
- RCON and REST API integration

---

## Earlier versions

See [GitHub Releases](https://github.com/Dalufishe/palserver-GUI/releases) for older builds.

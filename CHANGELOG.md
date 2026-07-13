# Changelog

All notable changes to **palserver-GUI** are documented in this file.

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

- 遠端 Tier 1 **尚未**隱藏啟動按鈕、世界設定、Mod 管理等本機專用 UI（計畫 v1.3.1 / Phase 4）
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

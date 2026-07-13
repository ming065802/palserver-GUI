# Changelog

All notable changes to **palserver-GUI** are documented in this file.

## [Unreleased]

### Added

- P3 remote Tier 1 Phase 1: `getAdminConnectionConfig` / `resolveAdminConnectionConfig` for local vs remote admin host resolution
- `remote-settings.json` read/write services and `RemoteSettings` type
- P3 remote Tier 1 Phase 2: `testRemoteConnection` and `createRemoteServerInstance` IPC handlers
- Remote instance guards for local spawn, duplicate, and shutdown flows
- Unit tests for admin connection config, REST admin config, and remote connection helpers

### Changed

- `ServerInstanceSetting` extended with optional `isRemote`, `remoteHost`, `remoteRestPort`, `remoteRconPort`
- `getWorldSettingsByServerId` reads `remote-settings.json` for remote instances
- REST/RCON IPC, `restAdmin`, exec shutdown/restart, and online map proxy use parameterized host instead of hardcoded `127.0.0.1`

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

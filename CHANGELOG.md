# Changelog

All notable changes to **palserver-GUI** are documented in this file.

## [Unreleased] — Palworld 1.0 alignment

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

# 發布指南（palserver-GUI）

> **適用讀者**：維護者、發布負責人、AI 助手  
> **最後更新**：2026-07-13  
> **基準版本**：v1.5.0

本文件說明如何將 palserver-GUI 打包為 Windows 安裝包與免安裝版，並上傳至 [GitHub Releases](https://github.com/ming065802/palserver-GUI/releases)。

---

## 產物說明

| 檔案 | 說明 |
|------|------|
| `{version}-palserver-gui.exe` | NSIS 一鍵安裝包（Windows **x64**） |
| `unpack-{version}-palserver-gui.zip` | 免安裝版；解壓後執行 `win-unpacked/palserver-gui.exe` |

> **注意**：目前僅打包 **Windows 64 位元（x64）**，不包含 32 位元 ia32/x86。

版本號來源：`release/app/package.json`（需與 `src/constant/app.ts` 的 `VERSION` 一致）。

---

## 推薦流程：GitHub Actions（Windows）

合併發布 PR 至 `main` 後，推送 **annotated tag** 即可觸發自動打包與上傳 Release。

### 1. 發布前檢查清單

- [ ] 更新 `src/constant/app.ts` → `VERSION`
- [ ] 更新 `release/app/package.json` 與 `release/app/package-lock.json` → `version`
- [ ] 更新 `CHANGELOG.md`（新增版本區塊）
- [ ] 更新 `README.md` / `README_EN.md`（RELEASE badge、安裝連結、上一版連結）
- [ ] 視需要更新 `docs/KNOWN_ISSUES.md`、`docs/README.md`、`docs/WINDOWS_E2E_TEST_CHECKLIST.md` 基準版本
- [ ] 本地或 CI 測試通過：`npm run build && npm test`

### 2. 合併 PR 並打 tag

```bash
git checkout main
git pull origin main

# tag 必須與 release/app/package.json 的 version 對應（加 v 前綴）
git tag -a v1.5.0 -m "release: v1.5.0"
git push origin v1.5.0
```

### 3. 自動化行為

推送 `v*` tag 後，[`.github/workflows/release.yml`](../.github/workflows/release.yml) 會：

1. 在 `windows-latest` 執行 `npm ci`
2. `npm run build` → `npm test`（含 Management API 單元與整合測試）
3. `electron-builder build --win --publish never` → 產生 NSIS 安裝包
4. 將 `release/build/win-unpacked/` 壓縮為 `unpack-{version}-palserver-gui.zip`
5. 上傳兩個檔案至對應的 GitHub Release

Workflow 會驗證 **tag 與 `release/app/package.json` 的 version 一致**；不一致則失敗。

### 4. 手動重跑（可選）

於 GitHub → Actions → **Release** → **Run workflow**，輸入已存在的 tag（例如 `v1.5.0`）可重新打包並覆蓋上傳該 Release 的資產。

---

## 手動打包

### 方式 A：Windows 本機（推薦）

```bash
npm ci
npm run build
npm test
npx electron-builder build --win --publish never
```

於 `release/build/` 手動建立免安裝 zip（PowerShell）：

```powershell
$version = (Get-Content release/app/package.json | ConvertFrom-Json).version
Compress-Archive -Path "release/build/win-unpacked" -DestinationPath "release/build/unpack-$version-palserver-gui.zip"
```

或使用專案腳本（會產生安裝包，但仍需手動壓 zip）：

```bash
npm run package
```

### 方式 B：Linux 交叉打包（備援）

僅在無 Windows 環境時使用。NSIS 安裝包需要 **Wine**：

```bash
# Debian/Ubuntu 前置
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install -y wine wine64 wine32:i386

npm ci
npm run build
npm test
WINEARCH=win64 npx electron-builder build --win --publish never

cd release/build
zip -r "unpack-$(node -p "require('../app/package.json').version")-palserver-gui.zip" win-unpacked
```

若 NSIS 失敗（`kernel32.dll` / `wine32` 錯誤），刪除 `~/.wine` 後以 `WINEARCH=win64` 重試。

---

## 上傳 GitHub Release（手動時）

若未使用 CI，可用 GitHub CLI：

```bash
VERSION=$(node -p "require('./release/app/package.json').version")

gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes-file CHANGELOG_SNIPPET.md \
  "release/build/${VERSION}-palserver-gui.exe" \
  "release/build/unpack-${VERSION}-palserver-gui.zip"
```

`CHANGELOG_SNIPPET.md` 可從 `CHANGELOG.md` 對應版本區塊複製。

---

## 常見問題

### Q: v1.4.0 為何沒有安裝包？

v1.4.0 僅完成原始碼與文件發布，當時未在已配置好的環境完成 Windows 打包與上傳。v1.4.1 起建議一律透過本文件流程或 GitHub Actions 發布二進位。

### Q: `npm test` 失敗「main/renderer process is not built」

測試前需先建置：

```bash
npm run build && npm test
```

### Q: 免安裝 zip 目錄結構

zip 根目錄應包含 **`win-unpacked/`** 資料夾（與 v1.3.3／v1.4.1 既有 Release 一致），而非直接壓縮資料夾內檔案。

### Q: Mac / Linux 桌面版

`package.json` 的 `build.mac` / `build.linux` 已設定，但目前發布流程僅自動化 **Windows x64**。其他平台需另行手動打包。

---

## 相關文件

| 文件 | 說明 |
|------|------|
| [CHANGELOG.md](../CHANGELOG.md) | 版本變更紀錄 |
| [WINDOWS_E2E_TEST_CHECKLIST.md](./WINDOWS_E2E_TEST_CHECKLIST.md) | 發布後 Windows 手動驗收 |
| [README.md](../README.md) | 使用者下載連結（發布時需同步更新） |

---

## 修訂紀錄

| 日期 | 說明 |
|------|------|
| 2026-07-13 | 初版：發布檢查清單、GitHub Actions、手動／Linux 備援流程 |
| 2026-07-13 | CI workflow（`ci.yml`）與 Management API 測試驗證步驟 |

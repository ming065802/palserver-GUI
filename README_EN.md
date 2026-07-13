# palserver GUI

![RELEASE](https://img.shields.io/badge/RELEASE-1.4.2-green)
[![Website](https://img.shields.io/badge/website-click-blue)](https://dalufishes-team.gitbook.io/palserver-gui-en)
[![Discord](https://img.shields.io/badge/discord-click-blue)](https://discord.gg/sgMMdUZd3V)
![Make With Love](https://img.shields.io/badge/make_with_%E2%9D%A4%EF%B8%8F-white)

#### [繁體中文](/README.md) / [English](/README_EN.md)

> Join our Discord for more infomation - https://discord.gg/sgMMdUZd3V

Palserver GUI is a dedicated server setup and management tool with a fully graphical interface:

- **Easy to use**：Easy to get started, with a foolproof installation and one-click server start.
- **Fully Graphical Interface**：Provides a complete and powerful GUI for adjusting world settings, server settings, and more.
- **Powerful Feature Extensions**：Includes built-in UE4SS and Palguard, player list, online maps, multiple save management, and mod management, significantly enhancing server management efficiency and player experience.
- **Palworld 1.0 support**: crossplay settings, voice chat, REST API admin, auto-restart, and 1.0 world parameters.
- **Remote server management (v1.4.0)**: connect to Palworld 1.0 dedicated servers already running on a VPS or remote host via REST API; Tier 1 day-to-day admin plus Tier 2 online map, read-only settings, and manual unban.

---

### Palworld 1.0 dedicated server support

palserver-GUI helps manage **Palworld 1.0** (full release, July 10, 2026) dedicated servers:

| Feature | Description |
|---------|-------------|
| **Crossplay** | Configure `CrossplayPlatforms` (Steam / Xbox / PS5 / Mac) in GUI |
| **REST API** | Recommended admin: player list, kick, ban, broadcast, scheduled restart |
| **1.0 world settings** | Voice chat, ranch speed, guild master transfer, PvP drops, and more |
| **Auto-restart** | Recommended every 6–12 hours on 1.0 servers to reduce memory pressure |
| **One-click update** | Update dedicated server binaries to 1.0 via SteamCMD |
| **Remote connection (v1.4.0)** | Create a remote link from the home context menu; online map, read-only world settings, manual unban |

---

### Remote server management (Tier 1)

v1.3.3 completes **remote server management Tier 1** (Phases 1–6). The GUI connects to Palworld 1.0 dedicated servers already running on a VPS or remote host and performs day-to-day admin via the official REST API—no local process spawn or `server/` directory copy.

#### Create a remote connection

1. **Right-click** on the home page or an instance → **Remote Connection**
2. Enter **name**, **host IP/domain**, **REST port** (default `8212`), and **admin password**
3. Click **Test Connection**; when successful, click **Create**
4. The list shows a **Remote** badge; the preview panel shows `host:port`

#### Supported on remote instances

| Feature | Notes |
|---------|-------|
| Player list | Shows online players on the remote server |
| Kick / ban / unban | Via REST |
| Broadcast | Server-wide announcement |
| Manual save | REST save |
| Shutdown | REST shutdown |
| Edit connection | Right-click → Edit remote connection (host, port, password) |
| Online status | Polls REST `/info` every 30s (Online / Offline) |

#### Not supported on remote instances (local only)

| Feature | Reason |
|---------|--------|
| Start / stop process | Remote process must be managed on the remote host |
| Steam one-click update | No local `server/` directory |
| World INI editing | Tier 2 provides REST read-only view only; edit INI on the remote host |
| Mod management | No remote file access |
| Server logs | No remote process stdout |
| Performance monitor | Local process only |
| Duplicate instance | Remote links are metadata-only |
| Ban list file | Cannot enumerate remote `banlist.txt`; ban online players via REST or unban by known UserId |

#### Remote management requirements

- Remote server must have `RESTAPIEnabled=True` and `AdminPassword` set
- Port **`8212/TCP`** must be reachable from the PC running this GUI (configure firewall / port forwarding yourself)
- REST uses **plain HTTP + Basic Auth**; do not expose the admin password on untrusted networks
- **`25575/TCP` (RCON)** is optional advanced use; exposing it publicly is a security risk and only needed for some Palguard commands
- If remote REST binds only to `127.0.0.1`, it is unreachable from outside; configure the remote host or reverse proxy accordingly

**Port reference:**

- `8211/UDP` — game port (required)
- `8212/TCP` — REST API (recommended)
- `27015/UDP` — community server browser (console players)
- `25575/TCP` — RCON (deprecated; Palguard advanced commands only)

**1.0 update checklist:**

1. Back up `Pal/Saved/SaveGames`
2. Use GUI one-click update for the dedicated server engine
3. Disable mods first; re-enable only after confirming stability
4. Old saves may work, but a fresh world is recommended for best experience

---

### Remote server management (Tier 2)

v1.4.0 completes **remote server management Tier 2** (Phases 1–4). On top of Tier 1 REST admin, the following works **without SSH/SFTP**:

#### Tier 2 capabilities

| Feature | Notes |
|---------|-------|
| Online map | Server Management → Online Map; local proxy forwards remote REST `/players` and `/info` |
| World settings (read-only) | Right panel “World Settings” or route; data from `GET /v1/api/settings` with refresh |
| Manual unban | On the Players tab, enter a known Steam ID and call `POST /v1/api/unban` |

#### Usage notes

- **New remote connections** enable the online map by default; for existing links, use **Edit remote connection** on the home context menu
- The remote world settings page shows a read-only banner; **no Save button**—edit `PalWorldSettings.ini` on the remote host and restart
- The ban list still cannot enumerate remote `banlist.txt`; use the manual unban panel when you know the banned UserId

#### Still not supported in Tier 2 (planned for Tier 3)

| Feature | Reason |
|---------|--------|
| Remote INI write | Official REST has no settings write endpoint |
| Full ban list enumeration | Official REST has no ban list GET |
| SSH/SFTP file access | Logs, backups, mods require Tier 3 |

---

### One-Click Server Start

After installation is complete, create your server and click "Start" in the bottom right corner to successfully set up your first server.

> See [official GitBook docs](https://dalufishes-team.gitbook.io/palserver-gui-en) for screenshots.

### Visual World Settings Options

Adjust world settings using sliders and input boxes without the need to modify the original file PalWorldSettings.ini:

> Includes 1.0 options such as crossplay, voice chat, and ranch speed.

### Online Player List

Displays information about online players and provides various functions for the host to manage player actions.

<!-- screenshots in GitBook -->

### Real-Time Player Map

Displays players' levels, coordinates, and positions on the map in real-time.

<!-- screenshots in GitBook -->

### Mod Management and Export to the Game

UE4SS and Palguard are installed by default. The mod management panel allows for one-click packaging to the client!

<!-- screenshots in GitBook -->

### One-Click Update, One-Click Optimization, and More!

In addition, there are more server settings and features to fine-tune your server for the best gaming experience!

---

### Installation Links and Updates

Installation Package (Recommended): [Click here to download](https://github.com/ming065802/palserver-GUI/releases/download/v1.4.2/1.4.2-palserver-gui.exe)

Portable Version (No installation required): [Click here to download](https://github.com/ming065802/palserver-GUI/releases/download/v1.4.2/unpack-1.4.2-palserver-gui.zip)

Previous v1.4.1: [installer](https://github.com/ming065802/palserver-GUI/releases/download/v1.4.1/1.4.1-palserver-gui.exe) / [portable](https://github.com/ming065802/palserver-GUI/releases/download/v1.4.1/unpack-1.4.1-palserver-gui.zip)

### FAQs

- Unable to access server using VPN: [Click here](https://dalufishes-team.gitbook.io/palserver-gui/faq/shi-yong-vpn-reng-wu-fa-jin-ru-si-fu-qi)
- Server cannot start:[Click here](https://dalufishes-team.gitbook.io/palserver-gui/faq/si-fu-qi-wu-fa-qi-dong)
- Server crashes frequently:[Click here](https://dalufishes-team.gitbook.io/palserver-gui/faq/si-fu-qi-bin-fan-beng-kui)
- Online players not displayed:[Click here](https://dalufishes-team.gitbook.io/palserver-gui/faq/mei-you-xian-shi-zai-xian-wan-jia)
- How to migrate test version GUI files to the official version: [Click here](https://dalufishes-team.gitbook.io/palserver-gui/faq/ce-shi-ban-ben-gui-dang-an-qian-yi-dao-zheng-shi-ban)

**Palworld 1.0:**

- Updating to 1.0: use one-click update in GUI; back up saves first
- Crossplay: enable `CrossplayPlatforms`; console players need "Open to community" and port `27015/UDP`
- Steam players: use Direct Connect at `your-ip:8211`
- Save migration: use `palworld-save-tools==0.24.0`; back up before migrating to 1.0
- Mods: test without mods after updating, then re-enable one by one
- **Remote connection (v1.4.1)**: home right-click → Create Remote Connection → enter host IP, REST port `8212`, admin password → test connection, then create; see the Remote server management section above and [CHANGELOG.md](/CHANGELOG.md)

See [CHANGELOG.md](/CHANGELOG.md) for full release notes.

### Related links:

- Discord： [Click here](https://discord.gg/sgMMdUZd3V)
- Official documentation: [Click here](https://dalufishes-team.gitbook.io/palserver-gui)
- Gamers' forums：[Click here](https://forum.gamer.com.tw/C.php?bsn=71458&snA=2043)
- Yahoo game news：[Click here](https://tw.news.yahoo.com/palserver-gui-041354287.html)
- FANPIECE：[Click here](https://gank.fanpiece.com/animeradio/%E5%8F%B0%E7%81%A3%E5%A4%A7%E7%A5%9E%E5%89%B5-%E5%B9%BB%E7%8D%B8%E5%B8%95%E9%AD%AF-%E4%B8%80%E9%8D%B5%E9%96%8B%E8%A8%AD%E4%BC%BA%E6%9C%8D%E5%99%A8-%E5%B7%A5%E5%85%B7-%E5%85%A7%E5%BB%BA%E7%B9%81%E4%B8%AD-%E5%9C%96%E5%83%8FUI-c1452714.html)
- KK3C：[Click here](https://kkplay3c.net/steam-pal-server-gui/)
- 夢遊電玩：[Click here](https://www.game735.com/forum.php?mod=viewthread&tid=388027&extra=page%3D1&ordertype=1)

### Related videos:

- 捷克PXJ Introduction Video：[Click here](https://youtu.be/8Vq7uANT0Eo?si=-nH9lkUpsk7DgMW8)

<a href="https://youtu.be/8Vq7uANT0Eo?si=-nH9lkUpsk7DgMW8" target="_blank">
<img src="https://i.ytimg.com/vi_webp/8Vq7uANT0Eo/maxresdefault.webp"/>
</a>

### Terms

The code is provided solely for educational purposes. Redistribution or resale of the software after repackaging is strictly prohibited. Commercial use is also prohibited.

### Contribution

Currently, palserver GUI is my solo project developed using Typescript + React + Electron. If you're interested in contributing to the project (whether in software design, artwork, translation, or programming), feel free to contact me on Discord (username: dalufish) to discuss!

### Support me

If you find the tool helpful, please consider giving the project a star. Thank you!
You can also support me with a cup of coffee on [buymeacoffee](https://www.buymeacoffee.com/dalufish) which encourages me to continue creating. Much appreciated.

<a href="https://www.buymeacoffee.com/Dalufish"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=Dalufish&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff" /></a>

### Roadmap

v1.4.2 adds **daily scheduled stop/start/restart** and a **local Management API**; v1.4.1 was the first binary release with remote Tier 2. Upcoming work (Tier 3 SSH/SFTP, mod compatibility gate, settings import/export) is in [docs/ROADMAP_P3_FEATURES.md](/docs/ROADMAP_P3_FEATURES.md).  
Palworld 1.0 **known issues** (SAV sync, mod checks, Pal data) are in [docs/KNOWN_ISSUES.md](/docs/KNOWN_ISSUES.md).

### Report issues

The project is actively maintained. For Palworld 1.0 dedicated servers, follow [GitHub Releases](https://github.com/ming065802/palserver-GUI/releases) and [CHANGELOG.md](/CHANGELOG.md). Please report issues on [issues](https://github.com/ming065802/palserver-GUI/issues).

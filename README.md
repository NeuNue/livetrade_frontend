# 🌸 納指自習室 · 虚拟盘 Web

「纳指自习室」B站直播虚拟美股交易游戏的官方前端 —— 排行榜 / 操作动态 / 个人战绩。
**简约风格**：白底卡片 + 樱花粉点缀，干净克制的排版，无冗余动画。

| 入口 | 说明 |
|---|---|
| `/` | 首页：资产排行榜（前三名领奖台）+ 全场合计近期操作动态（每 60s 自动刷新） |
| `/player/:openId` | 个人页：当前持仓（实时盈亏）+ 全部历史操作 + 礼物入账。点击排行榜任意玩家进入 |

> 全部为静态页面，数据是 `public/data/*.json` 快照（由 `../usstock-game/export_web.py` 从 `game.db` 导出）。
> 零后端、零数据库，Vercel 免费托管，GitHub 推送即自动部署。

## ✨ 特性

- 排行榜：现金 + 持仓市值，前三名领奖台，点击任意玩家进入个人页
- 操作动态：全场合计成交 / 拒绝 / 礼物，每 60 秒自动刷新
- 个人页：当前持仓（现价 / 浮动盈亏 / 盈亏率）+ 全部历史操作 + 礼物入账
- 计价统一 `$`，涨绿跌红
- **暗色模式**：右上角 🌙/☀️ 一键切换，记忆选择并跟随系统偏好

---

## 🖼️ 截图

截图见 [`docs/screenshots/`](docs/screenshots)（home-top / home-rank / home-feed / player-top / player-bottom）。

---

## 📦 架构

```
usstock-game/data/game.db（游戏运行中的 SQLite）
        │  export_web.py（CLI 或游戏服务内周期调用）
        ▼
usstock-web/public/data/*.json   ← 排行榜 / 操作流 / 每个用户的个人档案
        │  git push（sync.sh 或手动）
        ▼
GitHub 仓库 → Vercel（检测 Vite 自动构建）→ 静态站点
```

---

## 🚀 本地开发

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 产物 dist/
npm run export       # 手动重新导出数据（读取 ../usstock-game/data/game.db）
```

---

## ☁️ 部署到 Vercel（一次性）

1. **建 GitHub 仓库**：在 github.com 新建一个空仓库（如 `usstock-web`，公开或私有均可，Vercel 免费版私有仓库也可以部署）。

2. **推送本项目**：

   ```bash
   cd "/Users/slein/Project/dsh idea/usstock-web"
   git remote add origin git@github.com:<你的用户名>/usstock-web.git
   git push -u origin main
   ```

3. **Vercel 导入**：打开 [vercel.com/new](https://vercel.com/new) → Import 这个 GitHub 仓库 →
   Framework 选择 **Vite**（Vercel 会自动识别，`buildCommand: npm run build`、`outputDirectory: dist` 已在 `vercel.json` 配好）→ **Deploy**。

   几秒钟后即可访问 `https://<project>.vercel.app`。

   > 页面路由、`/data/*.json` 的缓存策略都已在 `vercel.json` 配好，无需额外设置。

---

## 🔄 日常更新数据

数据更新时间 = 你最后一次把 `public/data/` 推上 GitHub 的时间。

### 方式一：手动一键（推荐）

```bash
cd "/Users/slein/Project/dsh idea/usstock-web"
./sync.sh        # 导出 → 提交 → 推送 → Vercel 自动部署
```

### 方式二：开播时游戏服务自动导出

`usstock-game/main.py` 已内置周期导出任务（默认每 60 秒一次，写入 `usstock-web/public/data`）：

```bash
WEB_EXPORT_INTERVAL=60 python3 main.py    # 环境变量可调间隔
```

自动导出后仍需推送才会上线 —— 配合方式三的定时任务即可全自动。

### 方式三：定时自动同步（crontab）

```bash
crontab -e
# 每 10 分钟：导出 + 推送（GitHub 需已配置免密 SSH key 或凭证）
*/10 * * * * cd "/Users/slein/Project/dsh idea/usstock-web" && ./sync.sh >> /tmp/usstock-web-sync.log 2>&1
```

> macOS 也可用 LaunchAgent 替代 crontab（更推荐）：在 `~/Library/LaunchAgents` 建 plist，
> 每 600 秒执行一次 `sync.sh`。需要示例可参照下方模板或直接询问。

---

## 🧹 常见问题

**排行榜里有 demo 测试用户（小明/老王/新鵺…）？**
旧版本用 `--demo` 跑过会把演示用户写进 `game.db`。想清掉的话（**先备份**）：

```bash
sqlite3 data/game.db "
  DELETE FROM trades WHERE open_id LIKE 'demo_%' OR open_id LIKE 'open_%';
  DELETE FROM recharges WHERE open_id LIKE 'demo_%' OR open_id LIKE 'open_%';
  DELETE FROM positions WHERE open_id LIKE 'demo_%' OR open_id LIKE 'open_%';
  DELETE FROM users WHERE open_id LIKE 'demo_%' OR open_id LIKE 'open_%';
"
```

然后重新 `npm run export`。

**页面显示「数据加载失败」？**
说明 `public/data/` 里还没有 JSON —— 先跑一次 `python3 ../usstock-game/export_web.py`。

**想换配色 / 文案？**
全部样式在 `src/styles.css` 顶部 `:root` 的 CSS 变量里，改色即可全局生效（`--accent` 为主强调色）。

---

## 🧱 技术栈

Vite 5 · React 18 · React Router 6 · 原生 CSS（无 UI 框架）

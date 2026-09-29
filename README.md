# cf-home: Cloudflare Native 个人家庭导航仪表盘

专为 **Cloudflare Pages + Functions + Cloudflare KV** 设计的原生家庭导航面板。完美对齐并升级了原版 `home` 的全套功能体验，具备零信任原生免密、毫秒级全球 CDN 访问、双网络环境智能直达、拼音快速搜索等特性。

---

## ✨ 核心特性

- ⚡ **Cloudflare 边缘极速**：前端基于 Vite + React 静态编译，全球 CDN 直出；后端基于 Cloudflare Pages Functions (Edge API)，低延迟冷启动。
- 🛡️ **Cloudflare Zero Trust 原生免疫**：自动识别 `Cf-Access-Authenticated-User-Email` 与 `Cf-Access-Jwt-Assertion` 鉴权标头，无需在页面手动输入密码。
- 📦 **云端 KV 存储**：分类、卡片与布局数据存储在 Cloudflare KV 全球键值库中，免去本地数据库或文件持久化烦恼。
- 🌐 **双网络环境智能直连 (LAN / WAN)**：
  - 智能感知访客所处网络（局域网 IP vs 公网 IP）；
  - 卡片支持独立配置内网链接（如 `http://192.168.1.100:8096`）与外网域名链接；
  - 卡片右侧提供显式 LAN / WAN 直达按钮，随时随地任意选。
- 🔍 **Command + K 聚光灯拼音搜索**：
  - 支持快捷键 `Cmd+K` 或 `Ctrl+K` 瞬间唤醒；
  - 支持中文全拼、拼音首字母匹配（如输入 `jf` 即可命中 `Jellyfin`）；
  - 键盘上下键切换，回车直达。
- 🖐️ **流畅拖拽重排**：内置 `@dnd-kit`，卡片支持分类内及跨分类拖拽排序，实时云端持久化。
- 🎨 **毛玻璃磨砂视效定制 (Glassmorphism)**：
  - 自定义导航站名称、副标题、站点图标；
  - 自定义壁纸图片直链，可自由滑块调节背景模糊度 (Blur)、暗色遮罩透明度、顶栏透明度、卡片底色透明度；
  - 响应式栅格：支持自定义桌面端显示列数 (1 ~ 8 列)。
- 📸 **版本快照与一键回退**：支持手动创建快照与备注，在还原任何历史版本前系统自动生成安全保护快照。
- 🗑️ **防误删回收站**：分类和卡片删除后自动暂存至回收站，支持随时单项还原或一键清空。
- 💾 **无缝数据迁移**：内置一键导出 / 导入 `home.json` 功能，可直接导入原项目的配置文件。

---

## 🛠️ 本地运行与调试

```bash
# 1. 克隆并进入项目目录
cd cf-home

# 2. 安装依赖 (如果尚未安装)
pnpm install

# 3. 极速开发模式 (内置本地 Mock API 与数据自动载入)
pnpm dev
# 访问 http://localhost:3232

# 4. 模拟 Cloudflare Pages Edge 运行时 (Miniflare + 本地模拟 KV)
pnpm build
pnpm pages:dev
# 访问 http://localhost:8788
```

---

## 🚀 部署到 Cloudflare Pages 指南

### 步骤 1：创建 Cloudflare KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 导航至 **Workers & Pages** -> **KV**；
3. 点击 **Create a Namespace**（创建命名空间），名称填写：`HOME_KV`；
4. 复制生成的 **Namespace ID**。

### 步骤 2：部署到 Cloudflare Pages

你可以选择 **Git 自动化部署**（推荐）或 **命令行直传**：

#### 方案 A：通过 GitHub / Git 仓库连接（推荐）
1. 将当前 `cf-home` 代码提交推送到你的 GitHub 私有/公开仓库；
2. 在 Cloudflare 控制台选择 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**；
3. 构建配置：
   - **Framework preset**: `Vite`
   - **Build command**: `pnpm build` (或 `npm run build`)
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy** 完成首次构建。

#### 方案 B：使用 Wrangler 命令行直接发布
```bash
pnpm build
npx wrangler pages deploy dist --project-name cf-home
```

### 步骤 3：在 Pages 中绑定 KV 命名空间

1. 在 Cloudflare Pages 项目页面中，点击 **Settings** -> **Functions**；
2. 找到 **KV namespace bindings**（KV 命名空间绑定），点击 **Add binding**：
   - **Variable name（变量名称）**：务必填写为 `HOME_KV`
   - **KV namespace（选择命名空间）**：选择在步骤 1 中创建的 `HOME_KV`
3. 保存后重新触发一次 Deploy，或者下一次部署时自动生效。

---

## 🛡️ 配置 Cloudflare Zero Trust 保护

1. 打开 [Cloudflare Zero Trust 控制台](https://one.dash.cloudflare.com/)；
2. 导航至 **Access** -> **Applications**；
3. 点击 **Add an Application** -> 选择 **Self-hosted**；
4. 填写应用信息：
   - **Application name**：`Home Dashboard`
   - **Application domain**：填写你的自定义域名（例如 `home.example.com`）；
5. 配置 Policies（访问策略）：
   - 添加允许通过验证的用户邮箱（如 `yourname@example.com`）或允许的国家/区域；
6. 保存策略。访问该域名时，Cloudflare 会在边缘自动拦截未认证请求，通过验证后无缝注入用户身份头，仪表盘自动放行。

---

## 📥 数据迁移与备份

1. **导入现有卡片**：
   - 打开导航页右上角的 **💾 导入/导出** 图标；
   - 点击选择文件，选中你原有的 `home.json` 文件（或直接将 JSON 文本粘贴到输入框中）；
   - 点击 **一键导入生效**，所有分类与卡片将立即加载至 Cloudflare KV 并呈现在页面上。
2. **定期备份**：
   - 点击 **导出 home.json** 按钮即可一键下载当前最新数据的备份文件。

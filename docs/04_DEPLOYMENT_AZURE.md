# Scriba Azure 部署方案 (Azure Deployment Strategy)

## 1. 核心挑战与解决方案 (Challenge & Solution)

### 现状分析
当前项目采用 **"No Bundler"** 模式（依赖运行时环境即时编译 TSX），这非常适合快速原型开发和演示。

### 部署挑战
**浏览器无法原生执行 `.tsx` 或 TypeScript 代码**。
目前的运行依赖于开发环境（如 AI Studio Preview）提供的即时编译层。若直接将 `.tsx` 文件上传至 Azure Storage 或 Static Web Apps，用户浏览器访问时会报错，因为它们不认识 JSX 语法。

### 解决方案
为了在 Azure 上进行生产级部署，必须引入构建步骤 (Build Step)。
我们推荐在部署阶段引入 **Vite**。它极轻量，且能将我们的 TSX 编译为浏览器可读的标准 JS/CSS，同时也是 React 官方推荐的构建工具。

---

## 2. 部署架构选型 (Architecture Selection)

推荐使用 **Azure Static Web Apps (SWA)**。

**理由**:
*   **原生支持 SPA**: 自动处理路由回退 (Fallback routes)，解决刷新 404 问题。
*   **自动化 CI/CD**: 开箱即用的 GitHub Actions 集成，提交代码自动构建并部署。
*   **全球 CDN**: 静态资源自动分发，加载速度快。
*   **成本效益**: Free Tier 足够早期使用。

---

## 3. 实施步骤 (Implementation Steps)

### 第一阶段：工程化改造 (Preparation)
*这是部署前的必要准备，将项目转换为标准的 Node.js 工程。*

1.  **添加 `package.json`**:
    定义项目依赖和构建脚本。
    ```json
    {
      "name": "scriba-app",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "lucide-react": "^0.300.0"
      },
      "devDependencies": {
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "@vitejs/plugin-react": "^4.2.0",
        "typescript": "^5.2.0",
        "vite": "^5.0.0"
      }
    }
    ```

2.  **添加 `vite.config.ts`**:
    配置构建输出目录。
    ```ts
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      build: {
        outDir: 'dist'
      }
    });
    ```

3.  **添加入口文件**:
    修改 `index.html`，使其指向 TSX 入口（Vite 会自动处理）。
    ```html
    <!-- 在 body 结束前 -->
    <script type="module" src="/index.tsx"></script>
    ```

### 第二阶段：Azure 资源配置 (Azure Setup)

1.  **创建资源**: 在 Azure Portal 中创建 "Static Web App"。
2.  **连接仓库**: 选择 GitHub 仓库及分支 (main)。
3.  **构建预设 (Build Details)**:
    *   **Build Presets**: 选择 `React`。
    *   **App Location**: `/` (根目录)。
    *   **Api Location**: (留空)。
    *   **Output Location**: `dist` (对应 vite 配置)。

---

## 4. 环境变量与安全 (Security & Config)

社交登录所需的敏感信息严禁提交到代码仓库。

### Azure 后台配置
在 Static Web App 的 **Configuration -> Application Settings** 中添加：

| Key | Value 示例 | 说明 |
|-----|------------|------|
| `VITE_GOOGLE_CLIENT_ID` | `123...apps.googleusercontent.com` | Google OAuth Client ID |
| `VITE_APPLE_CLIENT_ID` | `com.scriba.app` | Apple Service ID |
| `VITE_FACEBOOK_APP_ID` | `8829...` | Facebook App ID |
| `VITE_API_URL` | `https://api.scriba.com` | 后端接口地址 |

*注意：Vite 在构建时会将 `import.meta.env.VITE_***` 静态替换为实际值。*

---

## 5. 域名与回调配置 (Domain & Redirects)

部署完成后，Azure 会分配一个默认域名（如 `lively-river-123.azurestaticapps.net`）。

**必须执行的操作**:
回到 Google/Apple/Facebook 开发者后台，将此域名添加至 **"Authorized Redirect URIs"** 白名单中，否则社交登录将报错 `redirect_uri_mismatch`。

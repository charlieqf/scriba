# Scriba 社交登录集成技术方案 (Technical Specification)

## 1. 架构总览 (Architecture Overview)

我们将采用 **OAuth 2.0 / OIDC (OpenID Connect)** 标准流程。考虑到 Scriba 是单页应用 (SPA)，我们将主要采用 **授权码模式 (Authorization Code Flow)** 或 **客户端凭证模式**（视具体 Provider 而定），将获取到的 Token 发送给后端进行验证。

### 核心流程
1.  **Client (Frontend)**: 调用第三方 SDK (Google/Apple/FB)，拉起授权弹窗。
2.  **Provider**: 用户确认授权，返回 `id_token` 或 `access_token` 给前端。
3.  **Client**: 将 Token 发送至 Scriba 后端 API (`/api/auth/social-login`).
4.  **Backend**: 验证 Token 有效性，查找或创建用户，返回 Scriba 自身的 Session Token (JWT)。
5.  **Client**: 存储 Session Token，完成登录。

---

## 2. 第三方平台集成策略 (Provider Strategies)

### 2.1 Google 登录
*   **技术选型**: Google Identity Services (GIS) - "Sign In With Google" SDK.
*   **交互方式**: 弹窗 (Popup) 模式，避免页面重定向导致状态丢失。
*   **核心数据**: `Credential` (JWT string)。
*   **实施细节**:
    *   需要加载 `https://accounts.google.com/gsi/client` 脚本。
    *   初始化时传入 `client_id`。
    *   回调函数接收 `credentialResponse`。

### 2.2 Apple 登录 (Sign in with Apple)
*   **技术选型**: Sign in with Apple JS Framework.
*   **交互方式**: Apple 强制要求的弹窗或重定向。
*   **核心数据**: `identityToken` (JWT) 和 `authorizationCode`。
*   **实施细节**:
    *   加载 `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js`。
    *   配置 `clientId` (Service ID), `scope` (name email), `redirectURI`。
    *   **注意**: Apple 对 Frontend 只有第一次登录会返回用户名字 (`user` 对象)，后端必须在第一次验证时持久化存储名字，否则后续无法获取。

### 2.3 Facebook 登录
*   **技术选型**: Facebook SDK for JavaScript.
*   **交互方式**: `FB.login()` 弹窗。
*   **核心数据**: `accessToken` 和 `userID`。
*   **实施细节**:
    *   加载 `https://connect.facebook.net/en_US/sdk.js`。
    *   初始化 `FB.init({ appId, version: 'v18.0' })`。
    *   调用 `FB.api('/me')` 获取 `email` 和 `name` 字段（需 `public_profile`, `email` 权限）。

---

## 3. 前端接口层设计 (Frontend Interface Design)

为了遵循我们 **"接口层抽象 (API Abstraction)"** 的原则，严禁在 UI 组件 (`LoginPage.tsx`) 中直接操作 `window.google` 或 `FB` 对象。我们将构建一个 **适配器模式 (Adapter Pattern)** 的 Hook。

### 3.1 目录结构变更
```text
src/
  ├── services/
  │   ├── authService.ts       // 现有的服务，需扩展真实API调用
  │   └── social/
  │       ├── googleAuth.ts    // Google SDK 封装
  │       ├── appleAuth.ts     // Apple SDK 封装
  │       └── facebookAuth.ts  // Facebook SDK 封装
  └── hooks/
      └── useSocialLogin.ts    // 统一暴露给 UI 的 Hook
```

### 3.2 数据归一化 (Data Normalization)
无论哪个平台登录，最终传递给 `authService` 的数据结构必须统一：

```typescript
interface SocialAuthPayload {
  provider: 'google' | 'apple' | 'facebook';
  token: string;           // id_token or access_token
  authorizationCode?: string; // Apple specific
  userProfile?: {          // Optional client-side profile hints
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}
```

---

## 4. 安全性考量 (Security Considerations)

1.  **Environment Variables**:
    *   所有的 `CLIENT_ID` 和 `APP_ID` 必须通过环境变量 (`process.env.REACT_APP_*`) 注入，严禁硬编码。
2.  **Nonce & State**:
    *   对于 Apple 和 Google 登录，建议在请求中生成随机 `nonce` 防止重放攻击 (Replay Attacks)。
3.  **Script Loading Strategy**:
    *   第三方 SDK 脚本应异步加载 (`async defer`)，并不阻塞页面主渲染流程 (`LoginPage` 动画)。
    *   需处理 SDK 加载失败（如被广告拦截插件拦截）的降级体验。

---

## 5. 实施路线图 (Implementation Roadmap)

### Phase 1: SDK 封装 (Service Layer)
*   创建 `ScriptLoader` 工具函数，用于动态加载外部 JS。
*   实现 `GoogleAuthService`：初始化 GIS，暴露 `signIn()` 方法。
*   实现 `AppleAuthService`：初始化 AppleID，暴露 `signIn()` 方法。
*   实现 `FacebookAuthService`：初始化 FB SDK，暴露 `signIn()` 方法。

### Phase 2: 状态管理与 Hook (Logic Layer)
*   创建 `useSocialLogin` Hook。
*   处理 `loading` 状态（例如：点击 Google 按钮后，按钮应进入 loading 态，直到弹窗关闭或登录完成）。
*   处理 `error` 状态（例如：用户关闭了弹窗、网络错误）。

### Phase 3: UI 对接 (View Layer)
*   修改 `LoginPage.tsx`。
*   将 `SocialButton` 的 `onClick` 事件绑定到 `useSocialLogin` 返回的方法上。
*   移除 Mock 的 `console.log`，接入真实的 Promise 链。

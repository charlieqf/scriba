# 技术栈选型建议与分析 (Tech Stack Recommendation)

## 1. 现状评估

*   **当前代码**: 纯前端 (React + TypeScript)，业务逻辑通过 `services/` 目录下的 Mock 数据模拟。
*   **开发者背景**: 熟悉 Python (Flask) + Vue.js。
*   **项目属性**: AI 医疗报告生成 (Scriba)。

---

## 2. 核心建议：混合架构 (The Hybrid Approach)

鉴于项目属于 **AI 垂直领域**，且您熟悉 Flask，我们强烈推荐采用 **"React 前端 + Python 后端"** 的架构。

### 推荐方案
*   **Frontend**: 保留 **React + TypeScript**。
*   **Backend**: 采用 **Python (Flask 或 FastAPI)**。

### 决策理由

#### 为什么后端选 Python (Flask)?
1.  **AI 生态统治力**: 
    Scriba 的核心是 AI 报告生成。Python 拥有最顶级的 AI 库（LangChain, OpenAI SDK, NumPy, Pandas）。处理 Prompt 工程、Token 计算、结构化输出解析，Python 比 Node.js/TypeScript 更顺手且社区支持更强。
2.  **开发效率**:
    结合您的背景，使用 Flask 开发 API 接口没有学习成本，可以专注于业务逻辑而非语言特性。
3.  **数据处理**:
    医疗报告可能涉及复杂的数据清洗或格式化，Python 在这方面具有天然优势。

#### 为什么前端保留 React?
1.  **沉没成本**:
    目前的 UI 交互、Tailwind 样式配置、架构规范均已在 React 中完成。重写为 Vue 需要大量重复劳动。
2.  **学习曲线平滑**:
    React 的 Hooks (`useState`, `useEffect`) 与 Vue 3 的 Composition API 非常相似。作为 Vue 开发者，理解当前的 React 代码只需极低的学习成本。

---

## 3. 架构设计图 (Architecture Blueprint)

```text
[用户浏览器]
     |
     |  HTTPS / JSON
     v
[前端: Azure Static Web App]
   (React + TypeScript)
     | 1. 渲染 UI
     | 2. 调用 authService (发送 HTTP 请求)
     |
     |  REST API 调用 (fetch / axios)
     v
[后端: Azure Web App / Functions]
   (Python + Flask)
     | 1. 接收请求
     | 2. 验证 Token (Google/Apple/FB)
     | 3. 业务逻辑处理
     |
     +-----> [Azure OpenAI / Gemini API] (AI 推理)
     |
     +-----> [Azure SQL / Cosmos DB] (数据存储)
```

---

## 4. Azure 部署策略调整

如果您决定采用此方案，`docs/04_DEPLOYMENT_AZURE.md` 中的部署策略需要微调：

### 方案 A：Azure Static Web Apps (推荐，最简单)
Azure Static Web Apps 支持 "Managed Functions"。您可以直接在项目中添加一个 `api/` 目录存放 Python 代码。Azure 会自动将 React 部署为静态站点，将 Python 代码部署为无服务器函数 (Azure Functions)。

*   **Frontend**: `/` (React 构建产物)
*   **Backend**: `/api` (Python Azure Functions)

### 方案 B：独立部署 (更灵活)
*   **前端**: 部署到 **Azure Static Web Apps**。
*   **后端**: 将 Flask 应用容器化 (Docker)，部署到 **Azure Container Apps** 或 **Azure App Service**。

---

## 5. 下一步行动建议

1.  **前端保持不变**: 继续完善 React 页面，但需将 `services/` 下的 Mock 代码逐步替换为真实的 `fetch` 调用。
2.  **初始化后端**: 
    *   在项目根目录创建一个 `backend/` 文件夹。
    *   初始化一个标准的 Flask 项目 (`app.py`, `requirements.txt`)。
    *   编写第一个 API 接口（如 `/api/health`）。
3.  **联调**:
    *   修改 `vite.config.ts` 配置代理 (Proxy)，将 `/api` 请求转发到本地运行的 Flask 服务 (通常是 localhost:5000)。

# 项目结构与技术栈 (Project Structure & Tech Stack)

## 1. 技术栈 (Tech Stack)
*   **Frontend Framework**: Vue 3 (Composition API)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v3
*   **Backend Framework**: Flask (Python)
*   **Database**: (Planned) SQL / Cosmos DB

## 2. 目录结构 (Directory Structure)

```text
/
├── index.html              # 入口 HTML
├── main.ts                 # Vue 入口文件
├── App.vue                 # 根组件
├── types.ts                # 全局 TypeScript 类型定义
├── constants.ts            # 常量配置
├── metadata.json           # 应用元数据
├── components/             # Vue UI 组件
│   ├── RequirementCard.vue # 需求展示卡片
│   └── icons.ts            # 图标组件 (Functional Components)
├── pages/                  # 页面级组件
│   └── LoginPage.vue       # 登录/注册页面
├── services/               # 前端服务层
│   ├── authService.ts      # 认证服务 (对接 Flask API)
│   └── storageService.ts   # 本地存储
├── backend/                # [NEW] 后端代码
│   ├── app.py              # Flask 应用入口
│   └── requirements.txt    # Python 依赖
└── docs/                   # 项目文档
    ├── 01_ARCHITECTURE.md
    ├── 02_SOCIAL_AUTH_SPEC.md
    ├── 03_PROJECT_STRUCTURE.md
    ├── 04_DEPLOYMENT_AZURE.md
    └── 05_TECH_STACK_RECOMMENDATION.md
```

## 3. 关键架构决策

*   **Vue Composition API**: 使用 `<script setup lang="ts">` 语法，提供更好的 TypeScript 支持和逻辑复用。
*   **Flask API**: 后端提供 RESTful API，前端通过 `fetch` 或 `axios` 与其通信。
*   **Separation of Concerns**: 前端只负责渲染，复杂逻辑和 AI 调用下沉至 Flask 后端。
# Scriba 架构原则 (Architecture Guidelines)

本文档基于项目代码中的 `constants.ts` 生成，定义了 Scriba 项目的核心架构规范。所有开发工作必须严格遵循以下原则。

## 1. 提示词工程 (Prompt Engineering)
**原则 (Principles):** `可视化 (Visualization)` `透明性 (Transparency)`
> "所见即所得，拒绝黑盒调试，确保开发者对 Prompt 拥有完全控制权。"

**实施规范 (Implementation):**
1.  **配置入口**: 所有 Prompt 触发按钮旁必须包含 ⚙️ 齿轮图标，点击弹出 Modal 查看/修改/保存 Prompt。
2.  **完全透明**: 严禁使用系统隐藏 Prompt，所有发给模型的指令必须对用户可见。
3.  **流式调试窗口 (Debug Window)**: 必须实现 API 流式调用 (Streaming)。窗口需实时展示 Request (Prompt) 和 Response。内容过长时必须默认折叠，提供“点击展开”交互，避免 UI 刷屏。

## 2. 工作流架构 (Workflow & State)
**原则 (Principles):** `非线性 (Non-linear)` `持久化 (Persistence)`
> "支持原子化测试与断点续传，拒绝强制的线性流程绑定。"

**实施规范 (Implementation):**
1.  **路由自由度**: 严禁锁定路由。即使有既定流程，也必须允许通过 URL 或菜单直接访问任意页面/步骤进行独立测试。
2.  **任务拆解**: 复杂流程必须拆解为可单独手动执行的环节，禁止“黑盒式”一键跑通。
3.  **状态持久化 (Persistence)**: 每个步骤执行后自动保存中间状态。支持断点续传，页面刷新后数据不丢失。
4.  **数据导出**: 执行过程中（Loading 态）也必须提供按钮，允许随时下载/导出当前已生成的中间结果。

## 3. 交互安全 (Safety & UX)
**原则 (Principles):** `防误触 (Safety)`
> "高风险操作必须增加阻力。"

**实施规范 (Implementation):**
1.  **删除确认**: 所有涉及 `Delete` / `Remove` 的操作，必须弹出 Modal 或 Alert 对话框进行二次确认，严禁直接执行。

## 4. 接口层抽象 (API Abstraction)
**原则 (Principles):** `解耦 (Decoupling)` `可维护性 (Maintainability)`
> "UI 组件与 API 实现细节彻底分离。"

**实施规范 (Implementation):**
1.  **独立服务层**: 禁止在 React 组件 (`.tsx`) 内部直接调用 fetch/axios。必须抽取单独的模块（如 `services/llmService.ts`）处理 API 请求。
2.  **目的**: 确保未来更换模型厂商或修改接口参数时，无需触碰前端 UI 代码。

## 5. 模块化设计 (Modular Design)
**原则 (Principles):** `高内聚 (Cohesion)`
> "一个页面即一个独立模块。"

**实施规范 (Implementation):**
1.  **页面即模块**: 遵循 "One Page = One Module" 原则。
2.  **分离实现**: 必须将视图组件与业务逻辑代码（Hooks/Utils）进行物理文件分离，避免“上帝组件（God Object）”。

## 6. 前后台分离 (Architecture)
**原则 (Principles):** `扩展性 (Scalability)` `未来就绪 (Future-ready)`
> "即使是前端项目，也要模拟后端分层。"

**实施规范 (Implementation):**
1.  **逻辑分层**: 严格区分 `Frontend` (UI/Interaction) 与 `Backend/Service` (Data Logic)。
2.  **无缝迁移**: 代码结构必须保证：当未来接入真实数据库时，只需重写 `Service` 层代码，前端代码完全不需要修改。
import { Requirement } from './types';

export const ARCHITECTURE_REQUIREMENTS: Requirement[] = [
  {
    id: '1',
    category: '1. 提示词工程',
    subLabel: 'Prompt Engineering',
    principles: {
      tags: [
        { label: '可视化', color: 'blue' },
        { label: '透明性', color: 'purple' },
      ],
      description: '所见即所得，拒绝黑盒调试，确保开发者对 Prompt 拥有完全控制权。',
    },
    implementation: [
      {
        title: '配置入口',
        details: '所有 Prompt 触发按钮旁必须包含 ⚙️ 齿轮图标，点击弹出 Modal 查看/修改/保存 Prompt。',
      },
      {
        title: '完全透明',
        details: '严禁使用系统隐藏 Prompt，所有发给模型的指令必须对用户可见。',
      },
      {
        title: '流式调试窗口 (Debug Window)',
        details: '必须实现 API 流式调用 (Streaming)。窗口需实时展示 Request (Prompt) 和 Response。内容过长时必须默认折叠，提供“点击展开”交互，避免 UI 刷屏。',
      },
    ],
  },
  {
    id: '2',
    category: '2. 工作流架构',
    subLabel: 'Workflow & State',
    principles: {
      tags: [
        { label: '非线性', color: 'orange' },
        { label: '持久化', color: 'green' },
      ],
      description: '支持原子化测试与断点续传，拒绝强制的线性流程绑定。',
    },
    implementation: [
      {
        title: '路由自由度',
        details: '严禁锁定路由。即使有既定流程，也必须允许通过 URL 或菜单直接访问任意页面/步骤进行独立测试。',
      },
      {
        title: '任务拆解',
        details: '复杂流程必须拆解为可单独手动执行的环节，禁止“黑盒式”一键跑通。',
      },
      {
        title: '状态持久化 (Persistence)',
        details: '每个步骤执行后自动保存中间状态。支持断点续传，页面刷新后数据不丢失。',
      },
      {
        title: '数据导出',
        details: '执行过程中（Loading 态）也必须提供按钮，允许随时下载/导出当前已生成的中间结果。',
      },
    ],
  },
  {
    id: '3',
    category: '3. 交互安全',
    subLabel: 'Safety & UX',
    principles: {
      tags: [
        { label: '防误触', color: 'red' },
      ],
      description: '高风险操作必须增加阻力。',
    },
    implementation: [
      {
        title: '删除确认',
        details: '所有涉及 `Delete` / `Remove` 的操作，必须弹出 Modal 或 Alert 对话框进行二次确认，严禁直接执行。',
      },
    ],
  },
  {
    id: '4',
    category: '4. 接口层抽象',
    subLabel: 'API Abstraction',
    principles: {
      tags: [
        { label: '解耦', color: 'blue' },
        { label: '可维护性', color: 'blue' },
      ],
      description: 'UI 组件与 API 实现细节彻底分离。',
    },
    implementation: [
      {
        title: '独立服务层',
        details: '禁止在 Vue 组件 (`.vue`) 内部直接调用 fetch/axios。必须抽取单独的模块（如 `services/llmService.ts`）处理 API 请求。',
      },
      {
        title: '目的',
        details: '确保未来更换模型厂商或修改接口参数时，无需触碰前端 UI 代码。',
      },
    ],
  },
  {
    id: '5',
    category: '5. 模块化设计',
    subLabel: 'Modular Design',
    principles: {
      tags: [
        { label: '高内聚', color: 'purple' },
      ],
      description: '一个页面即一个独立模块。',
    },
    implementation: [
      {
        title: '页面即模块',
        details: '遵循 "One Page = One Module" 原则。',
      },
      {
        title: '分离实现',
        details: '必须将视图组件与业务逻辑代码（Hooks/Utils）进行物理文件分离，避免“上帝组件（God Object）”。',
      },
    ],
  },
  {
    id: '6',
    category: '6. 前后台分离',
    subLabel: 'Architecture',
    principles: {
      tags: [
        { label: '扩展性', color: 'green' },
        { label: '未来就绪', color: 'orange' },
      ],
      description: '即使是前端项目，也要模拟后端分层。',
    },
    implementation: [
      {
        title: '逻辑分层',
        details: '严格区分 `Frontend` (UI/Interaction) 与 `Backend/Service` (Data Logic)。',
      },
      {
        title: '无缝迁移',
        details: '代码结构必须保证：当未来接入真实数据库时，只需重写 `Service` 层代码，前端代码完全不需要修改。',
      },
    ],
  },
];
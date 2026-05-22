import {uuid} from "@peryl/utils/uuid";

console.log(uuid());

export interface iCourseRecord {
  id: string,
  /*课程主图*/
  primaryImage: string,
  /*实战项目名称*/
  name: string,
  /*项目简介*/
  introduce: string,
  /*项目内容描述*/
  descriptions: string[],
  /*学习掌握技能*/
  skills: string[],
  /*项目架构图片地址*/
  imageUrls: string[],
  /*项目架构描述*/
  architectures: string[],
  /*项目讲解视频地址*/
  videoUrl: string,
  /*项目背景主题色，需要使用16进制颜色值*/
  primaryColor: string,
  /*当前项目状态*/
  status: string,
  /*更新方式*/
  upgradeType: string,
  /*学习难度*/
  difficulty: string,
  /*学习课时*/
  studyHours: string,
}

export const CourseData: iCourseRecord[] = [
  {
    name: '前端智能组件封装实战',
    id: '550e8400-e29b-41d4-a716-446655440000',
    primaryImage: 'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E8%AF%BE%E7%A8%8B%E5%B0%81%E9%9D%A2_%E5%89%8D%E7%AB%AF%E6%99%BA%E8%83%BD%E7%BB%84%E4%BB%B6%E5%B0%81%E8%A3%85.jpeg',
    introduce: '课程采用React与Vue3双框架开发模式，通过实际项目演练，带领学员从零开始构建高复用性的智能数据表格组件，创新融入AI能力，打造高复用智能组件，提升职场竞争力。',
    descriptions: [
      '前端开发者，想不想拥有一套双框架适配的高复用智能组件？作为求职或晋升的核心筹码，想不想让你的项目履历脱颖而出？前端智能数据表格组件封装实战项目，就是你的最优解。项目深度融合React与Vue3两大主流框架，分别独立封装智能数据表格组件，打造覆盖全场景的数据管理解决方案。',
      '组件不仅囊括增删改查等传统核心功能，更支持多行编辑、表单编辑、灵活查询表达式及多字段排序，满足日常开发的全场景需求；更创新性融入AI能力，实现自然语言生成查询、智能多字段排序、智能字段配置、智能表单填写与智能批量新建，让数据操作效率呈指数级提升。',
      '后端采用Python构建，封装通用化接口，可对任意数据库表实现增删改查操作，同时完美支撑复杂查询与排序逻辑，实现前后端高效协同。项目不仅带你精通两大前端框架的组件封装思路，更能掌握AI与前端结合的开发技巧，让你在数据组件开发领域建立核心竞争力，成为企业争抢的技术人才。',
    ],
    skills: [
      '前端组件封装能力：掌握智能表格、表单编辑服务、筛选表单等高复用性智能组件的封装方法，理解如何基于 React Hook 和 Vue3 Composition API 实现高复用组件设计，提升代码可维护性和健壮性。',
      '主流前端框架实战：深入学习 React 与 Vue3 的核心开发模式，包括状态管理、响应式原理、组件通信等，并熟练使用 antd、element-plus、@ant-design/x、element-plus-x 等 UI 库进行界面构建。',
      'AI 能力集成开发：掌握如何将大模型能力（如自然语言生成查询、智能排序、表单填写）嵌入前端组件中，通过 @langchain/core 实现与后端 LangServe 或 LangGraph 的流式交互，实现 AI 驱动的数据操作。',
      '前后端协同架构设计：理解基于 FastAPI 构建的后端服务架构，掌握 SqlModel 对 MySQL 数据库的 ORM 操作，以及 General Module 如何封装通用 CRUD 接口以支持任意数据表操作。',
      '复杂查询与排序逻辑处理：学习如何在后端通过 LangChain 和 LangGraph 实现复杂的多字段查询和动态排序逻辑，支持自然语言驱动的智能数据筛选。',
      '大模型服务对接能力：熟悉对接 Doubao、Qwen、Deepseek 等主流大模型服务的方式，了解不同模型在文本、语音、视觉等模态下的应用场景与调用差异。',
      '服务化组件设计思想：学习 表单编辑服务 与 ChatCopilot 的服务化设计模式，掌握如何通过抽屉式弹窗调用聊天助手，实现低侵入式的 AI 功能集成。',
    ],
    imageUrls: [
      'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/01.png'
    ],
    architectures: [
      '前端组件封装：AutoTable：智能数据表格，具备通用化的增删改查以及AI能力整合，是项目实战的最终实现目标；AutoForm：表单编辑服务，整合了ChatCopilot（聊天助手组件）的能力，可以通过服务调用的方式来唤起抽屉表单进行编辑，并且整合AI的能力实现自然语言填写表单；FilterForm：表单查询组件，可以快速生成多字段筛选参数，用于数据查询；Chatbot：聊天组件，拥有三种模式，分别是直接对接大模型服务接口、对接后端LangServe接口、对接后端LangGraph接口；ChatCopilot：聊天助手服务，可以通过服务的方式唤起，以抽屉聊天框的方式呈现，功能等同于Chatbot；',
      '前端技术栈：会分别使用React Hook以及Vue3 Composition API分别实现一遍，会使用到React以及Vue3相关生态中的开源库；其中@langchain/core用来流式调用后端LangServe或者LangGraph接口，navigator.mediaDevices用来调用浏览器录音模块，实现前端流式识别音频，实现聊天组件的语音输入功能；',
      '后端技术栈：包含AI生态中常用的技术框架LangChain、LangGraph、LangServe，使用SqlModel来操作Mysql数据库表、使用dashscope来调用音频模型服务，实现音频流式识别以及音频合成，使用FastAPI作为后端开发框架实现接口开发，使用uvicron来启动后端服务，自定义封装General Module模块，实现对所有数据库表的通用增删改查接口；',
      '服务层：主要使用Doubao、Qwen、Deepseek三种模型，其中还会用到语言模型、视觉模型、音频模型以及多模态模型；主要使用Mysql来存储业务数据，Postgres数据库用来存储LangGraph检查点对话历史数据、使用模型qwen3-asr-flash-realtime来实现流式识别音频、使用sambert来实现音频合成；使用Milvus来向量化存储知识库文档并且检索，使用Redis来实现快速缓存；',
    ],
    videoUrl: '//player.bilibili.com/player.html?isOutside=true&aid=115649611307830&bvid=BV1qcStBFEY2&cid=34448736649&p=1',
    primaryColor: '#FFBFBF',
    status: '未开始',
    upgradeType: '持续更新',
    difficulty: '中等',
    studyHours: '36',
  },
  {
    name: '智能报销系统——云销智算',
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    primaryImage: 'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E8%AF%BE%E7%A8%8B%E5%B0%81%E9%9D%A2_%E4%BA%91%E9%94%80%E6%99%BA%E7%AE%97.jpeg',
    introduce: '课程融合LangChain、FastAPI等主流框架，涵盖需求分析到部署上线完整流程，实现流式创建报销单、审批辅助决策等核心AI功能，为求职或创业打造高质量项目作品',
    descriptions: [
      '企业开发者，想不想打造一套大幅提升财务效率的智能办公工具？作为技术求职者，想不想拥有一份亮眼吸睛的实战项目履历？基于大模型服务的智能报销系统，就是你的理想之选。项目融合大模型能力与企业级开发技术，构建全流程智能化报销平台，覆盖项目管理、报销管理、审批管理、发票管理、酒店预定等核心功能模块，满足企业财务全场景需求。',
      '系统创新实现批量流式识别发票、流式生成报销单，通过流式解析点表示法响应数据，实时流式展示发票与报销单信息，彻底告别传统报销的繁琐录入。基于LangGraph开发灵活审批流，关键审批阶段智能调用大模型能力，依据企业报销政策自动生成专业审批意见，为审批人提供精准参考，大幅提升审批效率与合规性。',
      '更支持与智能管家对话，快速生成多维度项目成本分析报告，从人员、费用类型、时间范围等角度深度剖析支出情况并给出优化建议。项目不仅完整传授大模型与后端系统的融合开发流程，更聚焦流式处理、工作流编排等核心技术，让你精通大模型在企业级应用中的落地技巧，成为智能办公系统开发领域的核心人才。',
      '这是一个基于LangGraph技术栈打造的深度实战项目，通过真实业务场景锤炼你的AI应用开发技能。',
    ],
    skills: [
      '大模型与企业级应用融合开发：掌握如何将 LangChain、LangGraph、LangServe 等主流 AI 框架集成到实际业务系统中，实现智能报销、审批意见生成等场景，理解大模型在企业级系统中的落地路径。',
      '流式处理与实时交互能力：学习基于流式响应的发票识别与报销单生成技术，掌握如何通过流式解析点表示法（Streamed JSON）实现实时数据展示，提升用户体验和系统响应效率。',
      '工作流编排与状态管理：深入理解 LangGraph 的工作流设计机制，掌握复杂审批流程的建模方法，包括中断恢复、多级审批、条件分支等逻辑，并结合 dify 实现灵活的工作流调度。',
      '后端服务开发与架构设计：使用 FastAPI 搭建高性能异步 API 服务，结合 Uvicorn 部署运行，掌握 RESTful 接口设计、数据库交互、缓存优化等核心后端开发技能。',
      '数据库与存储技术应用：熟悉 MySQL、PostgreSQL 用于结构化数据存储，Redis 用于缓存加速，Milvus 用于向量检索，构建高可用、可扩展的数据存储体系。',
      'AI 能力调用与集成：学习如何通过 @langchain/core 调用外部大模型服务（如火山引擎、阿里云百炼、DeepSeek），实现自然语言理解、智能分析、报告生成等功能。',
      '审批流程自动化与智能决策支持：掌握基于用户层级关系的动态审批流设计，实现自动跳转上级审批、审批状态更新、审批意见生成等自动化流程，提升审批效率与合规性。',
      '项目成本分析与智能问答：通过与智能管家对话，学习如何利用大模型生成多维度的成本分析报告，涵盖人员、费用类型、时间范围等维度，并提供优化建议。',
      '实战项目经验积累：完成一个完整的智能报销系统项目，涵盖需求分析、架构设计、功能开发、测试部署等全流程，为求职或创业积累高质量项目履历。',
    ],
    architectures: [
      '外部服务层：在整个系统中，我们会使用到各种各样的外部服务，比如大模型服务有火山引擎（Volcengine），阿里云百炼，深度求索（DeepSeek）；存储类的服务有Mysql、Postgres、Milvus、Redis；其中还用到dify的工作流编排引擎用于处理业务流程；',
      '后端框架层：我们会用到主流的AI框架比如LangChain、LangGraph、LangServe、LlamaIndex、LangFuse；后端服务所使用的是FastAPI框架，这是一个高性能的异步API服务框架，然后使用Uvicron作为运行FastAPI的服务器；',
      '后端业务层：主要包括用户管理（登录注册激活）、组织管理、职位管理，项目管理、报销单、审批单、发票管理等等；',
      '前端框架层：组件库我们使用ant-design，AI组件我们使用@ant-design/x，大模型服务调用我们使用@langchain/core；',
      '前端应用层：主要使用我们在前一个实战项目“前端智能组件封装”中封装的业务组件做业务开发；',
    ],
    imageUrls: [
      'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E6%99%BA%E8%83%BD%E6%8A%A5%E9%94%80_%E9%A1%B9%E7%9B%AE%E6%9E%B6%E6%9E%84%E5%9B%BE.png',
      'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E6%99%BA%E8%83%BD%E6%8A%A5%E9%94%80%E7%B3%BB%E7%BB%9F_%E5%AE%A1%E6%89%B9%E6%B5%81.png',
      'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E6%99%BA%E8%83%BD%E6%8A%A5%E9%94%80%E7%B3%BB%E7%BB%9F_%E5%AE%A1%E6%89%B9%E5%A4%8D%E7%94%A8.png'
    ],
    videoUrl: '//player.bilibili.com/player.html?isOutside=true&aid=115650164955827&bvid=BV1wgS4BNEMr&cid=34452868868&p=1',
    primaryColor: '#fff1bf',
    status: '未开始',
    upgradeType: '持续更新',
    difficulty: '高',
    studyHours: '60',
  },
  {
    name: '企业级文档知识库',
    id: '2b96a473-3209-4adb-8ca6-2a130253c365',
    primaryImage: 'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E8%AF%BE%E7%A8%8B%E5%B0%81%E9%9D%A2_%E4%BC%81%E4%B8%9A%E7%BA%A7%E6%96%87%E6%A1%A3%E7%9F%A5%E8%AF%86%E5%BA%93.jpg',
    introduce: '本项目基于LlamaIndex与Milvus技术深度整合，打造了一个集文档管理、智能检索和问答机器人于一体的综合知识管理系统，支持在线文档编辑、自动向量化处理及跨库灵活检索。系统内置智能问答助手，可高效解答各类企业政策疑问，并为每位员工提供专属知识库管理功能，显著提升工作效率与知识传承效果。',
    descriptions: [
      '系统整合升级：在现有报销系统基础上，我们深度融合 LlamaIndex 与 Milvus 技术，构建了涵盖企业内部文档管理、员工日报检索及智能问答机器人的综合性知识管理系统；',
      '在线文档编辑：系统支持所有企业人员在线编辑文档，文档保存时自动执行分块处理、重新索引及向量化操作，并持久化存储至数据库；',
      '灵活检索机制：支持按单一知识库精准检索，亦可跨所有知识库进行全面检索；',
      '智能问答助手：基于知识库检索系统，可构建员工智能问答助手，有效解决报销流程咨询、休假政策指导、绩效考核标准解读、采购规范查询等问题，显著提升员工工作效率；',
      '个人知识库管理：每位员工可将工作日报录入系统形成专属知识库，在工作总结撰写、事项统计、人员交接及工作沟通等场景中，该可检索日报知识库能极大降低知识传递成本；',
      '多维度项目检索：除员工维度外，还支持项目维度的日报检索。结合问答机器人对话能力，可自动汇总分析项目日/周/月度工作报告，提炼里程碑事件、识别重大缺陷与潜在风险、跟踪工作进度；新成员可通过查阅历史日报快速熟悉项目业务流程；',
      '知识问答机器人：支持绑定单个或多个知识库，配合自定义提示词约束，实现全天候在线智能问答服务。',
    ],
    skills: [
      'RAG（Retrieval-Augmented Generation）实战应用：学习如何将 LlamaIndex 与 Milvus 融合，构建具备检索增强生成能力的知识管理系统。',
      '企业级知识库架构设计：掌握从零搭建支持多用户在线编辑、自动分块、向量化和索引的企业文档知识库系统的方法。',
      '智能文档处理流程：理解并实现文档保存后自动触发的文本分块、语义嵌入及向量存储全流程。',
      '灵活高效的检索机制开发：实现基于单一知识库或跨多个知识库的内容检索功能，提高信息获取效率。',
      '问答机器人构建技巧：利用知识库内容训练智能问答助手，能够准确响应关于报销、休假、考核等常见问题。',
      '个人知识管理系统的建立：构建以员工日报为基础的个性化知识库，支持总结撰写、事项统计等多种应用场景。',
      '项目维度的数据聚合分析：开发按项目维度检索日报的能力，并结合问答模型完成报告汇总、风险识别等功能。',
      '多知识源绑定与提示工程优化：学会配置问答机器人同时访问多个知识库，并利用提示词工程提升回答准确性与专业性。'
    ],
    architectures: [],
    imageUrls: [],
    videoUrl: '//player.bilibili.com/player.html?isOutside=true&aid=115651221919617&bvid=BV1VSStB4ESd&cid=34457980050&p=1',
    primaryColor: '#bffcff',
    status: '未开始',
    upgradeType: '持续更新',
    difficulty: '中低',
    studyHours: '15',
  },
  {
    name: '智能聊天机器人',
    id: 'db00fc16-c12b-4937-99da-53c2a60c18bc',
    primaryImage: 'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E8%AF%BE%E7%A8%8B%E5%B0%81%E9%9D%A2_%E6%99%BA%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA.jpg',
    introduce: '本项目将带你从零开始构建一个功能强大的智能聊天机器人，融合语音流式识别、图像识别、多模态模型集成等前沿AI技术。你将掌握从前端组件封装到后端服务集成的全栈开发技能，实现一个真正具备商业价值的智能客服系统。',
    descriptions: [
      '你是否想掌握前沿AI技术，成为稀缺的AI应用开发人才？本课程带你从0到1构建一个完整的智能聊天机器人商业级项目，不仅涵盖核心技术实现，更注重实际应用场景和工程化实践。',
      '前端体验升级：基于 @ant-design/x 封装专业级聊天组件（Chatbot）与助手组件（ChatCopilot），打造媲美一线产品的交互体验；',
      '全平台接入能力：深度对接 OpenAI、LangGraph、LangServe 等主流大模型服务接口，让你轻松应对不同业务场景的技术选型；',
      '多媒体交互革新：集成音频模型实现流式语音识别，提升复杂环境下的沟通效率，无缝对接视觉模型，支持图像识别并输出结构化业务数据；',
      '灵活缓存策略：支持浏览器本地存储、关系型数据库（MySQL/PostgreSQL）及无缓存，满足不同规模的应用需求；',
      '智能会话管理：完善的中断处理机制，支持对话暂停与恢复；动态渲染各类业务中断表单，适应多样化工作流程；丰富可视化展示：内置图表、表格、列表、表单等多种工具结果展示形式，让AI输出更加直观易懂；',
    ],
    skills: [
      '前端组件开发：掌握基于 @ant-design/x 的高级聊天组件封装技巧，包括 Chatbot 和 ChatCopilot 组件的实现;',
      '语音交互功能实现：利用 navigator.mediaDevices 获取浏览器麦克风权限，结合 dashscope 的 qwen3-asr-flash-realtime 模型实现音频流式识别，支持语音输入聊天；同时使用 sambert 实现语音合成，完成完整的语音交互闭环。',
      '实时通信机制：理解 HTTP 与 WebSockets 在前后端通信中的作用，特别是在流式输出（如聊天回复、语音识别结果）场景下的应用。',
      '多模型服务集成：学习如何对接 OpenAI、LangGraph、LangServe 等不同类型的 AI 服务接口；',
      '音视频处理：实现流式语音识别功能，提升用户在复杂场景下的输入体验；',
      '计算机视觉应用：集成视觉模型进行图片识别和结构化数据生成；',
      '缓存策略设计：实现浏览器本地存储、数据库存储（MySQL/PostgreSQL）和无缓存三种模式的灵活切换；',
      '会话状态管理：掌握对话中断处理、恢复机制以及动态表单渲染技术；',
      '数据可视化：学习多种展示形式（图表、表格、列表、表单）的工具调用结果呈现；',
    ],
    architectures: [],
    imageUrls: [],
    videoUrl: '//player.bilibili.com/player.html?isOutside=true&aid=115651322583995&bvid=BV1ufStBnEV4&cid=34458242673&p=1',
    primaryColor: '#d5bfff',
    status: '未开始',
    upgradeType: '持续更新',
    difficulty: '高',
    studyHours: '20',
  },
  {
    name: 'DIFY项目应用实战',
    id: '0e3e161a-c724-4ef0-b7ea-cf8358727158',
    primaryImage: 'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E8%AF%BE%E7%A8%8B%E5%B0%81%E9%9D%A2_DIFY%E9%A1%B9%E7%9B%AE%E5%BA%94%E7%94%A8%E5%AE%9E%E6%88%98.png',
    introduce: '这是一门让你从零开始快速掌握DIFY平台开发的实战课程，通过智能知识库搭建、工作流设计、自定义工具开发到企业级项目演练的完整学习路径，助你轻松构建AI应用并实现智能客服、数据可视化等真实业务场景落地。',
    descriptions: [
      'DIFY平台快速上手 - 一键部署搞定AI应用环境，5大核心应用类型全覆盖，还能集成企业监控保障稳定运行',
      '工作流深度实战 - 玩转变量系统、节点配置和Jinja2模板语法，轻松构建复杂的业务逻辑流程',
      '智能知识库搭建 - 从文档处理到知识库构建一站式搞定，优化检索效果，用元数据提升智能化水平',
      '自定义工具开发 - 4个实用案例带你实战：成本分析、日报总结、文档检索、数据库操作，还有完整的开发发布流程指导',
      '企业级项目演练 - 打造智能客服、数据可视化、定时任务调度系统，无缝对接飞书、钉钉、企业微信等主流办公平台',
    ],
    skills: [
      'DIFY平台全栈开发：从基础部署到高级应用构建的完整技能体系',
      '工作流设计专家：掌握 Workflow 节点配置、变量管理和 Jinja2 模板语法',
      '知识库管理能力：文档分段、索引配置、检索优化和元数据应用技巧',
      '自定义工具开发：工具环境搭建、认证管理、代码打包发布全流程',
      '企业级应用开发：智能客服、数据分析、图表生成等真实业务场景',
      '跨平台集成能力：飞书、钉钉、企业微信等主流办公平台对接方案',
      '自动化运维技能：定时工作流集成和监控框架应用',
      '前沿技术栈：掌握当前AI应用开发最热门的技术和工具',
      '就业竞争力提升：具备独立完成AI项目的设计和实施能力',
      '薪资跃升机会：AI开发工程师、Prompt工程师等高薪岗位必备技能',
    ],
    architectures: [],
    imageUrls: [],
    videoUrl: '//player.bilibili.com/player.html?isOutside=true&aid=115656338970834&bvid=BV1Sg2tBGErx&cid=34482030287&p=1',
    primaryColor: '#ffd8bf',
    status: '未开始',
    upgradeType: '持续更新',
    difficulty: '中',
    studyHours: '20',
  },

  {
    name: '模型微调项目实战',
    id: 'd99ca558-f448-42a3-a815-630c885d7257',
    primaryImage: 'https://plain-assets.oss-cn-guangzhou.aliyuncs.com/20251126_rsedu_project/%E8%AF%BE%E7%A8%8B%E5%B0%81%E9%9D%A2_%E6%A8%A1%E5%9E%8B%E5%BE%AE%E8%B0%83%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%88%98.png',
    introduce: '基于深度学习核心技术，带你从零构建企业级AI模型：涵盖理论基础、数据处理、环境搭建到模型微调部署的全流程实战课程，让你轻松掌握大模型高效微调与高性能推理的核心技能！',
    descriptions: [
      '理论基础介绍：向量与张量、词典/词向量/标记词、位置编码、大模型解码、自注意力机制、多头注意力机制、掩码注意力机制、参数量与高效参数微调、损失函数、梯度消失与梯度爆炸、参数更新的反向传播算法、泛化与过拟合、无监督学习与自监督学习、强化学习、参数微调与低秩适应等等；',
      '数据集制备：数据格式类型、如何构造数据集、数据集的处理过程；',
      '环境搭建：介绍各种云平台GPU服务器，选配服务器以及评估所需要的配置大小；',
      '资源准备：使用ModelScope下载模型以及数据集；',
      '专业评测：使用EvalScope进行模型能力评估以及性能压力测试；',
      '微调工具：通过LlamaFactory使用LoRA高效微调模型，降低计算成本；',
      '模型服务：集成vllm高性能推理引擎，实现毫秒级响应的模型服务；',
      '全程实战：从模型微调，导出合并到自定义部署，掌握企业级模型微调开发技能；',
    ],
    skills: [],
    architectures: [],
    imageUrls: [],
    videoUrl: '//player.bilibili.com/player.html?isOutside=true&aid=115656422920481&bvid=BV1Nn2tBiE9z&cid=34482422339&p=1',
    primaryColor: '#d0ffbf',
    status: '未开始',
    upgradeType: '持续更新',
    difficulty: '中',
    studyHours: '16',
  }
];

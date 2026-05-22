export interface iResume {
  title: string,                                  // 简历标题
  primary: string,                                // 第一颜色
  secondary: string,                              // 第二颜色
  avatar: string,                                 // 职业照图片地址
  basicInfo: {
    title: string,
    /*
      * 基本信息项的类型：
      *
      * FullName（姓名：张三）
      * Age（年龄：30岁）
      * YearsOfWorking（工作年限：7年）
      * IntentPosition（意向工作：AI前端开发工程师）
      * IntentCity（意向城市：北京/上海/深圳）
      * IntentSalary（意向薪资：面议）
      * EntryTime（入职时间：一个月内入场）
      * PhoneNumber（电话号码：15800000000）
      * Email（邮箱：zhangsan@163.com）
      * Qualification（最高学历：上海交通大学（本科））
      *
      */
    data: { label?: string, val?: string, type?: string, icon?: string }[],
  },
  education: {
    title: string,
    data: { time?: string, school?: string, program?: string, content: string[] }[],
  },
  experience: {
    title: string,
    data: { time?: string, company?: string, role?: string, content: string[] }[],
  },
  /*技能特长、兴趣爱好、自我评价、荣誉证书*/
  externals: {
    title?: string,
    content: string[],
  }[]
}

export const DEMO_RESUME_DATA: iResume = {
  "title": "个人简历",
  "primary": "#4e7282",
  "secondary": "#c19f67",
  "avatar": "http://110.42.233.30/web/upload_file/20250519164713_0196e7b9-c2be-71ad-94a9-42fbea3d336c/work_avatar.png",
  "basicInfo": {
    "title": "基本信息",
    "data": [
      {
        "label": "姓名",
        "type": "FullName",
        "val": "张三",
        "icon": "ri-book-open-line"
      },
      {
        "label": "年龄",
        "type": "Age",
        "val": "30岁",
        "icon": "ri-calendar-schedule-line"
      },
      {
        "label": "工作年限",
        "type": "YearsOfWorking",
        "val": "7年",
        "icon": "ri-message-2-line"
      },
      {
        "label": "意向工作",
        "type": "IntentPosition",
        "val": "AI前端开发工程师",
        "icon": "ri-tools-line"
      },
      {
        "label": "意向城市",
        "type": "IntentCity",
        "val": "北京/上海/深圳",
        "icon": "ri-community-line"
      },
      {
        "label": "意向薪资",
        "type": "IntentSalary",
        "val": "面议",
        "icon": "ri-money-cny-circle-line"
      },
      {
        "label": "入职时间",
        "type": "EntryTime",
        "val": "一个月内入场",
        "icon": "ri-briefcase-4-line"
      },
      {
        "label": "电话号码",
        "type": "PhoneNumber",
        "val": "15800000000",
        "icon": "ri-smartphone-line"
      },
      {
        "label": "邮箱",
        "type": "Email",
        "val": "zhangsan@163.com",
        "icon": "ri-mail-line"
      },
      {
        "label": "最高学历",
        "type": "Qualification",
        "val": "上海交通大学（本科）",
        "icon": "ri-graduation-cap-line"
      }
    ]
  },
  "education": {
    "title": "教育经历",
    "data": [
      {
        "time": "2019-07 ~ 2020-01",
        "school": "上海交通大学",
        "program": "工商管理(本科)",
        "content": [
          "专业成绩：GPA 3.66/4 （专业前5%）",
          "主修课程：基础会计学、货币银行学、统计学、经济法概论、财务会计学、管理学原理、组织行为学、市场营销学、国际贸易理论、国际贸易实务、人力资源开发与管理、财务管理学、企业经营战略概论、质量管理学、西方经济学等等。"
        ]
      }
    ]
  },
  "experience": {
    "title": "工作经历",
    "data": [
      {
        "time": "2022-03 ~ 至今",
        "company": "星耀智联科技有限公司",
        "role": "AI 前端开发工程师",
        "content": [
          "主导基于 TensorFlow.js 的智能图像标注前端系统开发，实现模型实时预测与标注交互，提升标注效率 40%",
          "运用 React+D3.js 搭建 AI 算法可视化分析平台，完成数据动态展示与模型训练过程可视化",
          "优化 WebGL 三维渲染性能，实现 AI 生成 3D 场景的流畅交互，降低内存占用 35%"
        ]
      },
      {
        "time": "2020-06 ~ 2022-02",
        "company": "云启智创科技有限公司",
        "role": "高级 AI 前端开发工程师",
        "content": [
          "负责智能客服系统前端开发，集成 NLP 对话引擎，实现多轮对话交互及意图识别可视化展示",
          "基于 Vue.js 开发 AI 辅助编程工具前端，通过代码片段智能推荐功能，帮助开发者提升编码效率",
          "参与搭建 AI 驱动的个性化推荐前端模块，实现用户行为数据实时分析与推荐结果动态展示"
        ]
      },
      {
        "time": "2018-09 ~ 2020-05",
        "company": "智创未来科技有限公司",
        "role": "AI 前端开发工程师",
        "content": [
          "完成 AI 人脸识别门禁系统的前端界面开发，实现移动端与 PC 端多平台适配",
          "运用 HTML5+CSS3 开发 AR 试衣镜前端交互功能，结合 AI 人体姿态识别技术，提升用户试穿体验",
          "协助后端优化 AI 模型 API 接口，设计前端数据请求与响应机制，保障数据传输稳定性"
        ]
      }
    ]
  },
  "externals": [
    {
      "title": "技能特长",
      "content": [
        "前端开发技术：熟练掌握 React、Vue.js 等主流前端框架，能够高效构建响应式 Web 应用；精通 HTML5、CSS3，具备出色的页面布局与交互设计能力，可实现 AR 试衣镜等复杂交互功能。",
        "AI 技术融合：熟悉 TensorFlow.js、PyTorch.js 等 AI 框架，擅长将 AI 模型集成到前端系统，如主导智能图像标注系统开发，实现模型实时预测与交互，提升业务效率。",
        "数据可视化：精通 D3.js、ECharts 等可视化库，能够搭建 AI 算法可视化分析平台，将复杂的模型训练过程和数据以直观的方式呈现，助力业务决策。",
        "性能优化：具备 WebGL 三维渲染性能优化经验，能降低内存占用、提升渲染流畅度；擅长通过代码优化、资源加载策略调整等方式，提升前端应用整体性能。",
        "跨平台开发：熟练进行移动端与 PC 端多平台适配开发，确保 AI 应用在不同设备上均有良好的用户体验，如完成 AI 人脸识别门禁系统的多端适配。",
        "全栈协作：熟悉后端 API 设计规范，能够与后端团队协作优化 AI 模型接口，设计高效的数据请求与响应机制，保障前后端数据传输稳定。",
        "工具与框架应用：熟练使用 Git 进行版本控制，熟悉 Webpack 等构建工具；了解 Node.js，可进行前端工程化开发与部署，提升开发效率。"
      ]
    },
    {
      "title": "兴趣爱好",
      "content": [
        "热衷于研究前沿前端技术（如 WebAssembly、Server-Sent Events）和 AI 框架更新，定期在 GitHub 上参与开源项目，分享 AI 前端组件封装经验。",
        "喜欢通过技术博客（如 Medium、SegmentFault）记录 AI 与前端结合的实践案例，例如 “如何用 Three.js 实现 AI 生成 3D 模型的交互式展示”。",
        "制作 AI 前端开发相关的短视频教程，讲解 “如何快速搭建 AI 图像标注工具前端” 等实用技能，累计播放量超 10 万次。",
        "喜欢骑行、徒步等户外活动，用 GoPro 记录沿途风景并尝试用 AI 图像算法（如风格迁移）进行二次创作，生成 “赛博朋克风” 或 “油画风” 影像。"
      ]
    },
    {
      "title": "自我评价",
      "content": [
        "深耕 AI 与前端融合领域：拥有 5 年 AI 前端开发经验，熟练运用 React、Vue.js 等主流框架，精通 TensorFlow.js、PyTorch.js 等 AI 技术，主导开发智能图像标注系统、AI 算法可视化平台等项目，通过技术优化使业务效率提升 30% 以上，具备将复杂 AI 模型转化为前端交互应用的实战能力。",
        "创新驱动与持续学习型人才：关注行业前沿技术，积极探索 WebAssembly、Server-Sent Events 等新特性，并应用于实际开发；热衷开源与技术分享，在 GitHub 贡献 AI 前端组件，于技术社区发表多篇实践文章，兼具技术攻坚与知识传播能力。",
        "团队协作与问题解决能手：在跨部门协作中表现突出，能快速理解业务需求并转化为技术方案；面对 AI 前端开发中的复杂问题（如模型实时交互延迟），善于分析定位并提出有效解决方案，推动项目高效落地，多次获得团队与客户认可。"
      ]
    }
  ]
};

import React from "react";
import {AppstoreAddOutlined, BranchesOutlined, CommentOutlined, FileSearchOutlined, HeartOutlined, PaperClipOutlined, ProductOutlined, ScheduleOutlined, ScissorOutlined, SmileOutlined} from "@ant-design/icons";

import {type AvatarProps, type GetProp,} from 'antd';
import {Prompts} from "@ant-design/x";
import UserOutlined from "@ant-design/icons/UserOutlined";

/*测试对话列表数据*/
export const ExampleConversationList = [
  {
    key: 'default-0',
    label: 'Ant Design X 是什么？',
    group: '今天',
  },
  {
    key: 'default-1',
    label: '如何快速安装并导入组件？',
    group: '今天',
  },
  {
    key: 'default-2',
    label: '新的AGI混合交互？',
    group: '以前',
  },
];

/*测试热点列表数据*/
export const ExampleTopicList = {
  key: '1',
  label: '热点话题',
  children: [
    {
      key: '1-1',
      description: 'Ant Design X 有哪些升级？',
      icon: <span style={{ color: '#f93a4a', fontWeight: 700 }}>1</span>,
    },
    {
      key: '1-2',
      description: '新的 AGI 混合界面',
      icon: <span style={{ color: '#ff6565', fontWeight: 700 }}>2</span>,
    },
    {
      key: '1-3',
      description: 'Ant Design X 包含哪些组件？',
      icon: <span style={{ color: '#ff8f1f', fontWeight: 700 }}>3</span>,
    },
    {
      key: '1-4',
      description: '来探索 AI 时代的新设计范式',
      icon: <span style={{ color: '#00000040', fontWeight: 700 }}>4</span>,
    },
    {
      key: '1-5',
      description: '如何快速安装和导入组件？',
      icon: <span style={{ color: '#00000040', fontWeight: 700 }}>5</span>,
    },
  ],
};


/*测试指引数据*/
export const ExampleGuideList = {
  key: '2',
  label: '设计指南',
  children: [
    {
      key: '2-1',
      icon: <HeartOutlined/>,
      label: '意图',
      description: 'AI理解用户需求并提供解决方案。',
    },
    {
      key: '2-2',
      icon: <SmileOutlined/>,
      label: '角色',
      description: 'AI的公共形象和人设',
    },
    {
      key: '2-3',
      icon: <CommentOutlined/>,
      label: '对话',
      description: 'AI如何以用户理解的方式表达自己',
    },
    {
      key: '2-4',
      icon: <PaperClipOutlined/>,
      label: '界面',
      description: 'AI平衡"聊天"和"执行"行为。',
    },
  ],
};


/*测试对话框提示词数据*/
export const ExampleSenderPrompts: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: '更新',
    icon: <ScheduleOutlined/>,
  },
  {
    key: '2',
    description: '组件',
    icon: <ProductOutlined/>,
  },
  {
    key: '3',
    description: '指引',
    icon: <FileSearchOutlined/>,
  },
  {
    key: '4',
    description: '安装',
    icon: <AppstoreAddOutlined/>,
  },
];

export const ExampleUserAvatar: AvatarProps = {
  icon: <UserOutlined/>,
  style: {
    color: '#f56a00',
    backgroundColor: '#fde3cf',
  }
};

export const ExampleBotAvatar: AvatarProps = {
  icon: <UserOutlined/>,
  style: {
    color: '#fff',
    backgroundColor: '#87d068',
  }
};

export const ExampleToolAvatar: AvatarProps = {
  icon: <ScissorOutlined/>,
  style: {
    color: '#1659ff',
    backgroundColor: '#e1e6fa',
  }
};
export const ExampleInterruptAvatar: AvatarProps = {
  icon: <BranchesOutlined/>,
  style: {
    color: '#7316ff',
    backgroundColor: '#eae1fa',
  }
};

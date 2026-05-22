/*对话框聊天消息列表中，消息的数据类型*/
import React from "react";
import {OpenAIFilled} from "@ant-design/icons";
import ScheduleOutlined from "@ant-design/icons/ScheduleOutlined";
import ProductOutlined from "@ant-design/icons/ProductOutlined";
import {iChatbotProps} from "../Chatbot/chatbot.utils";

export interface iChatBubbleDataType {
  /*发送消息的角色, user, assistant, system, tool*/
  role: string;
  /*消息内容*/
  content: string;
}

/*对话框中，会话列表每条会话的数据类型*/
export interface iChatConversationMeta {
  key: string,
  label: string,
  group: string,
}

/*示例会话数据*/
export const DEMO_CHAT_CONVERSATION_LIST: iChatConversationMeta[] = [{ key: '5', label: 'New session', group: 'Today', }, { key: '4', label: 'What has Ant Design X upgraded?', group: 'Today', }, { key: '3', label: 'New AGI Hybrid Interface', group: 'Today', }, { key: '2', label: 'How to quickly install and import components?', group: 'Yesterday', }, { key: '1', label: 'What is Ant Design X?', group: 'Yesterday', },];

/*输入框推荐选项值数据类型（在输入框中输入 / 就可以弹出推荐选项）*/
export interface iChatSuggestionMeta {
  label: string,
  value: string,
  icon?: React.ReactNode,
  children?: iChatSuggestionMeta[]
}

/*实例推荐选项值的选项数据*/
export const DEMO_CHAT_SUGGESTION_LIST: iChatSuggestionMeta[] = [
  { label: 'Write a report', value: 'report' },
  { label: 'Draw a picture', value: 'draw' },
  {
    label: 'Check some knowledge',
    value: 'knowledge',
    icon: <OpenAIFilled/>,
    children: [
      { label: 'About React', value: 'react' },
      { label: 'About Ant Design', value: 'antd' },
    ],
  },
];

/*示例对话框快速问题数据*/
export const DEMO_CHAT_QUESTIONS = [
  '如何快速填写一个表单内容？',
  '如何智能批量新建多条数据？',
  '如何对数据表格进行筛选排序？',
];

/*对话框Sender选项的数据类型，就是输入框上面那一排按钮*/
export interface iChatSenderMeta {
  label: string,
  content: string,
  icon: React.ReactNode;
}

/*示例Sender数据*/
export const DEMO_CHAT_SENDER_LIST = [
  { label: '表单填写', content: '如何快速填写表单？', icon: <ScheduleOutlined/> },
  { label: '智能查询', content: '如何智能生成复杂的筛选参数表达式？', icon: <ProductOutlined/> },
];

/*ChatCopilot组件参数类型*/
export interface iChatCopilotProps extends iChatbotProps {
  /*处理点击右上角关闭按钮动作*/
  handleClose?: () => void;
  /*快速问题*/
  fastQuestions?: string[] | null
  /*快速发送内容*/
  fastSenders?: iChatSenderMeta[] | null
  /*推荐选项*/
  fastSuggestions?: iChatSuggestionMeta[],
}

import {iBaseRecord} from "../../utils/BaseRecord";
import {MessageStatus} from "@ant-design/x/es/use-x-chat";
import {pathJoin} from "@peryl/utils/pathJoin";
import {Button} from "antd";
import {CopyOutlined, DislikeOutlined, LikeOutlined, ReloadOutlined} from "@ant-design/icons";
import React, {Dispatch} from "react";
import {ExampleBotAvatar, ExampleInterruptAvatar, ExampleToolAvatar, ExampleUserAvatar} from "./ChatPageExamples";
import {iAiConfig} from "../../utils/chatStream";
import {iConversationSaver} from "../ChatConversationSaver/iConversationSaver";

export interface iChatbotProps {
  /*用户的id，用来查询会话列表数据的时候，查询当前用户创建的会话数据*/
  userId?: string,

  mode:
    {
      /*第一种模式，纯前端调用，前端直接通过aiConfig调用模型服务，有暴露模型服务的apiKey的问题*/
      /*会话是通过cacheKey缓存到localStorage，cacheKey默认为页面pathname*/
      type: 'StaticFront',
      cacheKey?: string | false,
      aiConfig?: iAiConfig,
    } |
    {
      /*第二种模式，前端通过调用自身langServe接口实现，后端通过langServe代理转发到模型服务厂商接口，设置不同的langServeUrl实际上就是指定不同的模型*/
      /*cacheKey的行为与staticFront相同*/
      type: 'LangServe',
      cacheKey?: string | false,
      langServeUrl?: string,
    } |
    {
      /*第三种模式，前端通过调用后端的LangGraph接口实现，这个接口目前固定使用doubao-think-pro模型，这个模型拥有更好的工具调用能力，其他模型不一定能够正确调用工具*/
      /*由于LangGraph自带有Postgres存储会话历史，所以不需要指定会话，会根据userId来查询对应的会话历史，如果要实现同一个用户不同类型场景下的会话，可以尝试给userId加特殊业务后缀*/
      type: 'LangGraph'
    }

  /*系统提示词*/
  systemPrompt?: string,
  /*处理AI返回的消息*/
  handleAiMessage?: (message: string, question: string) => void,
  /*处理会话，消息历史，发送消息的各种行为*/
  behavior?: Partial<iChatbotBehavior>,
  /*自定义header title*/
  headerTitle?: React.ReactNode,
  /*根节点样式*/
  style?: React.CSSProperties,
}

export interface iChatMessage {
  id?: string,
  role: 'assistant' | "user" | 'tool' | 'interrupt',
  content: any,
}

/*在Chatbot组件中，每条显示的消息的数据类型*/
export interface iChatBubbleMessage {
  status: MessageStatus,
  message: Omit<iChatMessage, 'id'> & {
    id: string,
    tool_calls?: { id: string, name: string, type: string, args: any }[],
    tool_name?: string,
  }
}

/*LangGraph的graph.aget_state得到的消息列表数据类型*/
export interface iLangGraphMessage {
  id: string,
  content?: any,
  type: 'ai' | 'human' | 'tool'

  /*如果存在tool_calls，说明是一条ai返回的工具调用消息，对应type为ai*/
  tool_calls?: any[],

  /*如果是工具执行结果消息，则会有name以及tool_call_id，表明调用的工具的名称，以及本次tool_call的id，对应type为tool*/
  name?: string,
  tool_call_id?: string,
}

/*LangGraph的中断数据类型*/
export interface iLangGraphInterrupt {
  id: string,
  value: any
}

/*LangGraph的graph.aget_state得到的数据类型*/
export interface iChatGraphState {
  messages: iLangGraphMessage[],
  __interrupt__?: iLangGraphInterrupt[]
}

/*将LangGraph的graph.aget_state中的消息的role转化为Chatbox的role*/
export const MsgType2Role = {
  'AIMessageChunk': 'assistant',
  'ai': 'assistant',
  'human': 'user',
  'tool': 'tool',
} as const;

export const antdxLogo = pathJoin(__webpack_public_path__, 'images/antdx-logo.svg');
export const antdxRobot = pathJoin(__webpack_public_path__, 'images/antdx-robot.webp');

/*为了能够更好地渲染每条消息数据，这里将不同类型的消息比如带有tool_call信息的消息，都格式化为content字符串展示*/
export const formatChatMessageContent = (chatMessage: iChatBubbleMessage) => {
  if (chatMessage.message.tool_calls?.length) {
    return [
      chatMessage.message.content,
      chatMessage.message.tool_calls.map(item => {
        const contentList: string[] = [`调用工具：${item.name}`];
        if (Object.keys(item.args).length) {contentList.push(`工具参数：${JSON.stringify(item.args)}`);}
        return contentList.join('\n\n');
      }).join('\n\n')
    ].filter(Boolean).join('，');
  }

  if (chatMessage.message.role === 'tool') {
    if (typeof chatMessage.message.content === "string") {
      if (chatMessage.message.content.slice(0, 1) === '[' && chatMessage.message.content.slice(-1) === ']') {
        return JSON.parse(chatMessage.message.content);
      }
      return `工具「${chatMessage.message.tool_name}」执行结果：${chatMessage.message.content}`;
    } else {
      return chatMessage.message.content;
    }
  }

  return chatMessage.message.content;
};

/*将LangGraph的消息转化为Chatbot的消息*/
export function convertGraphMessageToChatMessage(graphMessage: iLangGraphMessage): iChatBubbleMessage {
  const message: iChatBubbleMessage['message'] = {
    id: graphMessage.id,
    role: MsgType2Role[graphMessage.type],
    content: graphMessage.content,
  };

  if (graphMessage.tool_calls?.length) {
    message.tool_calls = graphMessage.tool_calls;
  }

  if (graphMessage.type === 'tool') {
    message.tool_name = graphMessage.name;
  }

  return {
    status: 'success',
    message,
  };
}

/*渲染chatbot每条消息底部的按钮*/
export function ChatMessageFooter() {
  return (
    <div style={{ display: 'flex' }}>
      <Button type="text" size="small" icon={<ReloadOutlined/>}/>
      <Button type="text" size="small" icon={<CopyOutlined/>}/>
      <Button type="text" size="small" icon={<LikeOutlined/>}/>
      <Button type="text" size="small" icon={<DislikeOutlined/>}/>
    </div>
  );
}

/*chatbot中，每种消息角色的头像*/
export const Role2Avatar = {
  user: ExampleUserAvatar,
  assistant: ExampleBotAvatar,
  tool: ExampleToolAvatar,
  interrupt: ExampleInterruptAvatar,
};

/*每条会话数据类型*/
export interface iConversationRecord extends Partial<iBaseRecord> {
  title?: string;
}

/*Chatbot不同模式下的行为定义类型*/
export interface iChatbotBehavior {
  /*会话存储器*/
  converseSaver: iConversationSaver,
  /*发送消息*/
  sendMessage: (param: {
    userId: string, /*当前会话用户的id*/
    conversationId: string, /*会话id*/
    token: string, /*请求访问令牌*/
    systemPrompt: string | undefined,/*组件得到的系统提示词参数*/
    handleAiMessage?: undefined | ((message: string, question: string) => void),/*处理回复消息*/
    humanMessage: { role: 'user', content: string, id: string }, /*本次对话用户的问题*/
    setMessages: Dispatch<React.SetStateAction<iChatBubbleMessage[]>>, /*设置消息列表数据 */
    setTempMessage: Dispatch<React.SetStateAction<iChatBubbleMessage | null>>, /*设置临时消息数据*/
    setInterruptValue: Dispatch<React.SetStateAction<Record<string, any> | null>>, /*设置中断数据*/
    getNewestMessages: () => Promise<iChatBubbleMessage[]>, /*获取当前会话最新的消息列表数据*/
    getNewestTempMessage: () => Promise<iChatBubbleMessage | null>, /*获取当前会话最新的临时消息数据*/
    loading: () => (() => void), /*调用这个loading函数来开启对话框的loading状态，会返回一个清理副作用函数，调用可以关闭loading状态*/
    abortController: AbortController, /*取消请求控制器*/
    converseSaver: iConversationSaver, /*会话存储器*/
    onFinish: (fullText: string) => Promise<void>,/*触发调用结束动作*/
  }) => void | Promise<void>,
}

/*Chatbot组件内部，props类型*/
export type iChatbotInnerProps = Omit<iChatbotProps, 'userId' | 'behavior'> & { userId: string, behavior: iChatbotBehavior }

import React, {useImperativeHandle} from 'react';
import {iChatCopilotProps} from "../ChatPublic/chat-public.utils";
import {useChatCopilotStyle} from "./useChatCopilotStyles";
import {iChatCopilotHeader, useChatCopilotHeader} from "./useChatCopilotHeader";
import {iChatCopilotSender, useChatCopilotSender} from "./useChatCopilotSender";
import {iChatbotState, useChatbotState} from "../Chatbot/useChatbotState";
import {iChatbotConversation, useChatbotConversation} from "../Chatbot/useChatbotConversation";
import {iChatbotMessages, useChatbotMessages} from "../Chatbot/useChatbotMessages";
import {iChatbotRequest, useChatbotRequest} from "../Chatbot/useChatbotRequest";
import {iChatbotVoiceRecorder, useChatbotVoiceRecorder} from "../Chatbot/useChatbotVoiceRecorder";
import {iChatCopilotBody, useChatCopilotBody} from "./useChatCopilotBody";
import {useChatbotProps} from "../Chatbot/useChatbotProps";
import './ChatCopilot.scss';


export const ChatCopilot = React.forwardRef<iChatCopilotInstance, iChatCopilotProps>((_props: iChatCopilotProps, ref) => {

  /*组件样式*/
  const copilotStyle = useChatCopilotStyle();

  const props = useChatbotProps(_props);

  /*组件内部状态*/
  const chatbotState = useChatbotState();

  /*会话管理*/
  const chatbotConversation = useChatbotConversation({ chatbotState, props });

  /*消息管理*/
  const chatbotMessages = useChatbotMessages({ chatbotConversation, props });

  /*处理请求*/
  const chatbotRequest = useChatbotRequest({ chatbotState, chatbotMessages, chatbotConversation, props });

  /*音频识别*/
  const chatbotVoiceRecorder = useChatbotVoiceRecorder({ props, chatbotState, chatbotRequest });

  /*头部内容*/
  const copilotHeader = useChatCopilotHeader({ copilotStyle, props, chatbotState, chatbotConversation });

  /*输入框内容*/
  const copilotSender = useChatCopilotSender({ copilotStyle, props, chatbotState, chatbotRequest });

  /*对话内容*/
  const copilotBody = useChatCopilotBody({ copilotStyle, props, chatbotMessages, chatbotRequest, chatbotConversation });

  const ins: iChatCopilotInstance = {
    state: chatbotState,
    conversation: chatbotConversation,
    messages: chatbotMessages,
    request: chatbotRequest,
    voiceRecorder: chatbotVoiceRecorder,
    header: copilotHeader,
    sender: copilotSender,
    body: copilotBody,
  };

  useImperativeHandle(ref, () => ins);

  return (
    <div className={'chat-copilot ' + copilotStyle.styles.copilotChat} style={{ width: '100%' }}>
      {/** 对话区 - header */}
      {copilotHeader.chatHeaderContent}

      {/** 对话区 - 消息列表 */}
      {copilotBody.messageListContent}

      {/** 对话区 - 输入框 */}
      {copilotSender.sendBodyContent}
    </div>
  );
});

export interface iChatCopilotInstance {
  state: iChatbotState,
  conversation: iChatbotConversation,
  messages: iChatbotMessages,
  request: iChatbotRequest,
  voiceRecorder: iChatbotVoiceRecorder,
  header: iChatCopilotHeader,
  sender: iChatCopilotSender,
  body: iChatCopilotBody,
}
